import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { TranslatePipe } from '../../../core/i18n/translate.pipe';
import { MofFiIconComponent } from '../mof-fi-icon/mof-fi-icon.component';

/** Footer dùng chung cổng công khai: thông tin cơ quan chủ quản, liên hệ (anchor #lien-he) và liên kết nhanh. */
@Component({
  selector: 'app-portal-footer',
  imports: [RouterLink, TranslatePipe, MofFiIconComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './portal-footer.component.html',
  styleUrl: './portal-footer.component.scss',
})
export class PortalFooterComponent {}
