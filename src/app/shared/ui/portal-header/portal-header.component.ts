import { ChangeDetectionStrategy, Component, DestroyRef, ElementRef, afterNextRender, computed, effect, inject, signal, untracked, viewChild } from '@angular/core';
import { NavigationEnd, Router, RouterLink } from '@angular/router';
import { toSignal } from '@angular/core/rxjs-interop';
import { filter, map } from 'rxjs';
import { TranslatePipe } from '../../../core/i18n/translate.pipe';
import { I18nService } from '../../../core/i18n/i18n.service';
import { ToastService } from '../../../core/toast/toast.service';
import { AuthService } from '../../../core/auth/auth.service';
import { ThemeService } from '../../../core/theme/theme.service';
import { MofIconComponent } from '../mof-icon/mof-icon.component';
import { MofFiIconComponent } from '../mof-fi-icon/mof-fi-icon.component';
import { MofIconButtonComponent } from '../mof-icon-button/mof-icon-button.component';
import { HeaderSearchComponent } from './header-search/header-search.component';
import { HeaderNotificationsComponent } from './header-notifications/header-notifications.component';
import { HeaderPrefsComponent } from './header-prefs/header-prefs.component';
import { LangSwitchComponent } from '../lang-switch/lang-switch.component';
import { MofTooltipDirective } from '../mof-tooltip/mof-tooltip.directive';

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
  /** Tiền tố route làm mục này sáng (mỗi route chỉ thuộc MỘT mục → không bao giờ 2 mục cùng sáng). */
  activeFor?: string[];
}

/**
 * Shell header dùng chung cho /portal/**: MỘT hàng (~4.25rem, --mof-header-h) — nhận diện gọn | menu chính
 * (dropdown, mục thừa gom vào "Thêm") | nút tròn: tìm kiếm (command overlay), chuông thông báo, tài khoản
 * (kèm "Tuỳ chọn": giao diện, VI|EN, sơ đồ, hỗ trợ, ngày; cán bộ nội bộ có thêm «Không gian làm việc»)
 * hoặc menu cài đặt + Đăng nhập khi chưa đăng nhập.
 * Sticky; đổ bóng + blur khi cuộn. Dưới 1024px: drawer off-canvas (giữ nguyên).
 */
