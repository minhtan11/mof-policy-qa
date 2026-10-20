/**
 * Screen WS-PROF | Hồ sơ cá nhân cán bộ
 * Xem tên, đơn vị, vai trò, email đã che; bật 2FA mock; tùy chọn chữ ký.
 * UC-018..UC-030 | Permission: internalGuard; route WS_PROFILE_ROUTE
 */
import { ChangeDetectionStrategy, Component, computed, inject, OnInit } from '@angular/core';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { WorkspaceShellComponent } from '../../../shared/ui/workspace-shell/workspace-shell.component';
import { TranslatePipe } from '../../../core/i18n/translate.pipe';
import { AuthService } from '../../../core/auth/auth.service';
import { I18nService } from '../../../core/i18n/i18n.service';
import { ToastService } from '../../../core/toast/toast.service';
import { MofFiIconComponent } from '../../../shared/ui/mof-fi-icon/mof-fi-icon.component';
import { MofBreadcrumbComponent } from '../../../shared/ui/mof-breadcrumb/mof-breadcrumb.component';
import { MofBreadcrumbItem } from '../../../shared/ui/mof-breadcrumb/mof-breadcrumb.model';
import { MofButtonComponent } from '../../../shared/ui/mof-button/mof-button.component';
import { MofCheckboxComponent } from '../../../shared/ui/mof-checkbox/mof-checkbox.component';
import { MofInputComponent } from '../../../shared/ui/mof-input/mof-input.component';

const PREFS_KEY = 'mof-policy-qa.officer-profile.v1';

interface OfficerPrefs {
  twoFa: boolean;
  signaturePrefs: boolean;
}

@Component({
  imports: [
    WorkspaceShellComponent,
    ReactiveFormsModule,
    TranslatePipe,
    MofFiIconComponent,
    MofBreadcrumbComponent,
    MofButtonComponent,
    MofCheckboxComponent,
    MofInputComponent,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './officer-profile.component.html',
  styleUrl: './officer-profile.component.scss',
})
export class OfficerProfileComponent implements OnInit {
  readonly auth = inject(AuthService);
  private readonly i18n = inject(I18nService);
  private readonly toast = inject(ToastService);
  private readonly fb = inject(FormBuilder);

  readonly crumbs: MofBreadcrumbItem[] = [
    { labelKey: 'workspace.navOverview', link: '/workspace' },
    { labelKey: 'wsNav.profile', current: true },
  ];

  readonly roleKey = computed(() => {
    const role = this.auth.user()?.role;
    return role ? `role.${role}` : '';
  });

  readonly maskedEmail = computed(() => maskEmail(this.auth.user()?.email ?? ''));

  readonly form = this.fb.nonNullable.group({
    name: [{ value: '', disabled: true }],
    organization: [{ value: '', disabled: true }],
    role: [{ value: '', disabled: true }],
    email: [{ value: '', disabled: true }],
    twoFa: [false],
    signaturePrefs: [false],
  });

  ngOnInit(): void {
    const u = this.auth.user();
    const prefs = this.loadPrefs();
    this.form.patchValue({
      name: u?.name ?? '',
      organization: u?.organization ?? '—',
      role: u ? this.i18n.t(`role.${u.role}`) : '',
      email: maskEmail(u?.email ?? ''),
      twoFa: prefs.twoFa,
      signaturePrefs: prefs.signaturePrefs,
    });
  }

  save(): void {
    const { twoFa, signaturePrefs } = this.form.getRawValue();
    localStorage.setItem(PREFS_KEY, JSON.stringify({ twoFa, signaturePrefs } satisfies OfficerPrefs));
    this.toast.show({ severity: 'success', summary: this.i18n.t('wsProfile.toastSaved') });
  }

  private loadPrefs(): OfficerPrefs {
    try {
      const raw = localStorage.getItem(PREFS_KEY);
      if (!raw) return { twoFa: false, signaturePrefs: true };
      return { twoFa: false, signaturePrefs: true, ...(JSON.parse(raw) as Partial<OfficerPrefs>) };
    } catch {
      return { twoFa: false, signaturePrefs: true };
    }
  }
}

export function maskEmail(email: string): string {
  const [local, domain] = email.split('@');
  if (!local || !domain) return '***';
  const head = local.slice(0, Math.min(2, local.length));
  return `${head}***@${domain}`;
}
