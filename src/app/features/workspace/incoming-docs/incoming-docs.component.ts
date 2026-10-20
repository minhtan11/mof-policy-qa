/**
 * Screen WS-IN | Văn bản đến
 * Sổ đăng ký văn bản đến mock; liên kết hồ sơ tùy chọn; mở hồ sơ nếu có.
 * UC-142..UC-149 | Permission: internalGuard
 */
import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { DatePipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { WorkspaceShellComponent } from '../../../shared/ui/workspace-shell/workspace-shell.component';
import { TranslatePipe } from '../../../core/i18n/translate.pipe';
import { AuthService } from '../../../core/auth/auth.service';
import { MofFiIconComponent } from '../../../shared/ui/mof-fi-icon/mof-fi-icon.component';
import { MofBreadcrumbComponent } from '../../../shared/ui/mof-breadcrumb/mof-breadcrumb.component';
import { MofBreadcrumbItem } from '../../../shared/ui/mof-breadcrumb/mof-breadcrumb.model';
import { IncomingDocsRepository } from '../../../core/mock-api/incoming-docs.repository';
import { IncomingDocStatus } from '../../../core/mock-api/workspace-register-fixtures';

const TABS: Array<{ id: IncomingDocStatus | 'all'; labelKey: string }> = [
  { id: 'all', labelKey: 'wsIncoming.tabAll' },
  { id: 'new', labelKey: 'wsIncoming.tabNew' },
  { id: 'distributed', labelKey: 'wsIncoming.tabDistributed' },
  { id: 'processing', labelKey: 'wsIncoming.tabProcessing' },
  { id: 'done', labelKey: 'wsIncoming.tabDone' },
];

@Component({
  imports: [
    WorkspaceShellComponent,
    RouterLink,
    DatePipe,
    TranslatePipe,
    MofFiIconComponent,
    MofBreadcrumbComponent,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './incoming-docs.component.html',
  styleUrl: './incoming-docs.component.scss',
})
export class IncomingDocsComponent {
  readonly repo = inject(IncomingDocsRepository);
  readonly auth = inject(AuthService);
  readonly tabs = TABS;

  readonly tab = signal<IncomingDocStatus | 'all'>('all');
  readonly qInput = signal('');
  readonly q = signal('');

  readonly crumbs: MofBreadcrumbItem[] = [
    { labelKey: 'workspace.navOverview', link: '/workspace' },
    { labelKey: 'wsNav.incoming', current: true },
  ];

  readonly rows = computed(() => this.repo.list(this.tab(), this.q()));
  readonly counts = computed(() => this.repo.counts());

  setTab(id: IncomingDocStatus | 'all'): void {
    this.tab.set(id);
  }

  applySearch(): void {
    this.q.set(this.qInput().trim());
  }

  clearSearch(): void {
    this.qInput.set('');
    this.q.set('');
  }

  statusKey(s: IncomingDocStatus): string {
    return `wsIncoming.status.${s}`;
  }
}
