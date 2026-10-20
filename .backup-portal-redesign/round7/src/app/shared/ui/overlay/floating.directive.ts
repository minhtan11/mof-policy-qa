import { Directive, ElementRef, OnDestroy, effect, inject, input } from '@angular/core';
import { attachFloating, FloatingAlign, FloatingHandle } from '../../../core/overlay/floating';

/**
 * Gắn một phần tử (menu, popover) vào core floating khi `floatingOpen` = true.
 * Dùng cho dropdown menu header; phần tử vẫn nằm trong DOM gốc nên :hover/:focus-within giữ nguyên.
 */
@Directive({ selector: '[appFloating]' })
export class FloatingDirective implements OnDestroy {
  readonly reference = input.required<HTMLElement>({ alias: 'appFloating' });
  readonly floatingOpen = input(false);
  readonly floatingAlign = input<FloatingAlign>('start');
  private readonly el = inject<ElementRef<HTMLElement>>(ElementRef);
  private handle?: FloatingHandle;

  constructor() {
    effect(() => {
      const open = this.floatingOpen();
      const ref = this.reference();
      this.handle?.destroy();
      this.handle = open ? attachFloating(ref, this.el.nativeElement, { gap: 0, align: this.floatingAlign(), minHeight: 80 }) : undefined;
    });
  }

  ngOnDestroy(): void {
    this.handle?.destroy();
  }
}
