import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { MofToasterComponent } from './shared/ui/toast/mof-toaster.component';
import { ThemeService } from './core/theme/theme.service';
import { I18nService } from './core/i18n/i18n.service';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, MofToasterComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './app.html',
  styleUrl: './app.scss',
})
export class App {
  /** Keep services warm so theme/locale apply on first paint. */
  private readonly theme = inject(ThemeService);
  private readonly i18n = inject(I18nService);
}
