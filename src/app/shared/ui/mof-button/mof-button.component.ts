import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { MofIconComponent, MofIconName } from '../mof-icon/mof-icon.component';

/**
 * Shared button kit.
 * Chiều cao theo size token CỐ ĐỊNH — nút cạnh nhau (có/không icon, primary/secondary)
 * phải cùng chiều cao; không phụ thuộc nội dung hay bóng đổ.
 */
@Component({
  selector: 'app-mof-button',
  imports: [MofIconComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './mof-button.component.html',
  styleUrl: './mof-button.component.scss',
  host: {
    '[attr.data-size]': 'size()',
    '[class.is-block-host]': 'block()',
  },
})
export class MofButtonComponent {
  readonly type = input<'button' | 'submit'>('button');
  readonly variant = input<'primary' | 'secondary' | 'ghost' | 'soft' | 'gradient' | 'tab'>('primary');
  readonly size = input<'sm' | 'md' | 'lg'>('md');
  readonly label = input<string>('');
  readonly icon = input<MofIconName | null>(null);
  readonly iconPos = input<'left' | 'right'>('left');
  readonly loading = input(false);
  readonly disabled = input(false);
  readonly block = input(false);
  readonly ariaLabel = input<string | null>(null);
  /** Trạng thái chọn cho variant `tab` (segmented control). */
  readonly active = input(false);

  readonly btnClass = computed(() => {
    const parts = ['mof-btn', `is-${this.variant()}`, `is-${this.size()}`];
    if (this.block()) parts.push('is-block');
    if (!this.label() && this.icon()) parts.push('is-icon');
    if (this.active()) parts.push('is-active');
    if (this.loading()) parts.push('is-loading');
    return parts.join(' ');
  });
}
