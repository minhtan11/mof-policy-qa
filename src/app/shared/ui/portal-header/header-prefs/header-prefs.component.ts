import { ChangeDetectionStrategy, Component, computed, inject, input, output } from '@angular/core';
import { RouterLink } from '@angular/router';
import { TranslatePipe } from '../../../../core/i18n/translate.pipe';
import { I18nService } from '../../../../core/i18n/i18n.service';
import { ThemeService } from '../../../../core/theme/theme.service';
import { LangSwitchComponent } from '../../lang-switch/lang-switch.component';
import { MofFiIconComponent } from '../../mof-fi-icon/mof-fi-icon.component';

/**
 * Khối "Tuỳ chọn" trong menu tài khoản / menu cài đặt của header cổng: ngày, giao diện sáng/tối, VI|EN,
 * Sơ đồ cổng, Hỗ trợ. Luôn truy cập được khi chưa đăng nhập (menu cài đặt).
 */
@Component({
  selector: 'app-header-prefs',
  imports: [RouterLink, TranslatePipe, LangSwitchComponent, MofFiIconComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <p class="sec">{{ 'header.prefs' | t }}</p>
    <p class="date"><app-mof-fi-icon name="calendar" /> {{ today() }}</p>
    <div class="pref">
      <span>
        <app-mof-fi-icon [name]="theme.theme() === 'dark' ? 'moon' : 'sun'" />
        {{ themeLabelKey() | t }}
      </span>
      <button
        type="button"
        role="switch"
        class="switch"
        [attr.aria-checked]="theme.theme() === 'dark'"
        [attr.aria-label]="themeLabelKey() | t"
        (click)="theme.toggle()"
      ><span class="knob"></span></button>
    </div>
    <div class="pref">
      <span><app-mof-fi-icon name="globe" /> {{ 'portal.lang.label' | t }}</span>
      <app-lang-switch />
    </div>
    @if (portalLinks()) {
      <a role="menuitem" routerLink="/portal" fragment="lien-he" (click)="navigate.emit()"><app-mof-fi-icon name="sitemap" /> {{ 'portal.util.sitemap' | t }}</a>
      <a role="menuitem" routerLink="/portal/tra-cuu" (click)="navigate.emit()"><app-mof-fi-icon name="interrogation" /> {{ 'portal.util.help' | t }}</a>
    }
  `,
  styleUrl: './header-prefs.component.scss',
})
export class HeaderPrefsComponent {
  readonly theme = inject(ThemeService);
  private readonly i18n = inject(I18nService);
  readonly navigate = output<void>();
  /** Liên kết Sơ đồ cổng / Hỗ trợ (tắt trong workspace). */
  readonly portalLinks = input(true);
  /** Nhãn theo theme hiện tại: sáng ↔ tối. */
  readonly themeLabelKey = computed(() =>
    this.theme.theme() === 'dark' ? 'header.darkMode' : 'header.lightMode',
  );
  readonly today = computed(() =>
    new Intl.DateTimeFormat(this.i18n.locale() === 'vi' ? 'vi-VN' : 'en-GB', {
      weekday: 'long',
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    }).format(new Date()),
  );
}
