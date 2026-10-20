import { ChangeDetectionStrategy, Component, ElementRef, input, output, viewChildren } from '@angular/core';
import { MofIconComponent } from '../mof-icon/mof-icon.component';

export interface MofStepperStep {
  id: string;
  label: string;
}

/**
 * Stepper dùng chung: các bước là <button> (aria-current="step" cho bước hiện tại), đường nối thể hiện tiến độ,
 * bước hoàn thành có dấu check. Phát `stepSelect` — component cha quyết định có cho chuyển hay không (validate).
 * Bàn phím: ←/→ (Home/End) di chuyển focus giữa các bước, Enter/Space chọn.
 */
@Component({
  selector: 'app-mof-stepper',
  imports: [MofIconComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './mof-stepper.component.html',
  styleUrl: './mof-stepper.component.scss',
})
export class MofStepperComponent {
  readonly steps = input.required<MofStepperStep[]>();
  /** 0-based active step index. */
  readonly activeIndex = input(0);
  /** Chỉ số các bước đã hoàn thành (hiển thị check). Mặc định: mọi bước trước bước hiện tại. */
  readonly completed = input<number[] | null>(null);
  readonly ariaLabel = input('Steps');
  readonly stepSelect = output<number>();
  private readonly buttons = viewChildren<ElementRef<HTMLButtonElement>>('stepBtn');

  isDone(i: number): boolean {
    const c = this.completed();
    return i !== this.activeIndex() && (c ? c.includes(i) : i < this.activeIndex());
  }

  onKey(e: KeyboardEvent, i: number): void {
    const n = this.steps().length;
    const map: Record<string, number> = { ArrowRight: i + 1, ArrowDown: i + 1, ArrowLeft: i - 1, ArrowUp: i - 1, Home: 0, End: n - 1 };
    if (!(e.key in map)) {
      return;
    }
    e.preventDefault();
    const next = (map[e.key] + n) % n;
    this.buttons()[next]?.nativeElement.focus();
  }
}
