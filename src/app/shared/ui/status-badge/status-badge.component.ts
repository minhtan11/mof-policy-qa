import { ChangeDetectionStrategy, Component, computed, inject, input } from '@angular/core';
import { DossierStatus } from '../../../core/models/domain.models';
import { I18nService } from '../../../core/i18n/i18n.service';
import { MofBadgeComponent } from '../mof-badge/mof-badge.component';

@Component({
  selector: 'app-status-badge',
  imports: [MofBadgeComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './status-badge.component.html',
})
export class StatusBadgeComponent {
  private readonly i18n = inject(I18nService);
  readonly status = input.required<DossierStatus>();

  readonly label = computed(() => this.i18n.t(`status.${this.status()}`));
  readonly tone = computed(() => {
    const map: Record<DossierStatus, 'info' | 'success' | 'warn' | 'neutral'> = {
      new: 'info',
      received: 'info',
      processing: 'warn',
      'waiting-approval': 'neutral',
      answered: 'success',
      published: 'success',
      rejected: 'neutral',
    };
    return map[this.status()];
  });
}
