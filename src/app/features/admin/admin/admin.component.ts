import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { DatePipe, DecimalPipe } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ApexOptions } from 'apexcharts';
import { ActivatedRoute, Router } from '@angular/router';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { WorkspaceShellComponent } from '../../../shared/ui/workspace-shell/workspace-shell.component';
import { CatalogRepository } from '../../../core/mock-api/catalog.repository';
import { LegalDocumentRepository } from '../../../core/mock-api/legal-document.repository';
import { WorkflowRepository } from '../../../core/mock-api/workflow.repository';
import { ReportRepository, GeneratedReport } from '../../../core/mock-api/report.repository';
import { AiAdvisorService } from '../../../core/mock-api/ai-advisor.service';
import { OrganizationRepository } from '../../../core/mock-api/organization.repository';
import { AdminAccountRepository } from '../../../core/mock-api/admin-account.repository';
import { PermissionRepository } from '../../../core/mock-api/permission.repository';
import { OpsRepository } from '../../../core/mock-api/ops.repository';
import { ToastService } from '../../../shared/ui/toast/toast.service';
import { AiModelInfo } from '../../../core/models/domain.models';
import { TranslatePipe } from '../../../core/i18n/translate.pipe';
import { I18nService } from '../../../core/i18n/i18n.service';
import { MofButtonComponent } from '../../../shared/ui/mof-button/mof-button.component';
import { MofBadgeComponent } from '../../../shared/ui/mof-badge/mof-badge.component';
import { MofInputComponent } from '../../../shared/ui/mof-input/mof-input.component';
import { MofSelectComponent } from '../../../shared/ui/mof-select/mof-select.component';
import { MofChartComponent } from '../../../shared/ui/mof-chart/mof-chart.component';
import { CatalogEntry } from '../../../core/models/domain.models';
import { TOPICS } from '../../../core/mock-api/demo-data';

type AdminTab = 'org' | 'users' | 'roles' | 'catalog' | 'workflow' | 'legal' | 'ai' | 'ops' | 'reports';
const ADMIN_TABS: AdminTab[] = ['org', 'users', 'roles', 'catalog', 'workflow', 'legal', 'ai', 'ops', 'reports'];

/**
 * Screen A-01..A-09 | System administrator |
 * Tổ chức, user, quyền, danh mục, workflow/SLA, VBPL, AI ops, vận hành, báo cáo 16.
 * UC-009..UC-099, UC-127..UC-134, UC-188..UC-203
 */
