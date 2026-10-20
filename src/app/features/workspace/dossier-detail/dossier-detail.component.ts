import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { DatePipe, DecimalPipe } from '@angular/common';
import { WorkspaceShellComponent } from '../../../shared/ui/workspace-shell/workspace-shell.component';
import { StatusBadgeComponent } from '../../../shared/ui/status-badge/status-badge.component';
import { MockDbService } from '../../../core/mock-api/mock-db.service';
import { AuthService } from '../../../core/auth/auth.service';
import { AiAdvisorService } from '../../../core/mock-api/ai-advisor.service';
import { WorkflowRepository } from '../../../core/mock-api/workflow.repository';
import { ToastService } from '../../../shared/ui/toast/toast.service';
import { TranslatePipe } from '../../../core/i18n/translate.pipe';
import { I18nService } from '../../../core/i18n/i18n.service';
import { MofButtonComponent } from '../../../shared/ui/mof-button/mof-button.component';
import { MofTextareaComponent } from '../../../shared/ui/mof-textarea/mof-textarea.component';
import { MofSelectComponent } from '../../../shared/ui/mof-select/mof-select.component';
import { MofInputComponent } from '../../../shared/ui/mof-input/mof-input.component';
import { MofCheckboxComponent } from '../../../shared/ui/mof-checkbox/mof-checkbox.component';
import { MofIconComponent } from '../../../shared/ui/mof-icon/mof-icon.component';
import { DossierStatus, UserRole } from '../../../core/models/domain.models';
import { USERS } from '../../../core/mock-api/demo-data';
import { OrganizationRepository } from '../../../core/mock-api/organization.repository';

