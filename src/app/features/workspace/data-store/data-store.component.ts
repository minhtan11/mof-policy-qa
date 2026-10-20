/**
 * Screen WS-DS | Kho dữ liệu
 * Thống kê sức khỏe chỉ mục: hồ sơ, VBPL, backup gần nhất (OpsRepository).
 * UC-084..UC-099 | Permission: leader/coordinator/admin (WS_ROLE_MATRIX.data-store)
 */
import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { DatePipe } from '@angular/common';
import { WorkspaceShellComponent } from '../../../shared/ui/workspace-shell/workspace-shell.component';
import { TranslatePipe } from '../../../core/i18n/translate.pipe';
import { AuthService } from '../../../core/auth/auth.service';
import { MofFiIconComponent } from '../../../shared/ui/mof-fi-icon/mof-fi-icon.component';
import { MofBreadcrumbComponent } from '../../../shared/ui/mof-breadcrumb/mof-breadcrumb.component';
import { MofBreadcrumbItem } from '../../../shared/ui/mof-breadcrumb/mof-breadcrumb.model';
import { DataStoreRepository } from '../../../core/mock-api/data-store.repository';
import { OpsRepository } from '../../../core/mock-api/ops.repository';

@Component({
  imports: [
    WorkspaceShellComponent,
    DatePipe,
    TranslatePipe,
    MofFiIconComponent,
    MofBreadcrumbComponent,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './data-store.component.html',
  styleUrl: './data-store.component.scss',
})
export class DataStoreComponent {
  readonly repo = inject(DataStoreRepository);
  readonly ops = inject(OpsRepository);
  readonly auth = inject(AuthService);

  readonly crumbs: MofBreadcrumbItem[] = [
    { labelKey: 'workspace.navOverview', link: '/workspace' },
    { labelKey: 'wsNav.dataStore', current: true },
  ];

  readonly health = computed(() => this.repo.health());
}
