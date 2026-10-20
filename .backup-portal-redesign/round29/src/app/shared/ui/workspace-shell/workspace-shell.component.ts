import { ChangeDetectionStrategy, Component, inject, input, output } from '@angular/core';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';
import { ToastService } from '../../../core/toast/toast.service';
import { AuthService } from '../../../core/auth/auth.service';
import { ThemeService } from '../../../core/theme/theme.service';
import { TranslatePipe } from '../../../core/i18n/translate.pipe';
import { MofIconComponent } from '../mof-icon/mof-icon.component';
import { LangSwitchComponent } from '../lang-switch/lang-switch.component';

@Component({
  selector: 'app-workspace-shell',
  imports: [RouterLink, RouterLinkActive, MofIconComponent, LangSwitchComponent, TranslatePipe],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './workspace-shell.component.html',
  styleUrl: './workspace-shell.component.scss',
})
export class WorkspaceShellComponent {
  readonly title = input.required<string>();
  readonly eyebrow = input('Workspace');
  readonly collapsed = input(false);
  readonly collapse = output<void>();
  readonly auth = inject(AuthService);
  readonly theme = inject(ThemeService);
  private readonly router = inject(Router);
  private readonly toast = inject(ToastService);

  logout(): void {
    this.auth.logout();
    this.toast.info('toast.loggedOut');
    void this.router.navigateByUrl('/portal');
  }
}
