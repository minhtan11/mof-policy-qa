import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { DatePipe } from '@angular/common';
import { ApexOptions } from 'apexcharts';
import { WorkspaceShellComponent } from '../../../shared/ui/workspace-shell/workspace-shell.component';
import { StatusBadgeComponent } from '../../../shared/ui/status-badge/status-badge.component';
import { MockDbService } from '../../../core/mock-api/mock-db.service';
import { AuthService } from '../../../core/auth/auth.service';
import { TranslatePipe } from '../../../core/i18n/translate.pipe';
import { I18nService } from '../../../core/i18n/i18n.service';
import { MofButtonComponent } from '../../../shared/ui/mof-button/mof-button.component';
import { MofChartComponent } from '../../../shared/ui/mof-chart/mof-chart.component';
import { MofIconComponent } from '../../../shared/ui/mof-icon/mof-icon.component';
import { DossierStatus } from '../../../core/models/domain.models';

type QueueFilter = 'all' | 'new' | 'processing' | 'waiting-approval';
const QUEUE_FILTERS: QueueFilter[] = ['all', 'new', 'processing', 'waiting-approval'];

/** Screen W-01 / DASH-01 | Reception, specialist, leader, coordinator | Dashboard live + hàng đợi. | UC-142..UC-149, UC-188..UC-191 */
@Component({
  imports: [
    WorkspaceShellComponent,
    RouterLink,
    DatePipe,
    StatusBadgeComponent,
    TranslatePipe,
    MofButtonComponent,
    MofChartComponent,
    MofIconComponent,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './workspace.component.html',
  styleUrl: './workspace.component.scss',
})
export class WorkspaceComponent {
  readonly db = inject(MockDbService);
  readonly auth = inject(AuthService);
  readonly i18n = inject(I18nService);
  readonly filter = signal<QueueFilter>('all');
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);

  constructor() {
    // Round 29: hàng đợi đồng bộ ?filter= (menu sidebar trỏ thẳng tới từng hàng đợi).
    this.route.queryParamMap.pipe(takeUntilDestroyed()).subscribe((p) => {
      const f = p.get('filter') as QueueFilter | null;
      this.filter.set(f && QUEUE_FILTERS.includes(f) ? f : 'all');
    });
  }

  readonly metrics = computed(() => {
    const items = this.db.dossiers();
    const newCount = items.filter((item) => item.status === 'new' || item.status === 'received').length;
    const processing = items.filter((item) => item.status === 'processing').length;
    const waiting = items.filter((item) => item.status === 'waiting-approval').length;
    const open = items.filter((item) => item.status !== 'published').length;
    const onTime = Math.max(open - 1, 0);
    return [
      { key: 'workspace.metricNew', value: newCount, tone: 'blue' as const },
      { key: 'workspace.metricProcessing', value: processing, tone: 'amber' as const },
      { key: 'workspace.metricApproval', value: waiting, tone: 'violet' as const },
      { key: 'workspace.metricOnTime', value: onTime, tone: 'green' as const },
    ];
  });

  readonly slaBreakdown = computed(() => {
    const items = this.db.dossiers().filter((item) => item.status !== 'published');
    const now = Date.now();
    let onTime = 0;
    let nearDue = 0;
    let overdue = 0;
    for (const item of items) {
      const due = new Date(item.dueAt).getTime();
      const hours = (due - now) / 3_600_000;
      if (hours < 0) {
        overdue += 1;
      } else if (hours <= 48) {
        nearDue += 1;
      } else {
        onTime += 1;
      }
    }
    return { onTime, nearDue, overdue };
  });

  readonly queue = computed(() => {
    const f = this.filter();
    if (f === 'all') {
      return this.db.activeQueue('all');
    }
    return this.db.activeQueue(f as DossierStatus);
  });

  readonly chartOptions = computed<ApexOptions>(() => {
    const sla = this.slaBreakdown();
    return {
      chart: { type: 'donut', height: 230, toolbar: { show: false }, fontFamily: 'Be Vietnam Pro, sans-serif' },
      labels: [this.i18n.t('workspace.onTime'), this.i18n.t('workspace.nearDue'), this.i18n.t('workspace.overdue')],
      series: [sla.onTime, sla.nearDue, sla.overdue],
      colors: ['#2d75b7', '#d89a35', '#c75151'],
      legend: { show: false },
      dataLabels: { enabled: false },
      stroke: { width: 0 },
      plotOptions: { pie: { donut: { size: '72%' } } },
    };
  });

  roleGreeting(): string {
    return this.auth.user()?.role === 'leader'
      ? this.i18n.t('workspace.greetingLeader')
      : this.i18n.t('workspace.greetingOfficer');
  }

  setFilter(value: QueueFilter): void {
    this.filter.set(value);
    void this.router.navigate([], { relativeTo: this.route, queryParams: { filter: value }, replaceUrl: true });
  }
}
