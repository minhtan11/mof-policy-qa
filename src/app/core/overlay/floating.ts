/**
 * Core định vị phần tử nổi (select, dropdown menu, popover, tooltip…).
 *
 * Mặc định dùng `anchorFloating` (inline/CSS anchor: cuộn native, 0 JS khi cuộn).
 * `attachFloating` (rAF + translate3d) chỉ còn là nền cho chế độ portal fallback.
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
  /** `block` (mặc định) = dưới/trên trigger; `inline-end` = bên phải trigger (flyout rail), lật sang trái nếu thiếu chỗ. */
  placement?: 'block' | 'inline-end';
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

  if (input.placement === 'inline-end') {
    // Flyout ngang: canh đỉnh theo trigger, kẹp trong viewport; lật trái khi tràn phải.
    const w = input.floating.width;
    const maxHeight = Math.max(minH, Math.min(input.floating.height, vp.height - 2 * pad));
    const fitsRight = r.right + gap + w + pad <= vp.width;
    const x = fitsRight ? r.right + gap : Math.max(pad, r.left - gap - w);
    const y = clamp(r.top, pad, Math.max(pad, vp.height - maxHeight - pad));
    return {
      x: Math.round(x),
      y: Math.round(y),
      side: 'bottom',
      width: Math.round(w),
      maxHeight: Math.floor(maxHeight),
      referenceHidden: r.bottom < 0 || r.top > vp.height || r.right < 0 || r.left > vp.width,
    };
  }

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

export interface FloatingOptions extends Pick<ComputeInput, 'gap' | 'padding' | 'hysteresis' | 'align' | 'matchWidth' | 'minHeight' | 'placement'> {
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

// ---------------------------------------------------------------------------
// Chiến lược "anchored" (mặc định): không có JS nào chạy khi cuộn.
// ---------------------------------------------------------------------------

export type FloatingStrategy = 'inline' | 'css-anchor' | 'portal';

/** Tổ tiên nào có overflow khác visible sẽ cắt panel absolute → cần chiến lược khác. */
export function findClippingAncestor(el: HTMLElement): HTMLElement | null {
  for (let node = el.parentElement; node && node !== document.body && node !== document.documentElement; node = node.parentElement) {
    const cs = getComputedStyle(node);
    if ([cs.overflow, cs.overflowX, cs.overflowY].some((v) => v && v !== 'visible')) {
      return node;
    }
  }
  return null;
}

export function supportsCssAnchor(): boolean {
  return typeof CSS !== 'undefined' && typeof CSS.supports === 'function' && CSS.supports('anchor-name: --mof-a');
}

export function resolveStrategy(reference: HTMLElement): FloatingStrategy {
  if (!findClippingAncestor(reference)) {
    return 'inline';
  }
  return supportsCssAnchor() ? 'css-anchor' : 'portal';
}

export interface AnchoredOptions extends FloatingOptions {
  /** Ép chiến lược (test/đặc thù); mặc định tự chọn. */
  strategy?: FloatingStrategy;
  /** Portal mode: đóng khi một container khác panel cuộn (tránh panel lệch nhịp với trigger). */
  onAncestorScroll?: () => void;
}

export interface AnchoredHandle extends FloatingHandle {
  readonly strategy: FloatingStrategy;
}

let anchorSeq = 0;

/**
 * Gắn panel vào trigger:
 * - `inline`: panel absolute trong wrapper position:relative → cuộn native cùng nội dung (0 JS khi cuộn).
 *   Chỉ quyết định flip (dưới/trên) + maxHeight khi mở và khi resize.
 * - `css-anchor`: khi có tổ tiên cắt overflow và trình duyệt hỗ trợ CSS Anchor Positioning →
 *   `position: fixed` + `anchor()`; trình duyệt tự bám trigger khi cuộn (vẫn 0 JS).
 * - `portal`: fallback cuối, định vị bằng engine rAF nhưng ĐÓNG panel khi container tổ tiên cuộn,
 *   nên không bao giờ thấy panel "nhấp nhô" theo từng nấc cuộn.
 * `reference` là wrapper position:relative; `floating` phải là con của nó (trừ portal).
 */
export function anchorFloating(reference: HTMLElement, floating: HTMLElement, options: AnchoredOptions = {}): AnchoredHandle {
  const strategy = options.strategy ?? resolveStrategy(reference);
  floating.dataset['strategy'] = strategy;

  if (strategy === 'portal') {
    document.body.appendChild(floating);
    const inner = attachFloating(reference, floating, options);
    const onScroll = (e: Event) => {
      if (!(e.target instanceof Node) || !floating.contains(e.target)) {
        options.onAncestorScroll?.();
      }
    };
    window.addEventListener('scroll', onScroll, { capture: true, passive: true });
    return {
      strategy,
      remeasure: () => inner.remeasure(),
      destroy: () => {
        window.removeEventListener('scroll', onScroll, true);
        inner.destroy();
        floating.remove();
      },
    };
  }

  const name = `--mof-anchor-${++anchorSeq}`;
  if (strategy === 'css-anchor') {
    reference.style.setProperty('anchor-name', name);
    floating.style.setProperty('position-anchor', name);
  }

  let side: FloatingSide | null = null;
  let natural = 0;
  const place = () => {
    // Đọc
    floating.style.maxHeight = '';
    natural = floating.scrollHeight || floating.offsetHeight;
    const r = reference.getBoundingClientRect();
    const gap = options.gap ?? 6;
    const pad = options.padding ?? 8;
    const below = window.innerHeight - r.bottom - gap - pad;
    const above = r.top - gap - pad;
    side = chooseSide(below, above, natural, side, options.hysteresis ?? 24);
    const available = side === 'bottom' ? below : above;
    // Ghi
    floating.dataset['side'] = side;
    floating.style.maxHeight = `${Math.floor(Math.max(options.minHeight ?? 120, Math.min(natural, available)))}px`;
  };
  place();
  window.addEventListener('resize', place, { passive: true });

  return {
    strategy,
    // Nội dung đổi (lọc) → chỉ cập nhật maxHeight theo phía đã chọn, không lật lại.
    remeasure: () => {
      const keep = side;
      place();
      if (keep && side !== keep) {
        side = keep;
        floating.dataset['side'] = keep;
      }
    },
    destroy: () => {
      window.removeEventListener('resize', place);
      reference.style.removeProperty('anchor-name');
      floating.style.removeProperty('position-anchor');
      floating.style.maxHeight = '';
      delete floating.dataset['side'];
      delete floating.dataset['strategy'];
    },
  };
}
