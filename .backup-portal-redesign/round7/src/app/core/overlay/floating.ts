/**
 * Core định vị phần tử nổi (select, dropdown menu, popover, tooltip…).
 *
 * Vì sao tự viết thay vì @angular/cdk/overlay: CDK định vị bằng top/left + cần CSS toàn cục riêng,
 * và chiến lược flip không có hysteresis → vẫn rung khi trigger nằm sát mép. Ở đây:
 * - chỉ ghi `transform: translate3d()` (compositor, không reflow), `will-change: transform`;
 * - một vòng cập nhật rAF duy nhất cho mọi panel đang mở, đọc hết rồi mới ghi (không layout thrash);
 * - scroll (capture, passive) + resize + ResizeObserver (trigger) cùng gom về rAF;
 * - flip có hysteresis, clamp trong viewport, báo khi trigger ra khỏi màn hình.
 */

export type FloatingSide = 'bottom' | 'top';
export type FloatingAlign = 'start' | 'end';

export interface RectLike {
  top: number;
  bottom: number;
  left: number;
  right: number;
  width: number;
  height: number;
}

export interface ComputeInput {
  reference: RectLike;
  /** Kích thước "mong muốn" của panel (đo một lần khi mở, không đo lại mỗi frame). */
  floating: { width: number; height: number };
  viewport: { width: number; height: number };
  previousSide: FloatingSide | null;
  gap?: number;
  padding?: number;
  hysteresis?: number;
  align?: FloatingAlign;
  matchWidth?: boolean;
  minHeight?: number;
}

export interface ComputeResult {
  x: number;
  y: number;
  side: FloatingSide;
  width: number;
  maxHeight: number;
  referenceHidden: boolean;
}

export function chooseSide(
  spaceBelow: number,
  spaceAbove: number,
  need: number,
  previous: FloatingSide | null,
  hysteresis: number,
): FloatingSide {
  if (previous === 'top') {
    // Chỉ quay lại phía dưới khi đã dư rõ ràng → không lật qua lại sát mép.
    return spaceBelow >= need + hysteresis || spaceBelow > spaceAbove + hysteresis ? 'bottom' : 'top';
  }
  if (spaceBelow >= need) {
    return 'bottom';
  }
  return spaceAbove > spaceBelow + hysteresis ? 'top' : 'bottom';
}

export function computeFloating(input: ComputeInput): ComputeResult {
  const gap = input.gap ?? 6;
  const pad = input.padding ?? 8;
  const hys = input.hysteresis ?? 24;
  const minH = input.minHeight ?? 120;
  const { reference: r, viewport: vp } = input;

  const width = input.matchWidth ? Math.max(r.width, input.floating.width) : input.floating.width;
  const spaceBelow = vp.height - r.bottom - gap - pad;
  const spaceAbove = r.top - gap - pad;
  const side = chooseSide(spaceBelow, spaceAbove, input.floating.height, input.previousSide, hys);
  const available = side === 'bottom' ? spaceBelow : spaceAbove;
  const maxHeight = Math.max(minH, Math.min(input.floating.height, available));

  const rawX = input.align === 'end' ? r.right - width : r.left;
  const x = clamp(rawX, pad, Math.max(pad, vp.width - width - pad));
  const y = side === 'bottom' ? r.bottom + gap : r.top - gap - maxHeight;

  return {
    x: Math.round(x),
    y: Math.round(y),
    side,
    width: Math.round(width),
    maxHeight: Math.floor(maxHeight),
    referenceHidden: r.bottom < 0 || r.top > vp.height || r.right < 0 || r.left > vp.width,
  };
}

export function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}

export interface FloatingOptions extends Pick<ComputeInput, 'gap' | 'padding' | 'hysteresis' | 'align' | 'matchWidth' | 'minHeight'> {
  /** Gọi khi trigger trượt ra khỏi viewport (vd. đóng select). */
  onReferenceHidden?: () => void;
}

export interface FloatingHandle {
  /** Đo lại kích thước mong muốn (vd. sau khi lọc danh sách). */
  remeasure(): void;
  destroy(): void;
}

interface Entry {
  reference: HTMLElement;
  floating: HTMLElement;
  options: FloatingOptions;
  side: FloatingSide | null;
  natural: { width: number; height: number } | null;
}

/** Vòng rAF dùng chung cho mọi panel nổi đang mở. */
class FloatingEngine {
  private readonly entries = new Set<Entry>();
  private frame = 0;
  private observer?: ResizeObserver;
  private readonly schedule = () => {
    if (!this.frame) {
      this.frame = requestAnimationFrame(this.flush);
    }
  };
  private readonly flush = () => {
    this.frame = 0;
    const vp = { width: window.innerWidth, height: window.innerHeight };
    // Pha đọc
    const jobs = [...this.entries].map((e) => {
      if (!e.natural) {
        e.floating.style.maxHeight = '';
        e.natural = { width: e.floating.offsetWidth, height: e.floating.scrollHeight || e.floating.offsetHeight };
      }
      return { e, ref: e.reference.getBoundingClientRect() };
    });
    // Pha ghi
    for (const { e, ref } of jobs) {
      const res = computeFloating({ reference: ref, floating: e.natural!, viewport: vp, previousSide: e.side, ...e.options });
      e.side = res.side;
      const s = e.floating.style;
      s.transform = `translate3d(${res.x}px, ${res.y}px, 0)`;
      s.maxHeight = `${res.maxHeight}px`;
      if (e.options.matchWidth) {
        s.width = `${res.width}px`;
      }
      e.floating.dataset['side'] = res.side;
      e.floating.style.visibility = res.referenceHidden ? 'hidden' : '';
      if (res.referenceHidden) {
        e.options.onReferenceHidden?.();
      }
    }
  };

  attach(reference: HTMLElement, floating: HTMLElement, options: FloatingOptions = {}): FloatingHandle {
    const entry: Entry = { reference, floating, options, side: null, natural: null };
    if (!this.entries.size) {
      window.addEventListener('scroll', this.schedule, { capture: true, passive: true });
      window.addEventListener('resize', this.schedule, { passive: true });
      if (typeof ResizeObserver !== 'undefined') {
        this.observer = new ResizeObserver(this.schedule);
      }
    }
    this.entries.add(entry);
    this.observer?.observe(reference);
    Object.assign(floating.style, { position: 'fixed', top: '0px', left: '0px', willChange: 'transform' });
    this.schedule();
    return {
      remeasure: () => {
        entry.natural = null;
        this.schedule();
      },
      destroy: () => this.detach(entry),
    };
  }

  private detach(entry: Entry): void {
    if (!this.entries.delete(entry)) {
      return;
    }
    this.observer?.unobserve(entry.reference);
    for (const p of ['position', 'top', 'left', 'transform', 'maxHeight', 'willChange', 'visibility'] as const) {
      entry.floating.style[p] = '';
    }
    if (entry.options.matchWidth) {
      entry.floating.style.width = '';
    }
    if (!this.entries.size) {
      window.removeEventListener('scroll', this.schedule, true);
      window.removeEventListener('resize', this.schedule);
      this.observer?.disconnect();
      this.observer = undefined;
      cancelAnimationFrame(this.frame);
      this.frame = 0;
    }
  }
}

const engine = new FloatingEngine();

export function attachFloating(reference: HTMLElement, floating: HTMLElement, options?: FloatingOptions): FloatingHandle {
  return engine.attach(reference, floating, options);
}