@Component({
  imports: [
    WorkspaceShellComponent,
    ReactiveFormsModule,
    DatePipe,
    DecimalPipe,
    TranslatePipe,
    MofButtonComponent,
    MofBadgeComponent,
    MofInputComponent,
    MofSelectComponent,
    MofChartComponent,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './admin.component.html',
  styleUrl: './admin.component.scss',
})
export class AdminComponent {
  readonly activeTab = signal<AdminTab>('org');
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  /** Round 29: tab đồng bộ ?tab= (sidebar HỆ THỐNG / VĂN BẢN trỏ thẳng tới tab). */
  private readonly tabSync = this.route.queryParamMap.pipe(takeUntilDestroyed()).subscribe((p) => {
    const t = p.get('tab') as AdminTab | null;
    this.activeTab.set(t && ADMIN_TABS.includes(t) ? t : 'org');
  });

  selectTab(tab: AdminTab): void {
    this.activeTab.set(tab);
    void this.router.navigate([], { relativeTo: this.route, queryParams: { tab: tab === 'org' ? null : tab }, replaceUrl: true });
  }
  readonly i18n = inject(I18nService);
  private readonly fb = inject(FormBuilder);
  private readonly toast = inject(ToastService);

  readonly catalog = inject(CatalogRepository);
  readonly legal = inject(LegalDocumentRepository);
  readonly workflow = inject(WorkflowRepository);
  readonly reports = inject(ReportRepository);
  readonly ai = inject(AiAdvisorService);
  readonly orgs = inject(OrganizationRepository);
  readonly accounts = inject(AdminAccountRepository);
  readonly permissions = inject(PermissionRepository);
  readonly ops = inject(OpsRepository);

  readonly tabs: Array<{ id: AdminTab; labelKey: string }> = [
    { id: 'org', labelKey: 'admin.tab.org' },
    { id: 'users', labelKey: 'admin.tab.users' },
    { id: 'roles', labelKey: 'admin.tab.roles' },
    { id: 'catalog', labelKey: 'admin.tab.catalog' },
    { id: 'workflow', labelKey: 'admin.tab.workflow' },
    { id: 'legal', labelKey: 'admin.tab.legal' },
    { id: 'ai', labelKey: 'admin.tab.ai' },
    { id: 'ops', labelKey: 'admin.tab.ops' },
    { id: 'reports', labelKey: 'admin.tab.reports' },
  ];

  readonly catalogTypeOptions = [
    { label: 'priority', value: 'priority' },
    { label: 'tag', value: 'tag' },
    { label: 'intake-method', value: 'intake-method' },
    { label: 'answer-template', value: 'answer-template' },
    { label: 'topic', value: 'topic' },
  ];

  readonly parentOrgOptions = computed(() =>
    this.orgs.units().map((unit) => ({ label: `${unit.code} · ${unit.name}`, value: unit.id })),
  );

  readonly reportOptions = this.reports.definitions.map((item) => ({
    label: `${item.code} · ${item.name}`,
    value: item.id,
  }));

  readonly orgForm = this.fb.nonNullable.group({
    code: ['', Validators.required],
    name: ['', Validators.required],
    parentId: [''],
  });

  readonly catalogForm = this.fb.nonNullable.group({
    type: ['tag' as CatalogEntry['type'], Validators.required],
    code: ['', Validators.required],
    label: ['', Validators.required],
  });

  readonly workflowForm = this.fb.nonNullable.group({
    name: ['', Validators.required],
    slaDays: ['7', Validators.required],
  });

  readonly slaForm = this.fb.nonNullable.group({
    workflowId: [''],
    slaDays: ['7', Validators.required],
  });

  readonly workflowOptions = computed(() =>
    this.workflow
      .workflows()
      .filter((item) => item.status !== 'archived')
      .map((item) => ({ label: `${item.name} (v${item.version})`, value: item.id })),
  );

  readonly legalForm = this.fb.nonNullable.group({
    code: ['', Validators.required],
    title: ['', Validators.required],
    query: [''],
  });

  readonly reportForm = this.fb.nonNullable.group({
    reportId: [this.reports.definitions[0]?.id ?? ''],
    from: ['01/10/2026'],
    to: ['20/10/2026'],
  });

  readonly reportResult = signal<GeneratedReport | null>(null);

  readonly reportChart = computed<ApexOptions | null>(() => {
    const result = this.reportResult();
    if (!result) {
      return null;
    }
    return {
      chart: { type: 'bar', height: 220, toolbar: { show: false }, fontFamily: 'Be Vietnam Pro, sans-serif' },
      series: [{ name: result.report.code, data: result.rows.map((row) => row.value) }],
      xaxis: { categories: result.rows.map((row) => this.i18n.t(row.labelKey)) },
      colors: ['#2d75b7'],
      dataLabels: { enabled: false },
      grid: { borderColor: 'rgba(45,117,183,0.12)' },
    };
  });

  roleLabel(role: string): string {
    return this.i18n.t(`admin.role.${role}`);
  }

  scopeLabel(scope: string): string {
    return this.i18n.t(`admin.roles.scope.${scope}`);
  }

  orgName(id: string): string {
    return this.orgs.nameOf(id);
  }

  topicLabels(ids: string[]): string {
    if (!ids.length) {
      return '—';
    }
    return ids.map((id) => TOPICS.find((topic) => topic.id === id)?.name ?? id).join(', ');
  }

  parentLabel(parentId: string | null): string {
    if (!parentId) {
      return this.i18n.t('admin.org.root');
    }
    return this.orgs.nameOf(parentId);
  }

  toggleOrg(id: string): void {
    this.orgs.toggle(id);
    this.toast.show({ severity: 'success', summary: this.i18n.t('admin.org.toastToggle') });
  }

  addOrg(): void {
    const { code, name, parentId } = this.orgForm.getRawValue();
    if (!code.trim() || !name.trim()) {
      this.toast.show({ severity: 'warn', summary: this.i18n.t('admin.catalog.err') });
      return;
    }
    this.orgs.add({
      code: code.trim().toUpperCase(),
      name: name.trim(),
      parentId: parentId || null,
      intakeTopicIds: [],
      active: true,
    });
    this.orgForm.reset({ code: '', name: '', parentId: '' });
    this.toast.show({ severity: 'success', summary: this.i18n.t('admin.org.toastAdd') });
  }

  toggleUser(id: string): void {
    this.accounts.toggleActive(id);
    this.toast.show({ severity: 'success', summary: this.i18n.t('admin.users.toastToggle') });
  }

  toggleCatalog(id: string): void {
    this.catalog.toggle(id);
    this.toast.show({ severity: 'success', summary: this.i18n.t('admin.catalog.toastToggle') });
  }

  addCatalog(): void {
    const { type, code, label } = this.catalogForm.getRawValue();
    if (!code.trim() || !label.trim()) {
      this.toast.show({ severity: 'warn', summary: this.i18n.t('admin.catalog.err') });
      return;
    }
    this.catalog.add({
      type,
      code: code.trim().toUpperCase(),
      label: label.trim(),
      active: true,
      sortOrder: this.catalog.entries().length + 1,
    });
    this.catalogForm.reset({ type: 'tag', code: '', label: '' });
    this.toast.show({ severity: 'success', summary: this.i18n.t('admin.catalog.toastAdd') });
  }

  quickCreateWorkflow(): void {
    this.workflow.createDraft(`Draft ${this.workflow.workflows().length + 1}`, 7);
    this.selectTab('workflow');
    this.toast.show({ severity: 'success', summary: this.i18n.t('admin.wf.toastCreate') });
  }

  createWorkflow(): void {
    const { name, slaDays } = this.workflowForm.getRawValue();
    const days = Number(slaDays);
    if (!name.trim() || !Number.isFinite(days) || days < 1) {
      this.toast.show({ severity: 'warn', summary: this.i18n.t('admin.wf.err') });
      return;
    }
    this.workflow.createDraft(name.trim(), Math.round(days));
    this.workflowForm.reset({ name: '', slaDays: '7' });
    this.selectTab('workflow');
    this.toast.show({ severity: 'success', summary: this.i18n.t('admin.wf.toastCreate') });
  }

  activateWorkflow(id: string): void {
    this.workflow.activate(id);
    this.toast.show({ severity: 'success', summary: this.i18n.t('admin.wf.toastActivate') });
  }

  saveSla(): void {
    const { workflowId, slaDays } = this.slaForm.getRawValue();
    const days = Number(slaDays);
    if (!workflowId || !this.workflow.updateSla(workflowId, days)) {
      this.toast.show({ severity: 'warn', summary: this.i18n.t('admin.wf.err') });
      return;
    }
    this.toast.show({ severity: 'success', summary: this.i18n.t('admin.wf.toastSla') });
  }

  addLegal(): void {
    const { code, title } = this.legalForm.getRawValue();
    if (!code.trim() || !title.trim()) {
      this.toast.show({ severity: 'warn', summary: this.i18n.t('admin.legal.err') });
      return;
    }
    this.legal.add({
      code: code.trim(),
      title: title.trim(),
      issuer: 'Bộ Tài chính',
      issuedAt: new Date().toISOString(),
      effectiveFrom: new Date().toISOString(),
      status: 'draft',
      version: 1,
      chapters: 0,
      source: 'manual',
    });
    this.legalForm.patchValue({ code: '', title: '' });
    this.toast.show({ severity: 'success', summary: this.i18n.t('admin.legal.toastAdd') });
  }

  publishLegal(id: string): void {
    this.legal.updateStatus(id, 'effective');
    this.toast.show({ severity: 'success', summary: this.i18n.t('admin.legal.toastStatus') });
  }

  runAi(): void {
    this.ai.suggestFor(
      'd-001',
      'Doanh nghiệp mới thành lập cần thực hiện các thủ tục khai thuế ban đầu như thế nào?',
    );
    this.toast.show({ severity: 'info', summary: this.i18n.t('admin.ai.toastRun') });
  }

  acceptAi(id: string): void {
    this.ai.accept(id);
    this.toast.show({ severity: 'success', summary: this.i18n.t('admin.ai.toastAccept') });
  }

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

  legalQuery(): string {
    return this.legalForm.controls.query.value;
  }

  runJob(id: string): void {
    this.ops.runJob(id);
    this.toast.show({ severity: 'info', summary: this.i18n.t('admin.ops.toastJob') });
  }

  createBackup(): void {
    this.ops.createBackup(this.i18n.t('admin.ops.backupLabel'));
    this.toast.show({ severity: 'success', summary: this.i18n.t('admin.ops.toastBackup') });
  }

  resetSeed(): void {
    this.ops.resetSeed();
    this.toast.show({ severity: 'success', summary: this.i18n.t('admin.ops.toastReset') });
  }

  cycleModel(id: string, current: AiModelInfo['status']): void {
    const next: AiModelInfo['status'] =
      current === 'online' ? 'degraded' : current === 'degraded' ? 'offline' : 'online';
    this.ops.setModelStatus(id, next);
    this.toast.show({ severity: 'success', summary: this.i18n.t('admin.ops.toastModel') });
  }
}
