import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { DatePipe } from '@angular/common';
import { PortalHeaderComponent } from '../../../shared/ui/portal-header/portal-header.component';
import { MockDbService } from '../../../core/mock-api/mock-db.service';
import { AuthService } from '../../../core/auth/auth.service';
import { TranslatePipe } from '../../../core/i18n/translate.pipe';
import { MofButtonComponent } from '../../../shared/ui/mof-button/mof-button.component';
import { MofInputComponent } from '../../../shared/ui/mof-input/mof-input.component';
import { StatusBadgeComponent } from '../../../shared/ui/status-badge/status-badge.component';

/** Screen PUB-03 | Citizen/business | List own submitted dossiers by email. | UC-110, UC-122 | Permission: own email scope */
@Component({
  imports: [
    PortalHeaderComponent,
    ReactiveFormsModule,
    RouterLink,
    DatePipe,
    TranslatePipe,
    MofButtonComponent,
    MofInputComponent,
    StatusBadgeComponent,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './my-questions.component.html',
  styleUrl: './my-questions.component.scss',
})
export class MyQuestionsComponent {
  readonly db = inject(MockDbService);
  private readonly auth = inject(AuthService);
  private readonly fb = inject(FormBuilder);

  readonly email = signal(this.auth.user()?.email ?? this.db.lastSenderEmail());
  readonly form = this.fb.nonNullable.group({
    email: [this.email(), [Validators.required, Validators.email]],
  });

  readonly items = computed(() => this.db.dossiersByEmail(this.email()));

  load(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    this.email.set(this.form.controls.email.value.trim());
  }
}
