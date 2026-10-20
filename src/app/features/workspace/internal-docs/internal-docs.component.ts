/**
 * Screen WS-TPL | Tài liệu nội bộ — thư viện mẫu trả lời
 * UC-60..UC-74 (mẫu) / soạn trả lời | Permission: internalGuard
 */
import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { WorkspaceShellComponent } from '../../../shared/ui/workspace-shell/workspace-shell.component';
import { TranslatePipe } from '../../../core/i18n/translate.pipe';
import { AuthService } from '../../../core/auth/auth.service';
import { MofFiIconComponent } from '../../../shared/ui/mof-fi-icon/mof-fi-icon.component';
import { MofBreadcrumbComponent } from '../../../shared/ui/mof-breadcrumb/mof-breadcrumb.component';
import { MofBreadcrumbItem } from '../../../shared/ui/mof-breadcrumb/mof-breadcrumb.model';
import { InternalDocsRepository } from '../../../core/mock-api/internal-docs.repository';

@Component({
  imports: [WorkspaceShellComponent, TranslatePipe, MofFiIconComponent, MofBreadcrumbComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './internal-docs.component.html',
  styleUrl: './internal-docs.component.scss',
})
export class InternalDocsComponent {
  readonly repo = inject(InternalDocsRepository);
  readonly auth = inject(AuthService);
  readonly qInput = signal('');
  readonly q = signal('');

  readonly crumbs: MofBreadcrumbItem[] = [
    { labelKey: 'workspace.navOverview', link: '/workspace' },
    { labelKey: 'wsNav.internalDocs', current: true },
  ];

  readonly rows = computed(() => this.repo.list(this.q()));
  readonly counts = computed(() => this.repo.counts());

  applySearch(): void {
    this.q.set(this.qInput().trim());
  }

  clearSearch(): void {
    this.qInput.set('');
    this.q.set('');
  }
}
