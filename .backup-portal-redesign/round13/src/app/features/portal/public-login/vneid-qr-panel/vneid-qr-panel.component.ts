import { ChangeDetectionStrategy, Component, computed, inject, output } from '@angular/core';
import { TranslatePipe } from '../../../../core/i18n/translate.pipe';
import { VneidAuthAdapter, VneidStatus } from '../../../../core/auth/vneid-auth.adapter';
import { MofButtonComponent } from '../../../../shared/ui/mof-button/mof-button.component';
import { MofFiIconComponent } from '../../../../shared/ui/mof-fi-icon/mof-fi-icon.component';
import { MofQrComponent } from '../../../../shared/ui/mof-qr/mof-qr.component';

const STEP_OF: Record<VneidStatus, number> = {
  idle: 0, waiting: 0, scanning: 0, scanned: 1, confirming: 2, success: 3, denied: 1, expired: 1,
};

/**
 * Screen PUB-login › VNeID QR | Người dân | Đăng nhập bằng QR VNeID ngay trong card đăng nhập (không chuyển trang).
 * UC-1..UC-8 | Permission: public. Trạng thái lấy từ `VneidAuthAdapter` (mock); hộp thoại "điện thoại" mô phỏng app VNeID.
 */
@Component({
  selector: 'app-vneid-qr-panel',
  imports: [TranslatePipe, MofButtonComponent, MofFiIconComponent, MofQrComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './vneid-qr-panel.component.html',
  styleUrl: './vneid-qr-panel.component.scss',
})
export class VneidQrPanelComponent {
  readonly vneid = inject(VneidAuthAdapter);
  readonly back = output<void>();
  readonly steps = ['vneid.stepWaiting', 'vneid.stepScanned', 'vneid.stepConfirm', 'vneid.stepSuccess'];
  readonly step = computed(() => STEP_OF[this.vneid.status()]);
  readonly failed = computed(() => this.vneid.status() === 'denied' || this.vneid.status() === 'expired');
  readonly canSimulate = computed(() => !!this.vneid.simulateScan && this.vneid.status() === 'waiting');
  readonly canRefresh = computed(() => ['waiting', 'denied', 'expired'].includes(this.vneid.status()));

  simulate(): void {
    this.vneid.simulateScan?.();
  }
}
