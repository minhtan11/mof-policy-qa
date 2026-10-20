/**
 * Screen WS-OUT | Văn bản đi
 * Sổ câu trả lời đã soạn / đã xuất bản từ MockDb.
 * UC-150..UC-161 | Permission: internalGuard
 */
import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { WorkspaceShellComponent } from '../../../shared/ui/workspace-shell/workspace-shell.component';
import { StatusBadgeComponent } from '../../../shared/ui/status-badge/status-badge.component';
import { TranslatePipe } from '../../../core/i18n/translate.pipe';
import { AuthService } from '../../../core/auth/auth.service';
import { MofFiIconComponent } from '../../../shared/ui/mof-fi-icon/mof-fi-icon.component';
import { MofBreadcrumbComponent } from '../../../shared/ui/mof-breadcrumb/mof-breadcrumb.component';
import { MofBreadcrumbItem } from '../../../shared/ui/mof-breadcrumb/mof-breadcrumb.model';
import { OutgoingDocsRepository, OutgoingTab } from '../../../core/mock-api/outgoing-docs.repository';

const TABS: Array<{ id: OutgoingTab; labelKey: string }> = [
  { id: 'all', labelKey: 'wsOutgoing.tabAll' },
  { id: 'answered', labelKey: 'wsOutgoing.tabAnswered' },
  { id: 'published', labelKey: 'wsOutgoing.tabPublished' },
];

@Component({
  imports: [
    WorkspaceShellComponent,
    RouterLink,
    StatusBadgeComponent,
    TranslatePipe,
    MofFiIconComponent,
    MofBreadcrumbComponent,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './outgoing-docs.component.html',
  styleUrl: './outgoing-docs.component.scss',
})
export class OutgoingDocsComponent {
  readonly repo = inject(OutgoingDocsRepository);
  readonly auth = inject(AuthService);
  readonly tabs = TABS;
  readonly tab = signal<OutgoingTab>('all');
  readonly qInput = signal('');
  readonly q = signal('');

  readonly crumbs: MofBreadcrumbItem[] = [
    { labelKey: 'workspace.navOverview', link: '/workspace' },
    { labelKey: 'wsNav.outgoing', current: true },
  ];

  readonly rows = computed(() => this.repo.list(this.tab(), this.q()));
  readonly counts = computed(() => this.repo.counts());

  setTab(id: OutgoingTab): void {
    this.tab.set(id);
  }

  applySearch(): void {
    this.q.set(this.qInput().trim());
  }

  clearSearch(): void {
    this.qInput.set('');
    this.q.set('');
  }
}
