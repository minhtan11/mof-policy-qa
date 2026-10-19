import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { TagModule } from 'primeng/tag';
import { DossierStatus } from '../../../core/models/domain.models';

@Component({
  selector: 'app-status-badge', imports: [TagModule], changeDetection: ChangeDetectionStrategy.OnPush,
  template: `<p-tag [value]=\"label()\" [severity]=\"severity()\" [rounded]=\"true\" />`,
})
export class StatusBadgeComponent {
  readonly status = input.required<DossierStatus>();
  readonly label = computed(() => ({ new: 'Mới tiếp nhận', received: 'Đã tiếp nhận', processing: 'Đang xử lý', 'waiting-approval': 'Chờ phê duyệt', answered: 'Đã trả lời', published: 'Đã công khai' })[this.status()]);
  readonly severity = computed(() => ({ new: 'info', received: 'info', processing: 'warn', 'waiting-approval': 'contrast', answered: 'success', published: 'success' })[this.status()] as 'info' | 'warn' | 'contrast' | 'success');
}
