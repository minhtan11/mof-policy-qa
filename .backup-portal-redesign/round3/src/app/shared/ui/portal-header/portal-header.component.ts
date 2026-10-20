import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { NavigationEnd, Router, RouterLink, RouterLinkActive } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { toSignal } from '@angular/core/rxjs-interop';
import { filter, map } from 'rxjs';
import { TranslatePipe } from '../../../core/i18n/translate.pipe';
import { I18nService } from '../../../core/i18n/i18n.service';
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
  imports: [RouterLink, RouterLinkActive, FormsModule, TranslatePipe, MofIconComponent, MofFiIconComponent, MofInputComponent, LangSwitchComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './portal-header.component.html',
  styleUrl: './portal-header.component.scss',
})
export class PortalHeaderComponent {
  readonly theme = inject(ThemeService);
  readonly i18n = inject(I18nService);
  private readonly router = inject(Router);

  readonly keyword = signal('');
  readonly menuOpen = signal(false);

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
      route: '/portal',
      fragment: 'lien-he',
      children: [
        { key: 'portal.nav.aboutPortal', route: '/portal', fragment: 'lien-he' },
        { key: 'nav.guide', route: '/portal/tra-cuu' },
      ],
    },
    {
      key: 'portal.nav.news',
      route: '/portal',
      fragment: 'tin-tuc',
      children: [
        { key: 'portal.news.title', route: '/portal', fragment: 'tin-tuc' },
        { key: 'portal.notice.title', route: '/portal', fragment: 'thong-bao' },
      ],
    },
    {
      key: 'portal.nav.legal',
      route: '/portal/tra-cuu',
      children: [{ key: 'portal.nav.legalLookup', route: '/portal/tra-cuu' }],
    },
    {
      key: 'portal.nav.services',
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
      route: '/portal',
      fragment: 'ngan-sach',
      children: [{ key: 'portal.budget.title', route: '/portal', fragment: 'ngan-sach' }],
    },
    { key: 'portal.nav.contact', route: '/portal', fragment: 'lien-he' },
  ];

  /** Mục cha sáng khi URL hiện tại khớp route của chính nó hoặc một mục con (bỏ qua anchor trên trang chủ). */
  isActive(item: NavItem): boolean {
    const path = this.url().split(/[?#]/)[0];
    if (item.icon) {
      return path === '/portal';
    }
    const routes = [item, ...(item.children ?? [])].filter((c) => !c.fragment).map((c) => c.route);
    return routes.some((r) => r !== '/portal' && path.startsWith(r));
  }

  search(): void {
    this.menuOpen.set(false);
    void this.router.navigate(['/portal/tra-cuu'], { queryParams: { q: this.keyword() || null } });
  }
}
