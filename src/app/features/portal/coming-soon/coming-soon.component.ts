/**
 * Screen PUB-soon / WS-soon | Người dân & cán bộ | Trang "Sắp ra mắt" cho mục chưa có màn hình.
 * Cổng: Hướng dẫn, VBPL. Workspace (R30): mục sidebar chưa có màn (route data shell='workspace').
 * Route data: { titleKey, icon?, bodyKey?, shell? } | UC liên quan: UC-162..UC-165, UC-142..UC-149 | Permission: công khai / cán bộ nội bộ
 */
import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { Location, NgTemplateOutlet } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { map } from 'rxjs';
import { TranslatePipe } from '../../../core/i18n/translate.pipe';
import { PortalHeaderComponent } from '../../../shared/ui/portal-header/portal-header.component';
import { PortalFooterComponent } from '../../../shared/ui/portal-footer/portal-footer.component';
import { PageBackdropComponent } from '../../../shared/ui/page-backdrop/page-backdrop.component';
import { MofButtonComponent } from '../../../shared/ui/mof-button/mof-button.component';
import { MofFiIconComponent } from '../../../shared/ui/mof-fi-icon/mof-fi-icon.component';
import { WorkspaceShellComponent } from '../../../shared/ui/workspace-shell/workspace-shell.component';

export interface ComingSoonData {
  titleKey: string;
  bodyKey?: string;
  icon?: string;
  shell?: 'portal' | 'workspace';
}

@Component({
  selector: 'app-coming-soon',
  imports: [
    RouterLink,
    TranslatePipe,
    PortalHeaderComponent,
    PortalFooterComponent,
    PageBackdropComponent,
    MofButtonComponent,
    MofFiIconComponent,
    WorkspaceShellComponent,
    NgTemplateOutlet,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './coming-soon.component.html',
  styleUrl: './coming-soon.component.scss',
})
export class ComingSoonComponent {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly location = inject(Location);

  private readonly data = toSignal(
    this.route.data.pipe(map((d) => d as ComingSoonData)),
    { initialValue: (this.route.snapshot.data ?? {}) as ComingSoonData },
  );

  readonly titleKey = computed(() => this.data().titleKey || 'comingSoon.title');
  readonly bodyKey = computed(() => this.data().bodyKey || 'comingSoon.body');
  readonly icon = computed(() => this.data().icon || 'time-past');
  readonly workspace = computed(() => this.data().shell === 'workspace');
  readonly homeRoute = computed(() => (this.workspace() ? '/workspace' : '/portal'));
  readonly homeKey = computed(() => (this.workspace() ? 'comingSoon.backOverview' : 'comingSoon.backHome'));

  /** Quay lại trang trước; mở thẳng (không có lịch sử trong app) thì về trang chủ/tổng quan. */
  back(): void {
    const nav = this.router.lastSuccessfulNavigation();
    if (nav?.previousNavigation) {
      this.location.back();
    } else {
      void this.router.navigateByUrl(this.homeRoute());
    }
  }
}
