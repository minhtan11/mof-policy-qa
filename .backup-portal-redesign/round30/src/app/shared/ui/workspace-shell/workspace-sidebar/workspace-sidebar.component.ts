import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  ElementRef,
  Injector,
  afterNextRender,
  computed,
  effect,
  inject,
  input,
  output,
  signal,
  untracked,
  viewChild,
} from '@angular/core';
import { NavigationEnd, Router, RouterLink } from '@angular/router';
import { toSignal } from '@angular/core/rxjs-interop';
import { filter, map } from 'rxjs';
import { AuthService } from '../../../../core/auth/auth.service';
import { TranslatePipe } from '../../../../core/i18n/translate.pipe';
import { I18nService } from '../../../../core/i18n/i18n.service';
import { MockDbService } from '../../../../core/mock-api/mock-db.service';
import { AnchoredHandle, anchorFloating } from '../../../../core/overlay/floating';
import { WorkspaceShellState } from '../../../../core/workspace/workspace-shell.state';
import { WS_HOME, WS_SUPPORT_PHONE, WsNavGroup, WsNavItem, isItemActive, visibleGroups } from '../../../../core/workspace/workspace-nav';
import { MofFiIconComponent } from '../../mof-fi-icon/mof-fi-icon.component';

interface Tip {
  text: string;
  x: number;
  y: number;
}

/** Đọc path + query từ URL router (không cần ActivatedRoute của trang). */
function parseUrl(url: string): { path: string; query: Record<string, string> } {
  const [beforeHash] = url.split('#');
  const [path, qs = ''] = beforeHash.split('?');
  const query: Record<string, string> = {};
  new URLSearchParams(qs).forEach((v, k) => (query[k] = v));
  return { path: path || '/', query };
}

/**
 * Sidebar workspace — 2 chế độ (KHÔNG phải 2 sidebar):
 * - Rail (thu gọn, ~4.25rem): emblem, icon Tổng quan + icon mỗi nhóm (bấm → flyout menu qua core overlay, đặt bên phải),
 *   nút » nổi ở mép, icon hỗ trợ; tooltip cho mọi icon (một phần tử fixed dùng chung — không bị menu cuộn cắt).
 * - Mở rộng (~15.5rem): header thương hiệu + nút «, “Tổng quan” pill, nhóm có tiêu đề + nút chevron gập/mở,
 *   mục icon + nhãn + badge đếm (MockDbService), thẻ Hỗ trợ kỹ thuật; vùng menu cuộn độc lập.
 * Drawer (< 1024): luôn ở chế độ mở rộng; shell lo scrim/focus trap. Lọc theo vai trò; nhóm chứa route hiện tại tự mở.
 */
