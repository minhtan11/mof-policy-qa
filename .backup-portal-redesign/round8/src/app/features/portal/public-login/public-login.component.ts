import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { PortalHeaderComponent } from '../../../shared/ui/portal-header/portal-header.component';
import { AuthService } from '../../../core/auth/auth.service';
import { TranslatePipe } from '../../../core/i18n/translate.pipe';
import { MofButtonComponent } from '../../../shared/ui/mof-button/mof-button.component';
import { MofInputComponent } from '../../../shared/ui/mof-input/mof-input.component';
import { MofIconComponent } from '../../../shared/ui/mof-icon/mof-icon.component';

/** Screen PUB-login | Citizen/business | Public account sign-in before submitting and tracking a question. | UC-1..UC-8 */
@Component({
  imports: [PortalHeaderComponent, FormsModule, RouterLink, TranslatePipe, MofButtonComponent, MofInputComponent, MofIconComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './public-login.component.html',
  styleUrl: './public-login.component.scss',
})
export class PublicLoginComponent {
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);
  email = '';
  password = '';
  readonly loading = signal(false);

  login(): void {
    this.loading.set(true);
    window.setTimeout(() => {
      this.auth.loginAs('public');
      this.loading.set(false);
      void this.router.navigateByUrl('/portal/hoi-dap');
    }, 350);
  }

  continueAsGuest(): void {
    this.auth.loginAs('public');
    void this.router.navigateByUrl('/portal/hoi-dap');
  }
}
