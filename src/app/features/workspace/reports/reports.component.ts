/**
 * Screen DASH-RPT | Báo cáo thống kê (workspace)
 * Lãnh đạo / điều phối sinh 16 báo cáo tóm tắt + biểu đồ từ ReportRepository.
 * UC-188..UC-203 | Permission: internalGuard; menu theo WS_ROLE_MATRIX reports-soon.
 */
import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { ApexOptions } from 'apexcharts';
import { WorkspaceShellComponent } from '../../../shared/ui/workspace-shell/workspace-shell.component';
import { TranslatePipe } from '../../../core/i18n/translate.pipe';
import { I18nService } from '../../../core/i18n/i18n.service';
import { AuthService } from '../../../core/auth/auth.service';
import { ToastService } from '../../../core/toast/toast.service';
import { GeneratedReport, ReportRepository } from '../../../core/mock-api/report.repository';
import { MofFiIconComponent } from '../../../shared/ui/mof-fi-icon/mof-fi-icon.component';
import { MofBreadcrumbComponent } from '../../../shared/ui/mof-breadcrumb/mof-breadcrumb.component';
import { MofBreadcrumbItem } from '../../../shared/ui/mof-breadcrumb/mof-breadcrumb.model';
import { MofButtonComponent } from '../../../shared/ui/mof-button/mof-button.component';
import { MofInputComponent } from '../../../shared/ui/mof-input/mof-input.component';
import { MofSelectComponent } from '../../../shared/ui/mof-select/mof-select.component';
import { MofChartComponent } from '../../../shared/ui/mof-chart/mof-chart.component';

@Component({
  imports: [
    WorkspaceShellComponent,
    ReactiveFormsModule,
    TranslatePipe,
    MofFiIconComponent,
    MofBreadcrumbComponent,
    MofButtonComponent,
    MofInputComponent,
    MofSelectComponent,
    MofChartComponent,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './reports.component.html',
  styleUrl: './reports.component.scss',
})
export class WorkspaceReportsComponent {
  readonly reports = inject(ReportRepository);
  readonly auth = inject(AuthService);
  readonly i18n = inject(I18nService);
  private readonly toast = inject(ToastService);
  private readonly fb = inject(FormBuilder);

  readonly crumbs: MofBreadcrumbItem[] = [
    { labelKey: 'workspace.navOverview', link: '/workspace' },
    { labelKey: 'wsNav.reports', current: true },
  ];

  readonly reportOptions = this.reports.definitions.map((item) => ({
    label: `${item.code} · ${item.name}`,
    value: item.id,
  }));

  readonly reportForm = this.fb.nonNullable.group({
    reportId: [this.reports.definitions[0]?.id ?? ''],
    from: ['01/10/2026'],
    to: ['20/10/2026'],
  });

  readonly reportResult = signal<GeneratedReport | null>(null);

  readonly reportChart = computed<ApexOptions | null>(() => {
    const result = this.reportResult();
    if (!result) return null;
    return {
      chart: { type: 'bar', height: 260, toolbar: { show: false }, fontFamily: 'Be Vietnam Pro, sans-serif' },
      series: [{ name: result.report.code, data: result.rows.map((row) => row.value) }],
      xaxis: { categories: result.rows.map((row) => this.i18n.t(row.labelKey)) },
      colors: ['#2d75b7'],
      dataLabels: { enabled: false },
      grid: { borderColor: 'rgba(45,117,183,0.12)' },
    };
  });

  readonly defsByCategory = computed(() => {
    const map = new Map<string, typeof this.reports.definitions>();
    for (const r of this.reports.definitions) {
      const list = map.get(r.category) ?? [];
      list.push(r);
      map.set(r.category, list);
    }
    return [...map.entries()];
  });

  generateReport(): void {
    const { reportId, from, to } = this.reportForm.getRawValue();
    const result = this.reports.generateById(reportId, from, to);
    if (!result) {
      this.toast.show({ severity: 'warn', summary: this.i18n.t('admin.reports.err') });
      return;
    }
    this.reportResult.set(result);
    this.toast.show({ severity: 'success', summary: this.i18n.t('admin.reports.toast') });
  }

  pickReport(id: string): void {
    this.reportForm.patchValue({ reportId: id });
  }
}
