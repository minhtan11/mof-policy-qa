import { anchorFloating, chooseSide, clamp, computeFloating, findClippingAncestor, RectLike, resolveStrategy } from './floating';

const rect = (top: number, left = 100, width = 200, height = 40): RectLike => ({
  top,
  left,
  width,
  height,
  bottom: top + height,
  right: left + width,
});

const vp = { width: 1280, height: 800 };
const floating = { width: 200, height: 300 };

/** Core overlay — định vị panel nổi (select, menu header): flip có hysteresis, clamp viewport. */
describe('floating positioning', () => {
  it('places below when there is room', () => {
    const r = computeFloating({ reference: rect(100), floating, viewport: vp, previousSide: null });
    expect(r.side).toBe('bottom');
    expect(r.y).toBe(146);
    expect(r.maxHeight).toBe(300);
  });

  it('flips to top only when above is clearly larger', () => {
    const r = computeFloating({ reference: rect(650), floating, viewport: vp, previousSide: 'bottom' });
    expect(r.side).toBe('top');
    expect(r.y + r.maxHeight).toBe(650 - 6);
  });

  it('applies hysteresis so it does not flip back and forth near the edge', () => {
    // Đang ở top; phía dưới vừa đủ (không dư hysteresis) → giữ top.
    expect(chooseSide(305, 500, 300, 'top', 24)).toBe('top');
    // Dư rõ ràng → quay lại bottom.
    expect(chooseSide(330, 500, 300, 'top', 24)).toBe('bottom');
    // Đang bottom, thiếu chỗ nhưng phía trên không lớn hơn đủ → giữ bottom.
    expect(chooseSide(200, 210, 300, 'bottom', 24)).toBe('bottom');
  });

  it('is stable across consecutive frames with the same input', () => {
    let side = null as 'top' | 'bottom' | null;
    const ys: number[] = [];
    for (let i = 0; i < 5; i++) {
      const r = computeFloating({ reference: rect(470 + (i % 2)), floating, viewport: vp, previousSide: side });
      side = r.side;
      ys.push(r.side === 'bottom' ? 1 : 0);
    }
    expect(new Set(ys).size).toBe(1);
  });

  it('clamps horizontally inside the viewport and matches trigger width', () => {
    const r = computeFloating({ reference: rect(100, 1200, 160), floating, viewport: vp, previousSide: null, matchWidth: true });
    expect(r.width).toBe(200);
    expect(r.x).toBe(1280 - 200 - 8);
    expect(clamp(-5, 0, 10)).toBe(0);
  });

  it('reports when the reference scrolls out of view', () => {
    expect(computeFloating({ reference: rect(-80), floating, viewport: vp, previousSide: 'bottom' }).referenceHidden).toBe(true);
  });
});

describe('anchored strategy', () => {
  afterEach(() => (document.body.innerHTML = ''));

  it('uses inline (in-flow) strategy when no ancestor clips overflow', () => {
    const wrap = document.createElement('div');
    document.body.appendChild(wrap);
    expect(findClippingAncestor(wrap)).toBeNull();
    expect(resolveStrategy(wrap)).toBe('inline');
  });

  it('detects a clipping ancestor and avoids inline mode', () => {
    const clip = document.createElement('div');
    clip.style.overflow = 'auto';
    const wrap = document.createElement('div');
    clip.appendChild(wrap);
    document.body.appendChild(clip);
    expect(findClippingAncestor(wrap)).toBe(clip);
    expect(resolveStrategy(wrap)).not.toBe('inline');
  });

  it('inline mode keeps the panel as a child and sets side once', () => {
    const wrap = document.createElement('div');
    const panel = document.createElement('div');
    wrap.appendChild(panel);
    document.body.appendChild(wrap);
    const handle = anchorFloating(wrap, panel, { strategy: 'inline' });
    expect(handle.strategy).toBe('inline');
    expect(panel.parentElement).toBe(wrap);
    expect(panel.dataset['side']).toBe('bottom');
    handle.destroy();
    expect(panel.dataset['side']).toBeUndefined();
  });

  it('portal mode closes on ancestor scroll but not on panel scroll', () => {
    const wrap = document.createElement('div');
    const panel = document.createElement('div');
    wrap.appendChild(panel);
    document.body.appendChild(wrap);
    let closed = 0;
    const handle = anchorFloating(wrap, panel, { strategy: 'portal', onAncestorScroll: () => closed++ });
    expect(panel.parentElement).toBe(document.body);
    panel.dispatchEvent(new Event('scroll'));
    expect(closed).toBe(0);
    wrap.dispatchEvent(new Event('scroll'));
    window.dispatchEvent(new Event('scroll'));
    expect(closed).toBeGreaterThan(0);
    handle.destroy();
    expect(panel.isConnected).toBe(false);
  });
});