@Component({
  selector: 'app-portal-header',
  imports: [MofTooltipDirective, 
    RouterLink,
    TranslatePipe,
    MofIconComponent,
    MofFiIconComponent,
    MofIconButtonComponent,
    LangSwitchComponent,
    HeaderSearchComponent,
    HeaderNotificationsComponent,
    HeaderPrefsComponent,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './portal-header.component.html',
  styleUrl: './portal-header.component.scss',
})
export class PortalHeaderComponent {
  readonly theme = inject(ThemeService);
  readonly i18n = inject(I18nService);
  private readonly router = inject(Router);
  private readonly destroyRef = inject(DestroyRef);

  readonly auth = inject(AuthService);
  private readonly toast = inject(ToastService);
  readonly userOpen = signal(false);
  readonly menuOpen = signal(false);
  /** Section accordion đang mở trong drawer (chỉ một). */
  readonly expanded = signal<string | null>(null);
  private readonly drawerEl = viewChild<ElementRef<HTMLElement>>('drawer');
  private readonly closeBtn = viewChild<ElementRef<HTMLButtonElement>>('closeBtn');
  private readonly menuBtn = viewChild<ElementRef<HTMLButtonElement>>('menuBtn');
  private readonly notifs = viewChild(HeaderNotificationsComponent);
  private readonly search = viewChild(HeaderSearchComponent);
  /** Mục menu đang mở dropdown (desktop) — chỉ một key; mở panel khác phải đóng key này. */
  readonly openKey = signal<string | null>(null);
  private readonly mq = window.matchMedia?.('(min-width: 1024px)');
  readonly desktop = signal(this.mq?.matches ?? true);
  /** Số mục menu hiển thị trên hàng; phần còn lại vào "Thêm". */
  readonly visibleCount = signal(Number.MAX_SAFE_INTEGER);
  readonly scrolled = signal(false);
  private readonly navEl = viewChild<ElementRef<HTMLElement>>('nav');

  private readonly url = toSignal(
    this.router.events.pipe(
      filter((e) => e instanceof NavigationEnd),
      map(() => this.router.url),
    ),
    { initialValue: this.router.url },
  );

  readonly navItems: NavItem[] = [
    { key: 'nav.home', route: '/portal', icon: 'home' },
    {
      key: 'portal.nav.about',
      drawerIcon: 'info',
      route: '/portal',
      fragment: 'lien-he',
      /** Hướng dẫn có route riêng — không dùng chung /portal/tra-cuu. */
      activeFor: ['/portal/huong-dan'],
      children: [
        { key: 'portal.nav.aboutPortal', route: '/portal', fragment: 'lien-he' },
        { key: 'nav.guide', route: '/portal/huong-dan' },
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
      route: '/portal/van-ban',
      activeFor: ['/portal/van-ban'],
      children: [{ key: 'portal.nav.legalLookup', route: '/portal/van-ban' }],
    },
    {
      key: 'portal.nav.services',
      drawerIcon: 'apps',
      route: '/portal/hoi-dap',
      activeFor: ['/portal/hoi-dap', '/portal/tra-cuu', '/portal/cau-hoi-cua-toi', '/portal/ho-so'],
      children: [
        { key: 'nav.ask', route: '/portal/hoi-dap' },
        { key: 'nav.search', route: '/portal/tra-cuu' },
        { key: 'nav.myQuestions', route: '/portal/cau-hoi-cua-toi' },
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

  /** Mục cha sáng theo `activeFor` (trang chủ: đúng /portal không anchor). */
  isActive(item: NavItem): boolean {
    const path = this.path();
    if (item.icon) {
      return path === '/portal' && !this.fragment();
    }
    return (item.activeFor ?? []).some((r) => path.startsWith(r));
  }


  readonly overflowActive = computed(() => this.navItems.slice(this.visibleCount()).some((n) => this.isActive(n)));

  /**
   * Đo bề rộng các mục (mục bị gom vẫn đo được vì chỉ ẩn bằng visibility + absolute) và tính số mục vừa hàng.
   * Chạy khi nav đổi kích thước (ResizeObserver) và khi đổi ngôn ngữ.
   */
  measure(): void {
    const nav = this.navEl()?.nativeElement;
    if (!nav || !this.desktop()) {
      return;
    }
    const items = Array.from(nav.querySelectorAll<HTMLElement>('.nav-item:not(.more)'));
    const more = nav.querySelector<HTMLElement>('.nav-item.more');
    const widths = items.map((el) => el.getBoundingClientRect().width);
    const avail = nav.clientWidth;
    const total = widths.reduce((s, w) => s + w, 0);
    if (total <= avail || !avail) {
      this.visibleCount.set(items.length);
      return;
    }
    const room = avail - (more?.getBoundingClientRect().width || 72);
    let used = 0;
    let n = 0;
    while (n < widths.length && used + widths[n] <= room) {
      used += widths[n++];
    }
    this.visibleCount.set(Math.max(1, n));
  }

  constructor() {
    effect(() => {
      this.i18n.locale();
      untracked(() => requestAnimationFrame(() => this.measure()));
    });
    afterNextRender(() => {
      const nav = this.navEl()?.nativeElement;
      if (nav && typeof ResizeObserver !== 'undefined') {
        const ro = new ResizeObserver(() => this.measure());
        ro.observe(nav);
        this.destroyRef.onDestroy(() => ro.disconnect());
      }
      this.measure();
      void document.fonts?.ready.then(() => this.measure());
    });
    const onScroll = () => this.scrolled.set(window.scrollY > 4);
    window.addEventListener('scroll', onScroll, { passive: true });
    this.destroyRef.onDestroy(() => window.removeEventListener('scroll', onScroll));
    const onChange = (e: MediaQueryListEvent) => {
      this.desktop.set(e.matches);
      if (e.matches) {
        this.closeMenu(false);
      }
    };
    const nav = this.router.events.pipe(filter((e) => e instanceof NavigationEnd)).subscribe(() => this.closeMenu(false));
    this.mq?.addEventListener?.('change', onChange);
    this.destroyRef.onDestroy(() => {
      this.mq?.removeEventListener?.('change', onChange);
      nav.unsubscribe();
      document.documentElement.classList.remove('mof-scroll-lock');
    });
  }

  isImage(avatar: string): boolean {
    return /[/.]/.test(avatar);
  }

  /** Mở đúng một submenu nav; đóng user/chuông (không chồng panel). */
  openNav(key: string): void {
    this.openKey.set(key);
    this.userOpen.set(false);
    this.notifs()?.close();
  }

  /** Đóng submenu khi chuột/focus thật sự rời khỏi mục (relatedTarget còn trong mục → giữ). */
  leaveNav(key: string, e: MouseEvent | FocusEvent): void {
    if (this.openKey() !== key) {
      return;
    }
    const host = e.currentTarget as HTMLElement;
    const related = e.relatedTarget as Node | null;
    if (related && host.contains(related)) {
      return;
    }
    this.openKey.set(null);
  }

  toggleUser(): void {
    const next = !this.userOpen();
    this.userOpen.set(next);
    if (next) {
      this.openKey.set(null);
      this.notifs()?.close();
    }
  }

  /** Chuông / tìm kiếm mở → đóng nav + user (và panel còn lại). */
  onActionPanelOpen(source: 'notif' | 'search'): void {
    this.openKey.set(null);
    this.userOpen.set(false);
    if (source !== 'notif') {
      this.notifs()?.close();
    }
    if (source !== 'search') {
      this.search()?.close();
    }
  }

  onUserFocusOut(e: FocusEvent): void {
    const host = e.currentTarget as HTMLElement;
    if (!host.contains(e.relatedTarget as Node | null)) {
      this.userOpen.set(false);
    }
  }

  logout(): void {
    this.userOpen.set(false);
    this.openKey.set(null);
    this.closeMenu(false);
    this.auth.logout();
    this.toast.info('toast.loggedOut');
    if (this.router.url.startsWith('/portal/cau-hoi-cua-toi')) {
      void this.router.navigateByUrl('/portal');
    }
  }
}
