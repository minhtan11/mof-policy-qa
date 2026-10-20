import { ChangeDetectionStrategy, Component, DestroyRef, ElementRef, computed, inject, signal, viewChild } from '@angular/core';
import { NavigationEnd, Router, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { toSignal } from '@angular/core/rxjs-interop';
import { filter, map } from 'rxjs';
import { TranslatePipe } from '../../../core/i18n/translate.pipe';
import { I18nService } from '../../../core/i18n/i18n.service';
import { AuthService } from '../../../core/auth/auth.service';
import { ThemeService } from '../../../core/theme/theme.service';
import { MofIconComponent } from '../mof-icon/mof-icon.component';
import { MofFiIconComponent } from '../mof-fi-icon/mof-fi-icon.component';
import { MofInputComponent } from '../mof-input/mof-input.component';
import { LangSwitchComponent } from '../lang-switch/lang-switch.component';

interface NavChild {
  key: string;
  route: string;
  fragment?: string;
}

interface NavItem {
  key: string;
  route: string;
  fragment?: string;
  icon?: string;
  /** Icon hàng accordion trong drawer mobile (Flaticon UIcons slug). */
  drawerIcon?: string;
  children?: NavChild[];
}

/**
 * Shell header dùng chung cho /portal/**, bám mockup Cổng TTĐT Bộ Tài chính:
 * thanh tiện ích mảnh (ngày · sơ đồ · hỗ trợ · theme · đăng nhập), hàng nhận diện + tìm kiếm + VI|EN,
 * menu chính trải đều có dropdown. Các route nghiệp vụ hiện có nằm trong dropdown "Dịch vụ công".
 * Dưới 1024px menu chuyển thành panel dọc (nút menu) để không tràn ngang.
 */
@Component({
  selector: 'app-portal-header',
  imports: [RouterLink, FormsModule, TranslatePipe, MofIconComponent, MofFiIconComponent, MofInputComponent, LangSwitchComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './portal-header.component.html',
  styleUrl: './portal-header.component.scss',
})
export class PortalHeaderComponent {
  readonly theme = inject(ThemeService);
  readonly i18n = inject(I18nService);
  private readonly router = inject(Router);

  readonly auth = inject(AuthService);
  readonly userOpen = signal(false);
  readonly keyword = signal('');
  readonly menuOpen = signal(false);
  /** Section accordion đang mở trong drawer (chỉ một). */
  readonly expanded = signal<string | null>(null);
  private readonly drawerEl = viewChild<ElementRef<HTMLElement>>('drawer');
  private readonly closeBtn = viewChild<ElementRef<HTMLButtonElement>>('closeBtn');
  private readonly menuBtn = viewChild<ElementRef<HTMLButtonElement>>('menuBtn');
  /** Mục menu đang mở dropdown (desktop). Dưới 1024px submenu hiển thị tĩnh trong panel dọc. */
  readonly openKey = signal<string | null>(null);
  private readonly mq = window.matchMedia?.('(min-width: 1024px)');
  readonly desktop = signal(this.mq?.matches ?? true);

  private readonly url = toSignal(
    this.router.events.pipe(
      filter((e) => e instanceof NavigationEnd),
      map(() => this.router.url),
    ),
    { initialValue: this.router.url },
  );

  readonly today = computed(() =>
    new Intl.DateTimeFormat(this.i18n.locale() === 'vi' ? 'vi-VN' : 'en-GB', {
      weekday: 'long',
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    }).format(new Date()),
  );

  readonly navItems: NavItem[] = [
    { key: 'nav.home', route: '/portal', icon: 'home' },
    {
      key: 'portal.nav.about',
      drawerIcon: 'info',
      route: '/portal',
      fragment: 'lien-he',
      children: [
        { key: 'portal.nav.aboutPortal', route: '/portal', fragment: 'lien-he' },
        { key: 'nav.guide', route: '/portal/tra-cuu' },
      ],
    },
    {
      key: 'portal.nav.news',
      drawerIcon: 'newspaper',
      route: '/portal',
      fragment: 'tin-tuc',
      children: [
        { key: 'portal.news.title', route: '/portal', fragment: 'tin-tuc' },
        { key: 'portal.notice.title', route: '/portal', fragment: 'thong-bao' },
      ],
    },
    {
      key: 'portal.nav.legal',
      drawerIcon: 'balance-scale-left',
      route: '/portal/tra-cuu',
      children: [{ key: 'portal.nav.legalLookup', route: '/portal/tra-cuu' }],
    },
    {
      key: 'portal.nav.services',
      drawerIcon: 'apps',
      route: '/portal/hoi-dap',
      children: [
        { key: 'nav.ask', route: '/portal/hoi-dap' },
        { key: 'nav.search', route: '/portal/tra-cuu' },
        { key: 'nav.myQuestions', route: '/portal/cau-hoi-cua-toi' },
        { key: 'login.vneid', route: '/portal/login/vneid' },
      ],
    },
    {
      key: 'portal.nav.budget',
      drawerIcon: 'chart-pie',
      route: '/portal',
      fragment: 'ngan-sach',
      children: [{ key: 'portal.budget.title', route: '/portal', fragment: 'ngan-sach' }],
    },
    { key: 'portal.nav.contact', drawerIcon: 'phone-call', route: '/portal', fragment: 'lien-he' },
  ];

  private readonly path = computed(() => this.url().split(/[?#]/)[0]);
  private readonly fragment = computed(() => {
    const u = this.url();
    const i = u.indexOf('#');
    return i < 0 ? null : u.slice(i + 1);
  });

  /** Chỉ đúng route hiện tại (path + fragment) mới sáng — tránh nhiều mục '/portal#...' cùng sáng. */
  isChildActive(c: NavChild): boolean {
    return this.path() === c.route && (c.fragment ?? null) === this.fragment();
  }

  isLeafActive(item: NavItem): boolean {
    return this.path() === item.route && (item.fragment ?? null) === this.fragment();
  }

  openMenu(): void {
    const active = this.navItems.find((n) => n.children && (this.isActive(n) || n.children.some((c) => this.isChildActive(c))));
    this.expanded.set(active?.key ?? null);
    this.menuOpen.set(true);
    document.documentElement.classList.add('mof-scroll-lock');
    // preventScroll: focus không được cuộn container (nguyên nhân drawer 'giật' khi mở).
    setTimeout(() => this.closeBtn()?.nativeElement.focus({ preventScroll: true }), 0);
  }

  closeMenu(restoreFocus = true): void {
    if (!this.menuOpen()) {
      return;
    }
    this.menuOpen.set(false);
    document.documentElement.classList.remove('mof-scroll-lock');
    if (restoreFocus) {
      this.menuBtn()?.nativeElement.focus({ preventScroll: true });
    }
  }

  toggleSection(key: string): void {
    this.expanded.set(this.expanded() === key ? null : key);
  }

  /** Esc đóng; Tab/Shift+Tab bị giữ trong drawer (focus trap). */
  onDrawerKey(e: KeyboardEvent): void {
    if (e.key === 'Escape') {
      e.preventDefault();
      this.closeMenu();
      return;
    }
    if (e.key !== 'Tab') {
      return;
    }
    const root = this.drawerEl()?.nativeElement;
    if (!root) {
      return;
    }
    const items = Array.from(
      root.querySelectorAll<HTMLElement>('a[href]:not([tabindex="-1"]), button:not([disabled]):not([tabindex="-1"]), input:not([disabled])'),
    ).filter((el) => el.offsetParent !== null || el === document.activeElement);
    if (!items.length) {
      return;
    }
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

  /** Mục cha sáng khi URL hiện tại khớp route của chính nó hoặc một mục con (bỏ qua anchor trên trang chủ). */
  isActive(item: NavItem): boolean {
    const path = this.url().split(/[?#]/)[0];
    if (item.icon) {
      return path === '/portal';
    }
    const routes = [item, ...(item.children ?? [])].filter((c) => !c.fragment).map((c) => c.route);
    return routes.some((r) => r !== '/portal' && path.startsWith(r));
  }

  constructor() {
    const onChange = (e: MediaQueryListEvent) => {
      this.desktop.set(e.matches);
      if (e.matches) {
        this.closeMenu(false);
      }
    };
    const nav = this.router.events.pipe(filter((e) => e instanceof NavigationEnd)).subscribe(() => this.closeMenu(false));
    this.mq?.addEventListener?.('change', onChange);
    inject(DestroyRef).onDestroy(() => {
      this.mq?.removeEventListener?.('change', onChange);
      nav.unsubscribe();
      document.documentElement.classList.remove('mof-scroll-lock');
    });
  }

  isImage(avatar: string): boolean {
    return /[/.]/.test(avatar);
  }

  onUserFocusOut(e: FocusEvent): void {
    const host = e.currentTarget as HTMLElement;
    if (!host.contains(e.relatedTarget as Node | null)) {
      this.userOpen.set(false);
    }
  }

  logout(): void {
    this.userOpen.set(false);
    this.closeMenu(false);
    this.auth.logout();
    if (this.router.url.startsWith('/portal/cau-hoi-cua-toi')) {
      void this.router.navigateByUrl('/portal');
    }
  }

  search(): void {
    this.menuOpen.set(false);
    void this.router.navigate(['/portal/tra-cuu'], { queryParams: { q: this.keyword() || null } });
  }
}
