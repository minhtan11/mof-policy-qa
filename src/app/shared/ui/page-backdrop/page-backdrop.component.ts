import { ChangeDetectionStrategy, Component } from '@angular/core';

/** Nền mờ xanh cố định toàn viewport (blob blur) dùng chung cho các màn cổng công khai. Màu qua token light/dark. */
@Component({
  selector: 'app-page-backdrop',
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './page-backdrop.component.html',
  styleUrl: './page-backdrop.component.scss',
  host: { 'aria-hidden': 'true' },
})
export class PageBackdropComponent {}
