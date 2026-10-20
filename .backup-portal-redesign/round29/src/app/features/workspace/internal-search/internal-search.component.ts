import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { DatePipe } from '@angular/common';
import { WorkspaceShellComponent } from '../../../shared/ui/workspace-shell/workspace-shell.component';
import { StatusBadgeComponent } from '../../../shared/ui/status-badge/status-badge.component';
import { InternalSearchFilter, MockDbService } from '../../../core/mock-api/mock-db.service';
import { TranslatePipe } from '../../../core/i18n/translate.pipe';
import { I18nService } from '../../../core/i18n/i18n.service';
import { MofButtonComponent } from '../../../shared/ui/mof-button/mof-button.component';
import { MofInputComponent } from '../../../shared/ui/mof-input/mof-input.component';
import { MofSelectComponent } from '../../../shared/ui/mof-select/mof-select.component';
import { MofIconComponent } from '../../../shared/ui/mof-icon/mof-icon.component';
import { DossierStatus } from '../../../core/models/domain.models';

/**
 * Screen W-03 | Specialist/leader/coordinator |
 * Tra cứu nội bộ theo mã/từ khóa/trạng thái/SLA + mở chi tiết.
 * UC-176..UC-187
 */
@Component({
  imports: [
    WorkspaceShellComponent,
    ReactiveFormsModule,
    RouterLink,
    DatePipe,
    StatusBadgeComponent,
    TranslatePipe,
    MofButtonComponent,
    MofInputComponent,
    MofSelectComponent,
    MofIconComponent,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './internal-search.component.html',
  styleUrl: './internal-search.component.scss',
})
export class InternalSearchComponent {
  readonly db = inject(MockDbService);
  readonly i18n = inject(I18nService);
  private readonly fb = inject(FormBuilder);
  readonly collapsed = signal(false);
  readonly filter = signal<InternalSearchFilter>({});

  readonly filterForm = this.fb.nonNullable.group({
    query: [''],
    status: ['all' as DossierStatus | 'all'],
    topicId: ['all'],
    sla: ['all' as 'all' | 'on-time' | 'near' | 'overdue'],
  });

  readonly statusOptions = computed(() => [
    { label: this.i18n.t('search.filterAll'), value: 'all' },
    { label: this.i18n.t('status.new'), value: 'new' },
    { label: this.i18n.t('status.received'), value: 'received' },
    { label: this.i18n.t('status.processing'), value: 'processing' },
    { label: this.i18n.t('status.waiting-approval'), value: 'waiting-approval' },
    { label: this.i18n.t('status.answered'), value: 'answered' },
    { label: this.i18n.t('status.published'), value: 'published' },
  ]);

  readonly slaOptions = computed(() => [
    { label: this.i18n.t('search.slaAll'), value: 'all' },
    { label: this.i18n.t('search.slaOnTime'), value: 'on-time' },
    { label: this.i18n.t('search.slaNear'), value: 'near' },
    { label: this.i18n.t('search.slaOverdue'), value: 'overdue' },
  ]);

  readonly topicOptions = computed(() => [
    { label: this.i18n.t('search.filterAll'), value: 'all' },
    ...this.db.topics.map((topic) => ({ label: topic.name, value: topic.id })),
  ]);

  readonly results = computed(() => this.db.searchInternal(this.filter()));

  search(): void {
    const value = this.filterForm.getRawValue();
    this.filter.set({
      query: value.query,
      status: value.status,
      topicId: value.topicId,
      sla: value.sla,
    });
  }

  clear(): void {
    this.filterForm.reset({ query: '', status: 'all', topicId: 'all', sla: 'all' });
    this.filter.set({});
  }
}
