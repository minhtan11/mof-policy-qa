import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { ToastService, ToastType } from '../../../core/toast/toast.service';
import { TranslatePipe } from '../../../core/i18n/translate.pipe';
import { MofFiIconComponent } from '../mof-fi-icon/mof-fi-icon.component';
import { MofIconButtonComponent } from '../mof-icon-button/mof-icon-button.component';

const ICON: Record<ToastType, string> = { success: 'check-circle', error: 'cross-circle', warning: 'exclamation', info: 'info' };

/**
 * Vùng hiển thị toast (mount MỘT lần ở App). Desktop: góc trên-phải dưới header; mobile: trên-giữa full-width.
 * Error → role=alert / aria-live=assertive; còn lại role=status / polite. Hover/focus tạm dừng tự đóng.
 */
@Component({
  selector: 'app-mof-toaster',
  imports: [TranslatePipe, MofFiIconComponent, MofIconButtonComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './mof-toaster.component.html',
  styleUrl: './mof-toaster.component.scss',
})
export class MofToasterComponent {
  readonly toast = inject(ToastService);
  readonly icon = ICON;

  onFocusOut(e: FocusEvent, id: number): void {
    if (!(e.currentTarget as HTMLElement).contains(e.relatedTarget as Node | null)) {
      this.toast.resume(id);
    }
  }

  runAction(id: number, run: () => void): void {
    run();
    this.toast.dismiss(id);
  }
}
