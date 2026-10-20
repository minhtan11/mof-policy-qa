import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { NavigationEnd, NavigationStart, Router, RouterOutlet } from '@angular/router';
import { filter } from 'rxjs';
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

  /**
   * Cuộn: đổi trang (path khác) → lên đầu, hoặc tới #fragment; back/forward → để trình duyệt khôi phục.
   * Chỉ đổi query params (lọc/phân trang) → GIỮ vị trí cuộn (trước dùng scrollPositionRestoration 'top' → nhảy lên đầu).
   */
  constructor() {
    const router = inject(Router);
    let popstate = false;
    let lastPath = router.url.split(/[?#]/)[0];
    router.events.pipe(filter((e) => e instanceof NavigationStart || e instanceof NavigationEnd)).subscribe((e) => {
      if (e instanceof NavigationStart) {
        popstate = e.navigationTrigger === 'popstate';
        return;
      }
      const url = (e as NavigationEnd).urlAfterRedirects;
      const path = url.split(/[?#]/)[0];
      const frag = url.includes('#') ? url.slice(url.indexOf('#') + 1) : null;
      const changed = path !== lastPath;
      lastPath = path;
      if (popstate) {
        return;
      }
      if (frag) {
        setTimeout(() => document.getElementById(frag)?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 0);
      } else if (changed) {
        window.scrollTo(0, 0);
      }
    });
  }
}