/** Screen W-02 | Reception/specialist/leader/coordinator | Tiếp nhận→xuất bản + thu hồi, phối hợp, bút phê. | UC-142..UC-161, UC-176..UC-187 */
@Component({
  imports: [
    WorkspaceShellComponent,
    RouterLink,
    ReactiveFormsModule,
    DatePipe,
    DecimalPipe,
    StatusBadgeComponent,
    TranslatePipe,
    MofButtonComponent,
    MofTextareaComponent,
    MofSelectComponent,
    MofInputComponent,
    MofCheckboxComponent,
    MofIconComponent,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './dossier-detail.component.html',
  styleUrl: './dossier-detail.component.scss',
})
export class DossierDetailComponent {
  readonly db = inject(MockDbService);
  readonly auth = inject(AuthService);
  readonly ai = inject(AiAdvisorService);
  readonly workflow = inject(WorkflowRepository);
  readonly orgs = inject(OrganizationRepository);
  readonly i18n = inject(I18nService);
  private readonly route = inject(ActivatedRoute);
  private readonly toast = inject(ToastService);
  private readonly fb = inject(FormBuilder);

  readonly saving = signal(false);
  readonly id = this.route.snapshot.paramMap.get('id') ?? '';
  readonly dossier = computed(() => this.db.dossiers().find((item) => item.id === this.id));
  readonly aiSuggestions = computed(() => this.ai.suggestions().filter((item) => item.dossierId === this.id));

  readonly specialistOptions = USERS.filter((user) => user.role === 'specialist').map((user) => ({
    label: `${user.name} · ${user.organization ?? ''}`,
    value: user.name,
  }));

  readonly unitOptions = computed(() =>
    this.orgs
      .units()
      .filter((unit) => unit.active && unit.parentId)
      .map((unit) => ({ label: `${unit.code} · ${unit.name}`, value: unit.id })),
  );

  readonly draftForm = this.fb.nonNullable.group({
    answer: [''],
    legalItem: [''],
    assignee: [''],
    signed: [false],
  });

  readonly collabForm = this.fb.nonNullable.group({
    unitId: [''],
    note: [''],
    dueAt: [''],
  });

  readonly clarifyForm = this.fb.nonNullable.group({
    text: [''],
  });

  readonly recallForm = this.fb.nonNullable.group({
    reason: [''],
  });

  readonly noteForm = this.fb.nonNullable.group({
    text: [''],
  });

  readonly legalBasis = signal<string[]>([]);

  constructor() {
    const item = this.dossier();
    if (item) {
      this.draftForm.patchValue({ answer: item.answer ?? '', assignee: item.assignedTo ?? '' });
      this.legalBasis.set([...(item.legalBasis ?? [])]);
    }
  }

  readonly role = computed(() => this.auth.user()?.role ?? null);

  canReceive = computed(() => {
    const status = this.dossier()?.status;
    return !!status && status === 'new' && this.hasRole(['reception', 'coordinator', 'system-admin']);
  });

  canReject = computed(() => {
    const status = this.dossier()?.status;
    return (
      !!status &&
      ['new', 'received', 'processing'].includes(status) &&
      this.hasRole(['reception', 'coordinator', 'system-admin'])
    );
  });

  canAssign = computed(() => {
    const status = this.dossier()?.status;
    return !!status && ['new', 'received'].includes(status) && this.hasRole(['reception', 'coordinator', 'system-admin']);
  });

  canDraft = computed(() => {
    const status = this.dossier()?.status;
    return (
      !!status &&
      ['processing', 'returned'].includes(status) &&
      this.hasRole(['specialist', 'coordinator', 'system-admin'])
    );
  });

  canSubmit = computed(() => this.canDraft());

  canClarify = computed(() => {
    return this.dossier()?.status === 'processing' && this.hasRole(['specialist', 'coordinator', 'system-admin']);
  });

  canCollaborate = computed(() => {
    return this.dossier()?.status === 'processing' && this.hasRole(['specialist', 'coordinator', 'system-admin']);
  });

  canResume = computed(() => {
    const status = this.dossier()?.status;
    return (
      !!status &&
      ['awaiting-clarification', 'awaiting-collaboration', 'returned'].includes(status) &&
      this.hasRole(['specialist', 'leader', 'coordinator', 'system-admin'])
    );
  });

  canReturn = computed(() => {
    return this.dossier()?.status === 'waiting-approval' && this.hasRole(['leader', 'coordinator', 'system-admin']);
  });

  canApprove = computed(() => {
    return this.dossier()?.status === 'waiting-approval' && this.hasRole(['leader', 'system-admin']);
  });

  canPublish = computed(() => {
    const status = this.dossier()?.status;
    return (
      !!status &&
      ['answered', 'approved', 'waiting-approval'].includes(status) &&
      this.hasRole(['leader', 'coordinator', 'system-admin'])
    );
  });

  canClose = computed(() => {
    const status = this.dossier()?.status;
    return (
      !!status &&
      ['answered', 'published'].includes(status) &&
      this.hasRole(['leader', 'coordinator', 'system-admin'])
    );
  });

  canRecall = computed(() => {
    const item = this.dossier();
    return !!item && item.status === 'published' && item.isPublic && this.hasRole(['leader', 'coordinator', 'system-admin']);
  });

  canAuditNote = computed(() => this.hasRole(['specialist', 'leader', 'coordinator', 'system-admin', 'reception']));

  topicName(id: string): string {
    return this.db.topics.find((t) => t.id === id)?.name ?? '—';
  }

  addLegal(): void {
    const value = this.draftForm.controls.legalItem.value.trim();
    if (!value) {
      return;
    }
    this.legalBasis.update((items) => [...items, value]);
    this.draftForm.controls.legalItem.setValue('');
  }

  removeLegal(index: number): void {
    this.legalBasis.update((items) => items.filter((_, i) => i !== index));
  }

  saveDraft(): void {
    this.db.updateAnswer(this.id, this.draftForm.controls.answer.value, this.legalBasis());
    this.toast.show({
      severity: 'success',
      summary: this.i18n.t('dossier.toastDraft'),
      detail: this.i18n.t('dossier.toastDraftBody'),
    });
  }

  receive(): void {
    this.transition('received', 'dossier.toastReceive', 'Tiếp nhận hồ sơ', 'Hồ sơ đã được tiếp nhận vào hàng đợi xử lý.');
  }

  reject(): void {
    this.transition('rejected', 'dossier.toastReject', 'Từ chối tiếp nhận', 'Hồ sơ ngoài phạm vi hoặc không đủ điều kiện tiếp nhận.');
  }

  assign(): void {
    const name = this.draftForm.controls.assignee.value;
    if (!name) {
      this.toast.show({ severity: 'warn', summary: this.i18n.t('dossier.errAssign'), detail: this.dossier()?.code ?? '' });
      return;
    }
    const unitId = USERS.find((u) => u.name === name)?.organizationId;
    const ok = this.db.assign(this.id, name, this.actorName(), unitId);
    if (!ok) {
      this.toast.show({ severity: 'warn', summary: this.i18n.t('dossier.errTransition'), detail: this.dossier()?.code ?? '' });
      return;
    }
    this.toast.show({ severity: 'success', summary: this.i18n.t('dossier.toastAssign'), detail: this.dossier()?.code ?? '' });
  }

  sendForApproval(): void {
    if (!this.draftForm.controls.answer.value.trim()) {
      this.toast.show({ severity: 'warn', summary: this.i18n.t('dossier.errDraft'), detail: this.dossier()?.code ?? '' });
      return;
    }
    this.saveDraft();
    this.transition(
      'waiting-approval',
      'dossier.toastSubmit',
      'Trình phê duyệt',
      'Dự thảo đã được gửi lãnh đạo xem xét.',
    );
  }

  requestClarify(): void {
    const text = this.clarifyForm.controls.text.value.trim();
    if (!text) {
      this.toast.show({ severity: 'warn', summary: this.i18n.t('dossier.errClarify'), detail: this.dossier()?.code ?? '' });
      return;
    }
    const saved = this.db.requestClarification(this.id, text, this.actorName());
    if (!saved) {
      this.toast.show({ severity: 'warn', summary: this.i18n.t('dossier.errTransition'), detail: this.dossier()?.code ?? '' });
      return;
    }
    this.clarifyForm.reset({ text: '' });
    this.toast.show({ severity: 'success', summary: this.i18n.t('dossier.toastClarify'), detail: this.dossier()?.code ?? '' });
  }

  resumeProcessing(): void {
    this.transition('processing', 'dossier.toastResume', 'Tiếp tục xử lý', 'Hồ sơ đã được đưa lại trạng thái đang xử lý.');
  }

  returnForRevision(): void {
    this.transition('returned', 'dossier.toastReturn', 'Trả sửa dự thảo', 'Lãnh đạo yêu cầu chỉnh sửa trước khi duyệt.');
  }

  approveOnly(): void {
    this.transition('approved', 'dossier.toastApprove', 'Phê duyệt nội dung', 'Dự thảo đã được phê duyệt, chờ xuất bản.');
  }

  publish(): void {
    if (!this.draftForm.controls.signed.value) {
      this.toast.show({ severity: 'warn', summary: this.i18n.t('dossier.errSign'), detail: this.dossier()?.code ?? '' });
      return;
    }
    const from = this.dossier()?.status;
    if (!from || !this.workflow.canTransition(from, 'published')) {
      this.toast.show({ severity: 'warn', summary: this.i18n.t('dossier.errTransition'), detail: this.dossier()?.code ?? '' });
      return;
    }
    this.transition(
      'published',
      'dossier.toastPublish',
      'Xuất bản công khai',
      'Câu trả lời đã được công khai trên cổng thông tin.',
    );
  }

  approveAndPublish(): void {
    if (!this.draftForm.controls.signed.value) {
      this.toast.show({ severity: 'warn', summary: this.i18n.t('dossier.errSign'), detail: this.dossier()?.code ?? '' });
      return;
    }
    this.transition(
      'published',
      'dossier.toastPublish',
      'Phê duyệt và công khai',
      'Câu trả lời đã được phê duyệt và công khai trên cổng thông tin.',
    );
  }

  close(): void {
    this.transition('closed', 'dossier.toastClose', 'Đóng hồ sơ', 'Hồ sơ đã được đóng trên hệ thống nội bộ.');
  }

  recall(): void {
    const reason = this.recallForm.controls.reason.value.trim();
    if (!reason) {
      this.toast.show({ severity: 'warn', summary: this.i18n.t('dossier.errRecall'), detail: this.dossier()?.code ?? '' });
      return;
    }
    const from = this.dossier()?.status;
    if (!from || !this.workflow.canTransition(from, 'answered')) {
      this.toast.show({ severity: 'warn', summary: this.i18n.t('dossier.errTransition'), detail: this.dossier()?.code ?? '' });
      return;
    }
    const ok = this.db.recall(this.id, this.actorName(), reason);
    if (!ok) {
      this.toast.show({ severity: 'warn', summary: this.i18n.t('dossier.errTransition'), detail: this.dossier()?.code ?? '' });
      return;
    }
    this.recallForm.reset({ reason: '' });
    this.toast.show({ severity: 'success', summary: this.i18n.t('dossier.toastRecall'), detail: this.dossier()?.code ?? '' });
  }

  requestCollab(): void {
    const { unitId, note, dueAt } = this.collabForm.getRawValue();
    const unit = this.orgs.find(unitId);
    if (!unit || !note.trim()) {
      this.toast.show({ severity: 'warn', summary: this.i18n.t('dossier.errCollab'), detail: this.dossier()?.code ?? '' });
      return;
    }
    const saved = this.db.requestCollaboration(this.id, {
      unitId,
      unitName: unit.name,
      note,
      dueAt: dueAt || new Date(Date.now() + 3 * 86_400_000).toISOString().slice(0, 10),
      requestedBy: this.actorName(),
    });
    if (!saved) {
      this.toast.show({ severity: 'warn', summary: this.i18n.t('dossier.errCollab'), detail: this.dossier()?.code ?? '' });
      return;
    }
    this.collabForm.reset({ unitId: '', note: '', dueAt: '' });
    this.toast.show({ severity: 'success', summary: this.i18n.t('dossier.toastCollab'), detail: this.dossier()?.code ?? '' });
  }

  addNote(): void {
    const text = this.noteForm.controls.text.value;
    const saved = this.db.addAuditNote(this.id, text, this.actorName());
    if (!saved) {
      this.toast.show({ severity: 'warn', summary: this.i18n.t('dossier.errNote'), detail: this.dossier()?.code ?? '' });
      return;
    }
    this.noteForm.reset({ text: '' });
    this.toast.show({ severity: 'success', summary: this.i18n.t('dossier.toastNote'), detail: this.dossier()?.code ?? '' });
  }

  runAi(): void {
    this.ai.suggestFor(this.id, this.dossier()?.question ?? '');
    this.toast.show({
      severity: 'info',
      summary: this.i18n.t('dossier.toastAi'),
      detail: this.i18n.t('dossier.toastAiBody'),
    });
  }

  acceptAi(id: string): void {
    this.ai.accept(id);
    this.toast.show({
      severity: 'success',
      summary: this.i18n.t('dossier.toastAiAccept'),
      detail: this.dossier()?.code ?? '',
    });
  }

  rejectAi(id: string): void {
    this.ai.reject(id);
  }

  private transition(to: DossierStatus, toastKey: string, title: string, description: string): void {
    const from = this.dossier()?.status;
    if (!from || !this.workflow.canTransition(from, to)) {
      this.toast.show({ severity: 'warn', summary: this.i18n.t('dossier.errTransition'), detail: this.dossier()?.code ?? '' });
      return;
    }
    this.saving.set(true);
    window.setTimeout(() => {
      this.db.updateStatus(this.id, to, this.actorName(), title, description);
      this.saving.set(false);
      this.toast.show({ severity: 'success', summary: this.i18n.t(toastKey), detail: this.dossier()?.code ?? '' });
    }, 420);
  }

  private actorName(): string {
    return this.auth.user()?.name ?? 'Cán bộ';
  }

  private hasRole(roles: UserRole[]): boolean {
    return this.auth.hasAnyRole(roles);
  }
}
