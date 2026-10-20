import { ChangeDetectionStrategy, Component, DestroyRef, effect, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { AuthService } from '../../../core/auth/auth.service';
import { TranslatePipe } from '../../../core/i18n/translate.pipe';
import { MofButtonComponent } from '../../../shared/ui/mof-button/mof-button.component';
import { MofInputComponent } from '../../../shared/ui/mof-input/mof-input.component';
import { MofCheckboxComponent } from '../../../shared/ui/mof-checkbox/mof-checkbox.component';
import { MofFiIconComponent } from '../../../shared/ui/mof-fi-icon/mof-fi-icon.component';
import { AuthShellComponent } from '../../../shared/ui/auth-shell/auth-shell.component';
import { ToastService } from '../../../core/toast/toast.service';
import { CredentialsAuthAdapter } from '../../../core/auth/credentials-auth.adapter';
import { VneidAuthAdapter } from '../../../core/auth/vneid-auth.adapter';
import { VneidQrPanelComponent } from './vneid-qr-panel/vneid-qr-panel.component';
import { MofFieldErrorComponent } from '../../../shared/ui/mof-field-error/mof-field-error.component';

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
    AuthShellComponent,
    MofFieldErrorComponent,
    VneidQrPanelComponent,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './public-login.component.html',
  styleUrl: './public-login.component.scss',
})
export class PublicLoginComponent {
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  private readonly fb = inject(FormBuilder);

  private readonly vneid = inject(VneidAuthAdapter);
  private readonly toast = inject(ToastService);
  /** Điền sẵn tài khoản demo MỘT LẦN khi khởi tạo — người dùng sửa thì giá trị gõ vào được dùng. */
  private readonly prefill = inject(CredentialsAuthAdapter).prefill();
  /** Lỗi cấp form (sai tài khoản/mật khẩu) — hiển thị trong ô giữ chỗ, không đẩy layout. */
  readonly formError = signal<string | null>(null);

  /** 'password' = form mật khẩu; 'vneid' = QR VNeID trong cùng card (xếp chồng cùng ô grid → không đổi chiều cao). */
  readonly mode = signal<'password' | 'vneid'>('password');
  readonly accountType = signal<LoginAccountType>('citizen');
  readonly loading = signal(false);
  readonly submitted = signal(false);

  readonly features = [
    { art: 'assets/illustrations/secure-shield.svg', key: 'login.feature1' },
    { art: 'assets/illustrations/fast-bolt.svg', key: 'login.feature2' },
    { art: 'assets/illustrations/connected-people.svg', key: 'login.feature3' },
  ];

  readonly form = this.fb.nonNullable.group({
    identifier: [this.prefill?.identifier ?? '', [Validators.required, Validators.minLength(3)]],
    password: [this.prefill?.password ?? '', [Validators.required, Validators.minLength(6)]],
    remember: [true],
  });

  constructor() {
    effect(() => {
      if (this.vneid.status() === 'success') {
        const t = window.setTimeout(() => void this.router.navigateByUrl('/portal/hoi-dap'), 900);
        return () => window.clearTimeout(t);
      }
      return undefined;
    });
    inject(DestroyRef).onDestroy(() => this.vneid.cancel());
    this.form.controls.identifier.valueChanges.subscribe(() => this.formError.set(null));
    this.form.controls.password.valueChanges.subscribe(() => this.formError.set(null));
    // Tiện ích nhanh / deep-link: `/portal/login?method=vneid` mở sẵn panel QR.
    if (this.route.snapshot.queryParamMap.get('method') === 'vneid') {
      this.openVneid();
    }
  }

  openVneid(): void {
    this.mode.set('vneid');
    this.vneid.startSession();
    this.syncMethodQuery('vneid');
  }

  backToPassword(): void {
    this.vneid.cancel();
    this.mode.set('password');
    this.syncMethodQuery(null);
  }

  /** Đồng bộ `?method=vneid` với mode hiện tại (không tạo history thừa). */
  private syncMethodQuery(method: 'vneid' | null): void {
    const current = this.route.snapshot.queryParamMap.get('method');
    const next = method;
    if ((current ?? null) === next) {
      return;
    }
    void this.router.navigate([], {
      relativeTo: this.route,
      queryParams: { method: next },
      queryParamsHandling: 'merge',
      replaceUrl: true,
    });
  }

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
      if (this.form.invalid) {
        this.toast.warning('toast.checkFields');
      }
      return;
    }
    this.formError.set(null);
    this.loading.set(true);
    const { identifier, password, remember } = this.form.getRawValue();
    window.setTimeout(() => {
      const user = this.auth.loginWithCredentials(identifier, password, remember);
      this.loading.set(false);
      if (!user) {
        this.formError.set('login.errCredentials');
        this.toast.error('login.errCredentials', { title: 'toast.loginFailed' });
        return;
      }
      this.toast.success('toast.welcome', { params: { name: user.name } });
      void this.router.navigateByUrl(this.auth.landingFor(user));
    }, 350);
  }
}
