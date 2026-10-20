import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { TranslatePipe } from '../../../core/i18n/translate.pipe';
import { I18nService } from '../../../core/i18n/i18n.service';
import { ThemeService } from '../../../core/theme/theme.service';
import { MofIconComponent } from '../mof-icon/mof-icon.component';
import { MofFiIconComponent } from '../mof-fi-icon/mof-fi-icon.component';
import { MofInputComponent } from '../mof-input/mof-input.component';
import { LangSwitchComponent } from '../lang-switch/lang-switch.component';

/**
 * Shell header dùng chung cho mọi màn /portal/**: thanh tiện ích (ngày, sơ đồ, hỗ trợ, đăng nhập),
 * khối nhận diện + tìm kiếm + theme/ngôn ngữ, và menu chính. Menu cuộn ngang trên mobile để không vỡ layout.
 */
@Component({
  selector: 'app-portal-header',
  imports: [
    RouterLink,
    RouterLinkActive,
    FormsModule,
    TranslatePipe,
    MofIconComponent,
    MofFiIconComponent,
    MofInputComponent,
    LangSwitchComponent,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './portal-header.component.html',
  styleUrl: './portal-header.component.scss',
})
export class PortalHeaderComponent {
  readonly theme = inject(ThemeService);
  private readonly i18n = inject(I18nService);
  private readonly router = inject(Router);

  readonly keyword = signal('');
  readonly today = computed(() =>
    new Intl.DateTimeFormat(this.i18n.locale() === 'vi' ? 'vi-VN' : 'en-GB', {
      weekday: 'long',
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    }).format(new Date()),
  );

  readonly navItems = [
    { key: 'nav.home', route: '/portal', exact: true },
    { key: 'nav.search', route: '/portal/tra-cuu' },
    { key: 'nav.ask', route: '/portal/hoi-dap' },
    { key: 'nav.myQuestions', route: '/portal/cau-hoi-cua-toi' },
    { key: 'portal.nav.budget', route: '/portal', fragment: 'ngan-sach' },
    { key: 'portal.nav.news', route: '/portal', fragment: 'tin-tuc' },
    { key: 'portal.nav.contact', route: '/portal', fragment: 'lien-he' },
  ];

  search(): void {
    void this.router.navigate(['/portal/tra-cuu'], { queryParams: { q: this.keyword() || null } });
  }
}
