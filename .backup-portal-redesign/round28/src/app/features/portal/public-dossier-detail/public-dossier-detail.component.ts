import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { DatePipe } from '@angular/common';
import { toSignal } from '@angular/core/rxjs-interop';
import { map } from 'rxjs';
import { PortalHeaderComponent } from '../../../shared/ui/portal-header/portal-header.component';
import { MockDbService } from '../../../core/mock-api/mock-db.service';
import { TranslatePipe } from '../../../core/i18n/translate.pipe';
import { I18nService } from '../../../core/i18n/i18n.service';
import { ToastService } from '../../../shared/ui/toast/toast.service';
import { MofButtonComponent } from '../../../shared/ui/mof-button/mof-button.component';
import { MofSelectComponent } from '../../../shared/ui/mof-select/mof-select.component';
import { MofTextareaComponent } from '../../../shared/ui/mof-textarea/mof-textarea.component';
import { StatusBadgeComponent } from '../../../shared/ui/status-badge/status-badge.component';

/** Screen PUB-04 | Citizen/business | Track dossier detail, rate published answer, request clarification. | UC-114..UC-118, UC-165 | Permission: public read + own feedback */
@Component({
  imports: [
    PortalHeaderComponent,
    ReactiveFormsModule,
    RouterLink,
    DatePipe,
    TranslatePipe,
    MofButtonComponent,
    MofSelectComponent,
    MofTextareaComponent,
    StatusBadgeComponent,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './public-dossier-detail.component.html',
  styleUrl: './public-dossier-detail.component.scss',
})
export class PublicDossierDetailComponent {
  readonly db = inject(MockDbService);
  readonly i18n = inject(I18nService);
  private readonly route = inject(ActivatedRoute);
  private readonly toast = inject(ToastService);
  private readonly fb = inject(FormBuilder);

  private readonly code = toSignal(this.route.paramMap.pipe(map((params) => params.get('code') ?? '')), {
    initialValue: this.route.snapshot.paramMap.get('code') ?? '',
  });

  readonly dossier = computed(() => {
    // Depend on dossiers signal so ratings/clarifications refresh.
    this.db.dossiers();
    return this.db.findByCode(this.code());
  });

  readonly topicName = computed(() => {
    const topicId = this.dossier()?.topicId;
    return this.db.topics.find((topic) => topic.id === topicId)?.name ?? '';
  });

  readonly ratingSaved = signal(false);
  readonly clarifySaved = signal(false);

  readonly starOptions = [
    { label: '5', value: '5' },
    { label: '4', value: '4' },
    { label: '3', value: '3' },
    { label: '2', value: '2' },
    { label: '1', value: '1' },
  ];

  readonly ratingForm = this.fb.nonNullable.group({
    stars: ['5', Validators.required],
    comment: [''],
  });

  readonly clarifyForm = this.fb.nonNullable.group({
    text: ['', [Validators.required, Validators.minLength(10)]],
  });

  submitRating(): void {
    const item = this.dossier();
    if (!item?.isPublic || !item.answer) {
      return;
    }
    this.db.addRating(item.id, Number(this.ratingForm.controls.stars.value), this.ratingForm.controls.comment.value);
    this.ratingSaved.set(true);
    this.toast.show({
      severity: 'success',
      summary: this.i18n.t('detail.toastRating'),
      detail: item.code,
    });
  }

  submitClarify(): void {
    const item = this.dossier();
    if (!item || this.clarifyForm.invalid) {
      this.clarifyForm.markAllAsTouched();
      return;
    }
    this.db.addClarification(item.id, this.clarifyForm.controls.text.value);
    this.clarifySaved.set(true);
    this.clarifyForm.reset({ text: '' });
    this.toast.show({
      severity: 'success',
      summary: this.i18n.t('detail.toastClarify'),
      detail: item.code,
    });
  }
}
