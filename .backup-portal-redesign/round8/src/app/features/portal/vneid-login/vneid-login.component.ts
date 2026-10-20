import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../../core/auth/auth.service';
import { TranslatePipe } from '../../../core/i18n/translate.pipe';
import { MofButtonComponent } from '../../../shared/ui/mof-button/mof-button.component';
import { MofIconComponent } from '../../../shared/ui/mof-icon/mof-icon.component';

/** Screen PUB-01 | Citizen/business | Authenticate through VNeID before using personalized public services. | UC-1..UC-8 */
@Component({
  imports: [RouterLink, TranslatePipe, MofButtonComponent, MofIconComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './vneid-login.component.html',
  styleUrl: './vneid-login.component.scss',
})
export class VneidLoginComponent {
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);
  readonly state = signal<'ready' | 'checking' | 'success'>('ready');

  verify(): void {
    this.state.set('checking');
    window.setTimeout(() => this.state.set('success'), 900);
  }

  continue(): void {
    this.auth.loginAs('public');
    void this.router.navigateByUrl('/portal/hoi-dap');
  }
}