@Component({
  selector: 'app-workspace-sidebar',
  imports: [RouterLink, TranslatePipe, MofFiIconComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './workspace-sidebar.component.html',
  styleUrl: './workspace-sidebar.component.scss',
  host: {
    '[class.rail]': 'rail()',
    '[class.anim]': 'state.animating()',
    '(document:pointerdown)': 'onDocPointer($event)',
  },
})
export class WorkspaceSidebarComponent {
  readonly state = inject(WorkspaceShellState);
  private readonly auth = inject(AuthService);
  private readonly db = inject(MockDbService);
  private readonly i18n = inject(I18nService);
  private readonly router = inject(Router);
  private readonly injector = inject(Injector);

  /** true = drawer mobile (luôn mở rộng, có nút đóng). */
  readonly drawer = input(false);
  readonly closeDrawer = output<void>();

  readonly rail = computed(() => this.state.collapsed() && !this.drawer());
  readonly home = WS_HOME;
  readonly phone = WS_SUPPORT_PHONE;
  readonly phoneHref = `tel:${WS_SUPPORT_PHONE.replace(/\D/g, '')}`;
  readonly groups = computed(() => visibleGroups(this.auth.user()?.role ?? null));

  private readonly url = toSignal(
    this.router.events.pipe(
      filter((e): e is NavigationEnd => e instanceof NavigationEnd),
      map((e) => e.urlAfterRedirects),
    ),
    { initialValue: this.router.url },
  );
  private readonly loc = computed(() => parseUrl(this.url()));

  readonly counts = computed(() => {
    this.db.dossiers();
    return {
      all: this.db.activeQueue('all').length,
      new: this.db.activeQueue('new').length,
      processing: this.db.activeQueue('processing').length,
      'waiting-approval': this.db.activeQueue('waiting-approval').length,
    } as Record<string, number>;
  });

  readonly flyout = signal<WsNavGroup | null>(null);
  readonly tip = signal<Tip | null>(null);
  private flyHandle: AnchoredHandle | null = null;
  private flyTrigger: HTMLElement | null = null;
  private readonly flyEl = viewChild<ElementRef<HTMLElement>>('fly');
  private readonly menuEl = viewChild<ElementRef<HTMLElement>>('menu');

  constructor() {
    // Tự mở nhóm chứa route hiện tại (lưu luôn trạng thái mở).
    effect(() => {
      const g = this.activeGroup();
      if (g) untracked(() => this.state.setGroup(g.id, true));
    });
    // Đổi route / thoát rail → đóng flyout + tooltip.
    effect(() => {
      this.url();
      this.rail();
      untracked(() => {
        this.closeFlyout(false);
        this.tip.set(null);
      });
    });
    afterNextRender(() => {
      const m = this.menuEl()?.nativeElement;
      if (!m) return;
      m.scrollTop = this.state.menuScroll;
      // Mục đang mở nằm ngoài vùng nhìn (vd. admin → Người dùng) → cuộn tới, không animation.
      const act = m.querySelector<HTMLElement>('.item.active');
      if (act) {
        const top = act.getBoundingClientRect().top - m.getBoundingClientRect().top + m.scrollTop;
        if (top < m.scrollTop || top + act.offsetHeight > m.scrollTop + m.clientHeight) {
          m.scrollTop = Math.max(0, top - m.clientHeight / 2);
        }
      }
    });
    inject(DestroyRef).onDestroy(() => this.flyHandle?.destroy());
  }

  isActive(item: WsNavItem): boolean {
    const { path, query } = this.loc();
    return isItemActive(item, path, query);
  }

  readonly activeGroup = computed(() => this.groups().find((g) => g.items.some((i) => this.isActive(i))) ?? null);

  badge(item: WsNavItem): number | null {
    return item.badge ? (this.counts()[item.badge] ?? null) : null;
  }

  groupBadge(g: WsNavGroup): number {
    return g.items.reduce((s, i) => (i.badge && i.badge !== 'all' ? s + (this.counts()[i.badge] ?? 0) : s), 0);
  }

  open(g: WsNavGroup): boolean {
    return this.state.isGroupOpen(g.id);
  }

  navigated(): void {
    this.closeFlyout(false);
    if (this.drawer()) this.closeDrawer.emit();
  }

  // ---------- Tooltip (rail) ----------
  showTip(e: Event, key: string, params?: Record<string, string | number>): void {
    if (!this.rail() || this.flyout()) return;
    const r = (e.currentTarget as HTMLElement).getBoundingClientRect();
    this.tip.set({ text: this.i18n.t(key, params), x: r.right + 10, y: r.top + r.height / 2 });
  }

  hideTip(): void {
    this.tip.set(null);
  }

  onMenuScroll(e: Event): void {
    this.state.menuScroll = (e.target as HTMLElement).scrollTop;
    this.tip.set(null);
  }

  // ---------- Flyout (rail) ----------
  toggleFlyout(g: WsNavGroup, trigger: HTMLElement): void {
    if (this.flyout()?.id === g.id) {
      this.closeFlyout();
      return;
    }
    this.closeFlyout(false);
    this.tip.set(null);
    this.flyTrigger = trigger;
    this.flyout.set(g);
    afterNextRender(
      () => {
        const el = this.flyEl()?.nativeElement;
        if (!el || !this.flyTrigger) return;
        this.flyHandle = anchorFloating(this.flyTrigger, el, {
          strategy: 'portal',
          placement: 'inline-end',
          gap: 20,
          onAncestorScroll: () => this.closeFlyout(false),
          onReferenceHidden: () => this.closeFlyout(false),
        });
        el.querySelector<HTMLElement>('a')?.focus({ preventScroll: true });
      },
      { injector: this.injector },
    );
  }

  closeFlyout(restoreFocus = true): void {
    if (!this.flyout()) return;
    this.flyHandle?.destroy();
    this.flyHandle = null;
    this.flyout.set(null);
    if (restoreFocus) this.flyTrigger?.focus({ preventScroll: true });
  }

  onFlyKey(e: KeyboardEvent): void {
    const links = Array.from(this.flyEl()?.nativeElement.querySelectorAll<HTMLElement>('a') ?? []);
    const i = links.indexOf(document.activeElement as HTMLElement);
    if (e.key === 'Escape') {
      e.preventDefault();
      this.closeFlyout();
    } else if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
      e.preventDefault();
      const n = links.length;
      links[(i + (e.key === 'ArrowDown' ? 1 : -1) + n) % n]?.focus();
    } else if (e.key === 'Tab') {
      this.closeFlyout(false);
    }
  }

  onDocPointer(e: PointerEvent): void {
    if (!this.flyout()) return;
    const t = e.target as Node;
    if (this.flyEl()?.nativeElement.contains(t) || this.flyTrigger?.contains(t)) return;
    this.closeFlyout(false);
  }
}
