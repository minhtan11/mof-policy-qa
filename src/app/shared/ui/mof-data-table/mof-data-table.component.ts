/**
 * Shell bảng + chân (pagination): tách scroll khỏi footer để màu hàng (vd. quá hạn)
 * không dính pager. Feature giữ markup `<table>` riêng; control lo layout/token chung.
 */
import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
  selector: 'app-mof-data-table',
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './mof-data-table.component.html',
  styleUrl: './mof-data-table.component.scss',
})
export class MofDataTableComponent {}
