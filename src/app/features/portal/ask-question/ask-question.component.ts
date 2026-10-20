import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { PortalHeaderComponent } from '../../../shared/ui/portal-header/portal-header.component';
import { MockDbService } from '../../../core/mock-api/mock-db.service';
import { AuthService } from '../../../core/auth/auth.service';
import { ToastService } from '../../../shared/ui/toast/toast.service';
import { TranslatePipe } from '../../../core/i18n/translate.pipe';
import { I18nService } from '../../../core/i18n/i18n.service';
import { MofButtonComponent } from '../../../shared/ui/mof-button/mof-button.component';
import { MofInputComponent } from '../../../shared/ui/mof-input/mof-input.component';
import { MofSelectComponent } from '../../../shared/ui/mof-select/mof-select.component';
import { MofTextareaComponent } from '../../../shared/ui/mof-textarea/mof-textarea.component';
import { MofIconComponent } from '../../../shared/ui/mof-icon/mof-icon.component';
import { MofCheckboxComponent } from '../../../shared/ui/mof-checkbox/mof-checkbox.component';
import { MofStepperComponent, MofStepperStep } from '../../../shared/ui/mof-stepper/mof-stepper.component';
import { MofFileUploadComponent } from '../../../shared/ui/mof-file-upload/mof-file-upload.component';
import { Dossier } from '../../../core/models/domain.models';
import { MofFiIconComponent } from '../../../shared/ui/mof-fi-icon/mof-fi-icon.component';
import { MofFieldErrorComponent } from '../../../shared/ui/mof-field-error/mof-field-error.component';
import { PageBackdropComponent } from '../../../shared/ui/page-backdrop/page-backdrop.component';

/**
 * Screen PUB-02 | Citizen/business | Wizard submit policy question with similar/consent. | UC-100..UC-113 | Permission: public submit
 * Stepper bấm được: lùi/bước hiện tại luôn vào được; bước sau chỉ khi các bước trước hợp lệ (validate + báo lỗi tại chỗ).
 */
