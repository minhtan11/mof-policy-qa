import { ChangeDetectionStrategy, Component, ElementRef, input, viewChild } from '@angular/core';
import { MofIconComponent, MofIconName } from '../mof-icon/mof-icon.component';
import { MofFiIconComponent } from '../mof-fi-icon/mof-fi-icon.component';

/**
 * Nút chỉ-icon dùng chung: ô tròn kích thước token (`--mof-icon-btn-sm|md|lg`), icon căn giữa bằng grid
 * (line-height 0) → vòng hover luôn đồng tâm với icon. Bắt buộc `label` cho aria-label.
 * Icon: `icon` (SVG mof-icon) hoặc `fi` (Flaticon slug). `badge` > 0 hiện chấm đếm. `expanded`/`haspopup` cho menu.
 */
@Component({
  selector: 'app-mof-icon-button',
  imports: [MofIconComponent, MofFiIconComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <button
      #btn
      type="button"
      [class]="'mof-icon-btn is-' + size() + ' is-' + variant()"
      [class.is-active]="active()"
      [attr.aria-label]="label()"
      [attr.title]="label()"
      [attr.aria-pressed]="active() ? true : null"
      [attr.aria-expanded]="expanded()"
      [attr.aria-haspopup]="haspopup()"
      [attr.aria-controls]="controls()"
      [disabled]="disabled()"
    >
      @if (fi()) {
        <app-mof-fi-icon class="ico" [name]="fi()!" />
      } @else if (icon()) {
        <app-mof-icon class="ico" [name]="icon()!" [size]="size() === 'sm' ? 14 : 16" />
      }
      @if (badge() > 0) {
        <span class="badge" aria-hidden="true">{{ badge() > 9 ? '9+' : badge() }}</span>
      }
    </button>
  `,
  styleUrl: './mof-icon-button.component.scss',
})
export class MofIconButtonComponent {
  readonly icon = input<MofIconName>();
  readonly fi = input<string>();
  readonly label = input.required<string>();
  readonly size = input<'sm' | 'md' | 'lg'>('md');
  readonly variant = input<'ghost' | 'danger' | 'outline'>('ghost');
  /** Trạng thái bật (toggle): ghim, lọc đang chọn… — đổi màu icon, không chỉ class host. */
  readonly active = input(false);
  readonly disabled = input(false);
  readonly badge = input(0);
  readonly expanded = input<boolean | null>(null);
  readonly haspopup = input<string | null>(null);
  readonly controls = input<string | null>(null);
  private readonly btn = viewChild<ElementRef<HTMLButtonElement>>('btn');

  focus(): void {
    this.btn()?.nativeElement.focus({ preventScroll: true });
  }
}
