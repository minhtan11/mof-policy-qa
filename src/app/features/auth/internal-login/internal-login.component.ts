import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { SelectModule } from 'primeng/select';
import { ButtonModule } from 'primeng/button';
import { AuthService } from '../../../core/auth/auth.service';
import { USERS } from '../../../core/mock-api/demo-data';
import { UserRole } from '../../../core/models/domain.models';

/**
 * Screen AU-02 | Internal officers | Establishes the selected role scope for the internal workspace.
 * Business references: UC-01..UC-08, UC-16, UC-31..UC-40.
 */
@Component({
  selector: 'app-internal-login',
  imports: [FormsModule, SelectModule, ButtonModule, RouterLink],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './internal-login.component.html',
  styleUrl: './internal-login.component.scss',
})
export class InternalLoginComponent {
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);

  readonly loading = signal(false);
  selectedRole: UserRole | null = this.route.snapshot.queryParamMap.get('required') as UserRole ?? null;
  readonly roles = USERS.filter((user) => user.role !== 'public').map((user) => ({
    label: `${this.roleLabel(user.role)} · ${user.name}`,
    value: user.role,
  }));

  login(): void {
    if (!this.selectedRole) return;
    this.loading.set(true);
    setTimeout(() => {
      const user = this.auth.loginAs(this.selectedRole!);
      this.loading.set(false);
      this.router.navigateByUrl(user.role === 'system-admin' ? '/admin' : '/workspace');
    }, 420);
  }

  private roleLabel(role: UserRole): string {
    return ({
      reception: 'Cán bộ tiếp nhận',
      specialist: 'Chuyên viên xử lý',
      leader: 'Lãnh đạo phê duyệt',
      coordinator: 'Điều phối',
      'system-admin': 'Quản trị hệ thống',
    } as Record<string, string>)[role] ?? role;
  }
}