@Component({
  imports: [
    PortalHeaderComponent,
    ReactiveFormsModule,
    RouterLink,
    TranslatePipe,
    MofButtonComponent,
    MofInputComponent,
    MofSelectComponent,
    MofTextareaComponent,
    MofIconComponent,
    MofCheckboxComponent,
    MofStepperComponent,
    MofFileUploadComponent,
    MofFiIconComponent,
    MofFieldErrorComponent,
    PageBackdropComponent,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './ask-question.component.html',
  styleUrl: './ask-question.component.scss',
})
export class AskQuestionComponent {
  readonly db = inject(MockDbService);
  readonly i18n = inject(I18nService);
  private readonly fb = inject(FormBuilder);
  private readonly auth = inject(AuthService);
  private readonly route = inject(ActivatedRoute);
  private readonly toast = inject(ToastService);

  readonly step = signal(0);
  readonly saving = signal(false);
  readonly submitted = signal<Dossier | null>(null);
  readonly stepError = signal('');
  /** Bước xa nhất đã tới (để giữ dấu check khi quay lại). */
  readonly furthest = signal(0);

  readonly topicOptions = computed(() => this.db.topics.map((topic) => ({ label: topic.name, value: topic.id })));
  readonly priorityOptions = computed(() => [
    { label: this.i18n.t('ask.priorityNormal'), value: 'normal' },
    { label: this.i18n.t('ask.priorityHigh'), value: 'high' },
    { label: this.i18n.t('ask.priorityUrgent'), value: 'urgent' },
  ]);
  readonly stepperSteps = computed<MofStepperStep[]>(() => [
    { id: 'content', label: this.i18n.t('ask.stepContent') },
    { id: 'contact', label: this.i18n.t('ask.stepContact') },
    { id: 'confirm', label: this.i18n.t('ask.stepConfirm') },
  ]);

  readonly form = this.fb.nonNullable.group({
    topicId: [this.route.snapshot.queryParamMap.get('topic') ?? '', Validators.required],
    question: ['', [Validators.required, Validators.minLength(20)]],
    priority: ['normal' as 'normal' | 'high' | 'urgent', Validators.required],
    sender: [this.auth.user()?.name ?? '', Validators.required],
    senderEmail: [this.auth.user()?.email ?? '', [Validators.required, Validators.email]],
    organization: [this.auth.user()?.organization ?? ''],
    attachments: [[] as string[]],
    consent: [false, Validators.requiredTrue],
  });

  private readonly formStatus = toSignal(this.form.statusChanges, { initialValue: this.form.status });

  /** Bước đã hoàn thành = đã từng đi qua và hiện vẫn hợp lệ. */
  readonly completedSteps = computed(() => {
    this.formStatus();
    const out: number[] = [];
    if (this.furthest() > 0 && this.contentOk()) out.push(0);
    if (this.furthest() > 1 && this.contactOk()) out.push(1);
    return out;
  });

  readonly similar = computed(() => {
    const { question, topicId } = this.form.getRawValue();
    if (this.step() < 2 || question.trim().length < 20 || !topicId) {
      return [] as Dossier[];
    }
    return this.db.findSimilar(question, topicId);
  });

  topicName(id: string): string {
    return this.db.topics.find((topic) => topic.id === id)?.name ?? id;
  }

  dueLabel(iso: string): string {
    return new Date(iso).toLocaleDateString(this.i18n.locale() === 'vi' ? 'vi-VN' : 'en-GB');
  }

  next(): void {
    this.goTo(this.step() + 1);
  }

  back(): void {
    this.goTo(this.step() - 1);
  }

  /**
   * Chuyển bước: lùi / đứng yên luôn được. Tiến: validate lần lượt từng bước trước đích;
   * bước đầu tiên không hợp lệ sẽ được hiển thị (nếu là bước hiện tại thì ở lại) kèm thông báo lỗi.
   */
  goTo(target: number): void {
    const to = Math.max(0, Math.min(2, target));
    this.stepError.set('');
    for (let s = this.step(); s < to; s++) {
      const ok = s === 0 ? this.validateContent() : this.validateContact();
      if (!ok) {
        this.setStep(s);
        this.toast.warning('toast.stepBlocked', { params: { step: this.stepperSteps()[s].label } });
        return;
      }
    }
    this.setStep(to);
  }

  private setStep(s: number): void {
    this.step.set(s);
    this.furthest.update((f) => Math.max(f, s));
  }

  private contentOk(): boolean {
    return this.form.controls.topicId.valid && this.form.controls.question.valid;
  }

  private contactOk(): boolean {
    return this.form.controls.sender.valid && this.form.controls.senderEmail.valid;
  }

  onFileRejected(r: { name: string; reason: 'type' | 'size' }): void {
    this.toast.error(r.reason === 'type' ? 'toast.fileType' : 'toast.fileSize', { title: 'toast.fileRejected', params: { name: r.name } });
  }

  priorityLabel(): string {
    return this.priorityOptions().find((o) => o.value === this.form.controls.priority.value)?.label ?? '';
  }

  submit(): void {
    this.stepError.set('');
    if (!this.validateContent() || !this.validateContact()) {
      this.toast.warning('toast.checkFields');
      return;
    }
    if (!this.form.controls.consent.value) {
      this.stepError.set(this.i18n.t('ask.consentRequired'));
      this.toast.warning('ask.consentRequired');
      return;
    }
    this.saving.set(true);
    window.setTimeout(() => {
      const raw = this.form.getRawValue();
      const dossier = this.db.createDossier({
        topicId: raw.topicId,
        question: raw.question,
        sender: raw.sender,
        senderEmail: raw.senderEmail,
        organization: raw.organization,
        attachments: raw.attachments,
        priority: raw.priority,
      });
      this.submitted.set(dossier);
      this.saving.set(false);
      this.toast.success(dossier.code ? 'ask.toastBody' : 'ask.successTitle', { title: 'ask.toastTitle', params: { code: dossier.code } });
    }, 550);
  }

  private validateContent(): boolean {
    const topic = this.form.controls.topicId;
    const question = this.form.controls.question;
    topic.markAsTouched();
    question.markAsTouched();
    if (topic.invalid) {
      this.stepError.set(this.i18n.t('ask.validationTopic'));
      return false;
    }
    if (question.invalid) {
      this.stepError.set(this.i18n.t('ask.validationQuestion'));
      return false;
    }
    return true;
  }

  private validateContact(): boolean {
    const name = this.form.controls.sender;
    const email = this.form.controls.senderEmail;
    name.markAsTouched();
    email.markAsTouched();
    if (name.invalid || email.invalid) {
      this.stepError.set(this.i18n.t('ask.validationContact'));
      return false;
    }
    return true;
  }
}
