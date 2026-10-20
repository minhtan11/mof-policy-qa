/**
 * Shared UI — breadcrumb dùng chung (portal / workspace / admin).
 * Click điều hướng qua RouterLink; sau F5 / NavigationEnd tự đánh dấu mục khớp URL (`aria-current`).
 * Mục không có nhãn bị bỏ; mục hiện tại không còn là link (tránh tự navigate lại chính nó).
 */
import { ChangeDetectionStrategy, Component, computed, inject, input } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { NavigationEnd, Router, RouterLink } from '@angular/router';
import { filter, map } from 'rxjs';
import { TranslatePipe } from '../../../core/i18n/translate.pipe';
import { I18nService } from '../../../core/i18n/i18n.service';
import { MofFiIconComponent } from '../mof-fi-icon/mof-fi-icon.component';
import { buildBreadcrumbView, MofBreadcrumbItem } from './mof-breadcrumb.model';

@Component({
  selector: 'app-mof-breadcrumb',
  imports: [RouterLink, TranslatePipe, MofFiIconComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './mof-breadcrumb.component.html',
  styleUrl: './mof-breadcrumb.component.scss',
})
export class MofBreadcrumbComponent {
  private readonly router = inject(Router);
  private readonly i18n = inject(I18nService);

  /** Danh sách mục theo thứ tự gốc → trang hiện tại. */
  readonly items = input<readonly MofBreadcrumbItem[]>([]);
  /** Nhãn a11y cho `<nav>` (i18n key). */
  readonly ariaLabelKey = input('nav.breadcrumb');

  /**
   * Tick sau mỗi NavigationEnd. Đọc `router.url` trong computed (không cache URL trong signal)
   * để F5 / navigate / redirect đều khớp đúng mục hiện tại.
   */
  private readonly navTick = toSignal(
    this.router.events.pipe(
      filter((e): e is NavigationEnd => e instanceof NavigationEnd),
      map(() => Date.now()),
    ),
    { initialValue: 0 },
  );

  readonly viewItems = computed(() => {
    this.navTick();
    this.i18n.locale(); // phản ứng đổi ngôn ngữ
    return buildBreadcrumbView(this.items(), this.router.url, (key) => this.i18n.t(key));
  });
}
