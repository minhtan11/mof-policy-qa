import { Directive, ElementRef, NgZone, OnDestroy, booleanAttribute, inject, input, numberAttribute } from '@angular/core';

export type MofTooltipPlacement = 'top' | 'bottom';

let tipSeq = 0;

/**
 * Tooltip dùng chung thay cho `title` native (giao diện theo token --mof-tip-*, đủ light/dark).
 * - Hiện khi hover/focus sau một khoảng trễ ngắn; ẩn khi rời/blur/Escape/cuộn.
 * - Panel portal ra body (position: fixed) nên không bị container overflow cắt; mặc định phía trên,
 *   lật xuống dưới khi thiếu chỗ và kẹp ngang trong viewport.
 * - `mofTooltipTruncated`: chỉ hiện khi chữ đang bị cắt (ellipsis) — dùng cho nhãn dài.
 * - Gắn aria-describedby khi đang hiện (trừ khi nội dung trùng aria-label/chữ hiển thị thì vô nghĩa).
 * Listener chạy ngoài Angular zone: tooltip chỉ là DOM thuần, không cần change detection.
 */
@Directive({ selector: '[mofTooltip]' })
export class MofTooltipDirective implements OnDestroy {
  readonly text = input<string | null | undefined>('', { alias: 'mofTooltip' });
  readonly placement = input<MofTooltipPlacement>('top', { alias: 'mofTooltipPlacement' });
  readonly truncatedOnly = input(false, { alias: 'mofTooltipTruncated', transform: booleanAttribute });
  readonly delay = input(350, { alias: 'mofTooltipDelay', transform: numberAttribute });
  readonly disabled = input(false, { alias: 'mofTooltipDisabled', transform: booleanAttribute });

  private readonly host = inject<ElementRef<HTMLElement>>(ElementRef).nativeElement;
  private readonly zone = inject(NgZone);
  private readonly id = `mof-tip-${++tipSeq}`;
  private tip?: HTMLElement;
  private timer?: ReturnType<typeof setTimeout>;

  private readonly onEnter = () => this.schedule();
  private readonly onLeave = () => this.hide();
  private readonly onKey = (e: KeyboardEvent) => {
    if (e.key === 'Escape') {
      this.hide();
    }
  };

  constructor() {
    this.zone.runOutsideAngular(() => {
      this.host.addEventListener('mouseenter', this.onEnter);
      this.host.addEventListener('focusin', this.onEnter);
      this.host.addEventListener('mouseleave', this.onLeave);
      this.host.addEventListener('focusout', this.onLeave);
      this.host.addEventListener('pointerdown', this.onLeave);
    });
  }

  private schedule(): void {
    clearTimeout(this.timer);
    this.timer = setTimeout(() => this.show(), this.delay());
  }

  private isTruncated(): boolean {
    const el = this.host;
    return el.scrollWidth > el.clientWidth + 1 || el.scrollHeight > el.clientHeight + 1;
  }

  private show(): void {
    const text = (this.text() ?? '').trim();
    if (!text || this.disabled() || (this.truncatedOnly() && !this.isTruncated()) || this.tip) {
      return;
    }
    const tip = document.createElement('div');
    tip.className = 'mof-tooltip';
    tip.id = this.id;
    tip.setAttribute('role', 'tooltip');
    tip.textContent = text;
    document.body.appendChild(tip);
    this.tip = tip;
    this.position(tip);

    const label = this.host.getAttribute('aria-label')?.trim();
    const visible = this.host.textContent?.trim();
    if (text !== label && text !== visible) {
      const ids = (this.host.getAttribute('aria-describedby') ?? '').split(/\s+/).filter(Boolean);
      this.host.setAttribute('aria-describedby', [...ids, this.id].join(' '));
    }
    document.addEventListener('keydown', this.onKey, true);
    window.addEventListener('scroll', this.onLeave, { capture: true, passive: true });
    window.addEventListener('resize', this.onLeave, { passive: true });
  }

  private position(tip: HTMLElement): void {
    const gap = 8;
    const pad = 8;
    const r = this.host.getBoundingClientRect();
    const w = tip.offsetWidth;
    const h = tip.offsetHeight;
    const fitsTop = r.top - gap - h >= pad;
    const fitsBottom = r.bottom + gap + h <= window.innerHeight - pad;
    const side: MofTooltipPlacement = this.placement() === 'top' ? (fitsTop || !fitsBottom ? 'top' : 'bottom') : fitsBottom || !fitsTop ? 'bottom' : 'top';
    const x = Math.min(Math.max(pad, r.left + r.width / 2 - w / 2), Math.max(pad, window.innerWidth - w - pad));
    const y = side === 'top' ? r.top - gap - h : r.bottom + gap;
    tip.dataset['side'] = side;
    tip.style.left = `${Math.round(x)}px`;
    tip.style.top = `${Math.round(Math.max(pad, y))}px`;
  }

  hide(): void {
    clearTimeout(this.timer);
    if (!this.tip) {
      return;
    }
    this.tip.remove();
    this.tip = undefined;
    const ids = (this.host.getAttribute('aria-describedby') ?? '').split(/\s+/).filter((v) => v && v !== this.id);
    if (ids.length) {
      this.host.setAttribute('aria-describedby', ids.join(' '));
    } else {
      this.host.removeAttribute('aria-describedby');
    }
    document.removeEventListener('keydown', this.onKey, true);
    window.removeEventListener('scroll', this.onLeave, true);
    window.removeEventListener('resize', this.onLeave);
  }

  ngOnDestroy(): void {
    this.hide();
    this.host.removeEventListener('mouseenter', this.onEnter);
    this.host.removeEventListener('focusin', this.onEnter);
    this.host.removeEventListener('mouseleave', this.onLeave);
    this.host.removeEventListener('focusout', this.onLeave);
    this.host.removeEventListener('pointerdown', this.onLeave);
  }
}
