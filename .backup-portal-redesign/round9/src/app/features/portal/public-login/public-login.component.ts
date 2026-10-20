import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../../core/auth/auth.service';
import { TranslatePipe } from '../../../core/i18n/translate.pipe';
import { MofButtonComponent } from '../../../shared/ui/mof-button/mof-button.component';
import { MofInputComponent } from '../../../shared/ui/mof-input/mof-input.component';
import { MofCheckboxComponent } from '../../../shared/ui/mof-checkbox/mof-checkbox.component';
import { MofFiIconComponent } from '../../../shared/ui/mof-fi-icon/mof-fi-icon.component';
import { PageBackdropComponent } from '../../../shared/ui/page-backdrop/page-backdrop.component';
import { RevealDirective } from '../../../shared/ui/reveal/reveal.directive';

export type LoginAccountType = 'citizen' | 'business';

/**
 * Screen PUB-login | Người dân / doanh nghiệp | Đăng nhập tài khoản cổng (mock) trước khi gửi và theo dõi câu hỏi;
 * lối vào VNeID. UC-1..UC-8 | Permission: public. Đăng nhập mock → role `public` (adapter thật thay sau).
 */
@Component({
  imports: [
    ReactiveFormsModule,
    RouterLink,
    TranslatePipe,
    MofButtonComponent,
    MofInputComponent,
    MofCheckboxComponent,
    MofFiIconComponent,
    PageBackdropComponent,
    RevealDirective,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './public-login.component.html',
  styleUrl: './public-login.component.scss',
})
export class PublicLoginComponent {
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);
  private readonly fb = inject(FormBuilder);

  readonly accountType = signal<LoginAccountType>('citizen');
  readonly loading = signal(false);
  readonly submitted = signal(false);

  readonly features = [
    { icon: 'shield-check', key: 'login.feature1' },
    { icon: 'bolt', key: 'login.feature2' },
    { icon: 'users', key: 'login.feature3' },
  ];

  readonly form = this.fb.nonNullable.group({
    identifier: ['', [Validators.required, Validators.minLength(3)]],
    password: ['', [Validators.required, Validators.minLength(6)]],
    remember: [true],
  });

  /** Khóa i18n lỗi của một trường (chỉ hiện sau khi chạm hoặc bấm gửi). */
  errorOf(name: 'identifier' | 'password'): string | null {
    const ctrl = this.form.controls[name];
    if (!ctrl.invalid || !(ctrl.touched || this.submitted())) {
      return null;
    }
    if (ctrl.hasError('required')) {
      return name === 'identifier' ? 'login.errIdentifierRequired' : 'login.errPasswordRequired';
    }
    return name === 'identifier' ? 'login.errIdentifierShort' : 'login.errPasswordShort';
  }

  login(): void {
    this.submitted.set(true);
    if (this.form.invalid || this.loading()) {
      this.form.markAllAsTouched();
      return;
    }
    this.loading.set(true);
    window.setTimeout(() => {
      this.auth.loginAs('public');
      this.loading.set(false);
      void this.router.navigateByUrl('/portal/hoi-dap');
    }, 350);
  }
}
