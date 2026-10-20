import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { MofIconComponent, MofIconName } from '../mof-icon/mof-icon.component';

@Component({
  selector: 'app-mof-button',
  imports: [MofIconComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './mof-button.component.html',
  styleUrl: './mof-button.component.scss',
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
}
