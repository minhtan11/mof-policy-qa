import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';
import { TranslatePipe } from '../../../core/i18n/translate.pipe';
import { ThemeService } from '../../../core/theme/theme.service';
import { MofButtonComponent } from '../mof-button/mof-button.component';
import { MofIconComponent } from '../mof-icon/mof-icon.component';
import { LangSwitchComponent } from '../lang-switch/lang-switch.component';

@Component({
  selector: 'app-portal-header',
  imports: [RouterLink, RouterLinkActive, TranslatePipe, MofButtonComponent, MofIconComponent, LangSwitchComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './portal-header.component.html',
  styleUrl: './portal-header.component.scss',
})
export class PortalHeaderComponent {
  readonly theme = inject(ThemeService);
  private readonly router = inject(Router);

  login(): void {
    void this.router.navigateByUrl('/portal/login/vneid');
  }
}
