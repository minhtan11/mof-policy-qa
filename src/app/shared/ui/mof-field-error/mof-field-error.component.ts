import { ChangeDetectionStrategy, Component, input, signal, effect } from '@angular/core';
import { MofTooltipDirective } from '../mof-tooltip/mof-tooltip.directive';

/**
 * Ô lỗi dưới trường form — luôn giữ sẵn chiều cao một dòng (token `--mof-field-error-h`) nên khi lỗi xuất hiện
 * hay biến mất bố cục không bị đẩy. Chữ chỉ fade/slide (opacity + translateY, 140ms); dài quá → ellipsis + title.
 * Truyền chuỗi đã dịch (i18n) qua `message`; null/'' = không lỗi.
 */
@Component({
  imports: [MofTooltipDirective],
  selector: 'app-mof-field-error',
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './mof-field-error.component.html',
  styleUrl: './mof-field-error.component.scss',
  // id chỉ đặt trên <p> bên trong (đích của aria-describedby) — gỡ khỏi host để không trùng id.
  host: { '[attr.id]': 'null' },
})
export class MofFieldErrorComponent {
  readonly message = input<string | null>(null);
  readonly id = input<string | null>(null);
  /** Giữ chữ cuối cùng trong lúc fade-out để không bị "giật" chữ rỗng. */
  readonly shown = signal('');

  constructor() {
    effect(() => {
      const next = this.message();
      if (next) {
        this.shown.set(next);
      }
    });
  }
}
