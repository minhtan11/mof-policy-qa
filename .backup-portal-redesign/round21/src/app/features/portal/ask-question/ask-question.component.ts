import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
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

/** Screen PUB-02 | Citizen/business | Wizard submit policy question with similar/consent. | UC-100..UC-113 | Permission: public submit */
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
    this.stepError.set('');
    if (this.step() === 0 && !this.validateContent()) {
      return;
    }
    if (this.step() === 1 && !this.validateContact()) {
      return;
    }
    this.step.update((value) => Math.min(2, value + 1));
  }

  back(): void {
    this.stepError.set('');
    this.step.update((value) => Math.max(0, value - 1));
  }

  submit(): void {
    this.stepError.set('');
    if (!this.validateContent() || !this.validateContact()) {
      return;
    }
    if (!this.form.controls.consent.value) {
      this.stepError.set(this.i18n.t('ask.consentRequired'));
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
      this.toast.show({
        severity: 'success',
        summary: this.i18n.t('ask.toastTitle'),
        detail: this.i18n.t('ask.toastBody', { code: dossier.code }),
      });
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
