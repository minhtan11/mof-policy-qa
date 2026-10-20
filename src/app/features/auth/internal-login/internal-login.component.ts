import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { FormBuilder, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../../core/auth/auth.service';
import { CredentialsAuthAdapter } from '../../../core/auth/credentials-auth.adapter';
import { DEMO_INTERNAL_PREFILL_USER_ID } from '../../../core/mock-api/auth-credentials';
import { USERS } from '../../../core/mock-api/demo-data';
import { I18nService } from '../../../core/i18n/i18n.service';
import { TranslatePipe } from '../../../core/i18n/translate.pipe';
import { ToastService } from '../../../core/toast/toast.service';
import { AuthShellComponent } from '../../../shared/ui/auth-shell/auth-shell.component';
import { MofButtonComponent } from '../../../shared/ui/mof-button/mof-button.component';
import { MofCheckboxComponent } from '../../../shared/ui/mof-checkbox/mof-checkbox.component';
import { MofFieldErrorComponent } from '../../../shared/ui/mof-field-error/mof-field-error.component';
import { MofFiIconComponent } from '../../../shared/ui/mof-fi-icon/mof-fi-icon.component';
import { MofInputComponent } from '../../../shared/ui/mof-input/mof-input.component';
import { MofSelectComponent } from '../../../shared/ui/mof-select/mof-select.component';

/**
 * Screen AU-02 | Cán bộ nội bộ | Đăng nhập tên/mật khẩu (chỉ tài khoản nội bộ) vào workspace/admin.
 * "Vai trò mô phỏng" chỉ ĐIỀN SẴN tài khoản demo — không còn lối đăng nhập chỉ chọn vai trò.
 * Business references: UC-01..UC-08, UC-16, UC-31..UC-40 | Permission: internal roles.
 */
@Component({
  selector: 'app-internal-login',
  imports: [
    ReactiveFormsModule,
    FormsModule,
    RouterLink,
    TranslatePipe,
    AuthShellComponent,
    MofButtonComponent,
    MofCheckboxComponent,
    MofFieldErrorComponent,
    MofFiIconComponent,
    MofInputComponent,
    MofSelectComponent,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './internal-login.component.html',
  styleUrl: './internal-login.component.scss',
})
export class InternalLoginComponent {
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);
  private readonly fb = inject(FormBuilder);
  private readonly toast = inject(ToastService);
  private readonly creds = inject(CredentialsAuthAdapter);
  private readonly i18n = inject(I18nService);

  readonly loading = signal(false);
  readonly submitted = signal(false);
  readonly formError = signal<string | null>(null);

  /** Tài khoản demo nội bộ (fixture) cho "Vai trò mô phỏng". */
  readonly accounts = USERS.filter((u) => u.role !== 'public');
  readonly accountOptions = this.accounts.map((u) => ({
    value: u.id,
    label: `${u.name} · ${this.i18n.t('role.' + u.role)}`,
  }));
  demoAccount: string | null = DEMO_INTERNAL_PREFILL_USER_ID;

  readonly features = [
    { art: 'assets/illustrations/secure-shield.svg', key: 'ws.feature1' },
    { art: 'assets/illustrations/fast-bolt.svg', key: 'ws.feature2' },
    { art: 'assets/illustrations/connected-people.svg', key: 'ws.feature3' },
  ];

  private readonly prefill = this.creds.prefill(DEMO_INTERNAL_PREFILL_USER_ID);
  readonly form = this.fb.nonNullable.group({
    identifier: [this.prefill?.identifier ?? '', [Validators.required, Validators.minLength(3)]],
    password: [this.prefill?.password ?? '', [Validators.required, Validators.minLength(6)]],
    remember: [true],
  });

  constructor() {
    this.form.controls.identifier.valueChanges.subscribe(() => this.formError.set(null));
    this.form.controls.password.valueChanges.subscribe(() => this.formError.set(null));
  }

  /** Chọn tài khoản demo → điền username + mật khẩu mặc định (người dùng vẫn sửa được). */
  pickAccount(id: string | null): void {
    this.demoAccount = id;
    const p = id ? this.creds.prefill(id) : null;
    if (p) {
      this.form.patchValue({ identifier: p.identifier, password: p.password });
    }
  }

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
      const res = this.auth.loginInternal(identifier, password, remember);
      this.loading.set(false);
      if (!res || res === 'denied') {
        const key = res === 'denied' ? 'ws.errNotInternal' : 'login.errCredentials';
        this.formError.set(key);
        this.toast.error(key, { title: 'toast.loginFailed' });
        return;
      }
      this.toast.success('toast.welcome', { params: { name: res.name } });
      void this.router.navigateByUrl(this.auth.landingFor(res));
    }, 350);
  }
}
