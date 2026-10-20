import { ChangeDetectionStrategy, Component, DestroyRef, ElementRef, computed, effect, inject, input, signal, untracked, viewChild } from '@angular/core';
import { NavigationEnd, Router } from '@angular/router';
import { filter } from 'rxjs';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ToastService } from '../../../core/toast/toast.service';
import { AuthService } from '../../../core/auth/auth.service';
import { ThemeService } from '../../../core/theme/theme.service';
import { TranslatePipe } from '../../../core/i18n/translate.pipe';
import { WorkspaceShellState } from '../../../core/workspace/workspace-shell.state';
import { WS_HOME, visibleGroups } from '../../../core/workspace/workspace-nav';
import { WorkspaceNotificationRepository } from '../../../core/mock-api/workspace-notification.repository';
import { LangSwitchComponent } from '../lang-switch/lang-switch.component';
import { MofFiIconComponent } from '../mof-fi-icon/mof-fi-icon.component';
import { MofIconButtonComponent } from '../mof-icon-button/mof-icon-button.component';
import { HeaderSearchComponent, SearchShortcut } from '../portal-header/header-search/header-search.component';
import { HeaderNotificationsComponent } from '../portal-header/header-notifications/header-notifications.component';
import { HeaderPrefsComponent } from '../portal-header/header-prefs/header-prefs.component';
import { WorkspaceSidebarComponent } from './workspace-sidebar/workspace-sidebar.component';

/** Breakpoint drawer (khớp SCSS). */
export const WS_DRAWER_QUERY = '(max-width: 1023.98px)';

/**
 * Khung WORKSPACE dùng chung cho /workspace/** và /admin: header 1 hàng sticky (menu, tìm kiếm pill Ctrl K,
 * giao diện, chuông, VI/EN, user pill + menu) + sidebar rail/mở rộng (lưu localStorage) + vùng nội dung.
 * < 1024px: sidebar thành drawer off-canvas (scrim, focus trap, Esc, overflow:clip, focus preventScroll).
 * Trang chỉ truyền `title`/`eyebrow` + nội dung; KHÔNG thiết kế lại nội dung trang.
 */
@Component({
  selector: 'app-workspace-shell',
  imports: [
    TranslatePipe,
    LangSwitchComponent,
    MofFiIconComponent,
    MofIconButtonComponent,
    HeaderSearchComponent,
    HeaderNotificationsComponent,
    HeaderPrefsComponent,
    WorkspaceSidebarComponent,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './workspace-shell.component.html',
  styleUrl: './workspace-shell.component.scss',
  host: { '(window:scroll)': 'onScroll()' },
})
export class WorkspaceShellComponent {
  readonly title = input.required<string>();
  readonly eyebrow = input('Workspace');

  readonly auth = inject(AuthService);
  readonly theme = inject(ThemeService);
  readonly state = inject(WorkspaceShellState);
  readonly notifs = inject(WorkspaceNotificationRepository);
  private readonly router = inject(Router);
  private readonly toast = inject(ToastService);

  readonly mobile = signal(this.matchDrawer());
  readonly scrolled = signal(false);
  readonly userOpen = signal(false);
  private readonly menuBtn = viewChild<ElementRef<HTMLButtonElement>>('menuBtn');
  private readonly sideRoot = viewChild<ElementRef<HTMLElement>>('sideRoot');

  readonly shortcuts = computed<SearchShortcut[]>(() => [
    { labelKey: WS_HOME.labelKey, icon: WS_HOME.icon, route: WS_HOME.route },
    ...visibleGroups(this.auth.user()?.role ?? null).flatMap((g) =>
      g.items.map((i) => ({ labelKey: i.labelKey, icon: i.icon, route: i.route, queryParams: i.query })),
    ),
  ]);

  readonly roleKey = computed(() => `role.${this.auth.user()?.role ?? 'reception'}`);

  constructor() {
    const mq = typeof window !== 'undefined' && window.matchMedia ? window.matchMedia(WS_DRAWER_QUERY) : null;
    const onMq = () => {
      this.mobile.set(!!mq?.matches);
      if (!mq?.matches) this.closeDrawer(false);
    };
    mq?.addEventListener?.('change', onMq);
    inject(DestroyRef).onDestroy(() => {
      mq?.removeEventListener?.('change', onMq);
      document.documentElement.classList.remove('mof-scroll-lock');
    });
    this.router.events
      .pipe(
        filter((e) => e instanceof NavigationEnd),
        takeUntilDestroyed(),
      )
      .subscribe(() => {
        this.closeDrawer(false);
        this.userOpen.set(false);
      });
    // Drawer mở → khoá cuộn trang + focus nút đóng (không cuộn container).
    effect(() => {
      const open = this.state.drawerOpen();
      untracked(() => {
        document.documentElement.classList.toggle('mof-scroll-lock', open);
        if (open) {
          setTimeout(() => this.sideRoot()?.nativeElement.querySelector<HTMLElement>('[data-drawer-close]')?.focus({ preventScroll: true }), 0);
        }
      });
    });
    this.onScroll();
  }

  /** Nút menu: desktop = rail ↔ mở rộng; mobile = mở drawer. */
  toggleSidebar(): void {
    if (this.mobile()) {
      this.state.drawerOpen.set(true);
    } else {
      this.state.toggleCollapsed();
    }
  }

  closeDrawer(restoreFocus = true): void {
    if (!this.state.drawerOpen()) return;
    this.state.drawerOpen.set(false);
    if (restoreFocus) this.menuBtn()?.nativeElement.focus({ preventScroll: true });
  }

  /** Esc đóng; Tab bị giữ trong drawer. */
  onDrawerKey(e: KeyboardEvent): void {
    if (!this.mobile() || !this.state.drawerOpen()) return;
    if (e.key === 'Escape') {
      e.preventDefault();
      this.closeDrawer();
      return;
    }
    if (e.key !== 'Tab') return;
    const root = this.sideRoot()?.nativeElement;
    const items = Array.from(
      root?.querySelectorAll<HTMLElement>('a[href], button:not([disabled])') ?? [],
    ).filter((el) => !el.closest('[inert]') && (el.offsetParent !== null || el === document.activeElement));
    if (!items.length) return;
    const first = items[0];
    const last = items[items.length - 1];
    if (e.shiftKey && document.activeElement === first) {
      e.preventDefault();
      last.focus();
    } else if (!e.shiftKey && document.activeElement === last) {
      e.preventDefault();
      first.focus();
    }
  }

  toggleUser(): void {
    this.userOpen.update((v) => !v);
  }

  onUserFocusOut(e: FocusEvent): void {
    if (!(e.currentTarget as HTMLElement).contains(e.relatedTarget as Node | null)) this.userOpen.set(false);
  }

  onScroll(): void {
    const s = typeof window !== 'undefined' && window.scrollY > 4;
    if (s !== this.scrolled()) this.scrolled.set(s);
  }

  skipToMain(e: Event): void {
    e.preventDefault();
    document.getElementById('ws-main')?.focus({ preventScroll: false });
  }

  logout(): void {
    this.userOpen.set(false);
    this.auth.logout();
    this.toast.info('toast.loggedOut');
    void this.router.navigateByUrl('/portal');
  }

  private matchDrawer(): boolean {
    return typeof window !== 'undefined' && !!window.matchMedia?.(WS_DRAWER_QUERY).matches;
  }
}
