import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { PageBackdropComponent } from '../page-backdrop/page-backdrop.component';

/**
 * Khung đăng nhập dùng chung (cổng công khai + cán bộ nội bộ): nền mờ, card bo tròn chia 2 cột,
 * cột trái nhận `[authBrand]`, cột phải nhận nội dung form. Mobile (< 768px): xếp chồng, panel trái thành banner.
 * Kiểu form chung: `@use 'auth-form'` (_auth-form.scss).
 * Không dùng scroll-reveal (chỉ landing trang chủ `/portal`).
 */
@Component({
  selector: 'app-auth-shell',
  imports: [PageBackdropComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <app-page-backdrop />
    <main class="auth-page">
      <div class="auth-card" [class.even]="split() === 'even'">
        <aside class="auth-brand"><ng-content select="[authBrand]" /></aside>
        <section class="auth-form"><ng-content /></section>
      </div>
    </main>
  `,
  styleUrl: './auth-shell.component.scss',
})
export class AuthShellComponent {
  /** 'brand' = trái hẹp hơn (cổng); 'even' = 50/50 (nội bộ). */
  readonly split = input<'brand' | 'even'>('brand');
}
