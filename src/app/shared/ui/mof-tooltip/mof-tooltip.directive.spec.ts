import { Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { MofTooltipDirective } from './mof-tooltip.directive';

@Component({
  imports: [MofTooltipDirective],
  template: '<button id="b" mofTooltip="Xin chào" aria-label="Nút">x</button><span id="s" mofTooltip="Dài" mofTooltipTruncated>ngắn</span>',
})
class HostComponent {}

describe('MofTooltipDirective', () => {
  beforeEach(() => vi.useFakeTimers());
  afterEach(() => vi.useRealTimers());
  afterEach(() => document.querySelectorAll('.mof-tooltip').forEach((n) => n.remove()));

  it('hiện sau delay, gắn aria-describedby, ẩn khi Escape', () => {
    const f = TestBed.createComponent(HostComponent);
    f.detectChanges();
    const b = f.nativeElement.querySelector('#b') as HTMLElement;
    b.dispatchEvent(new Event('mouseenter'));
    expect(document.querySelector('.mof-tooltip')).toBeNull();
    vi.advanceTimersByTime(400);
    const tip = document.querySelector('.mof-tooltip') as HTMLElement;
    expect(tip.textContent).toBe('Xin chào');
    expect(b.getAttribute('aria-describedby')).toBe(tip.id);
    document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }));
    expect(document.querySelector('.mof-tooltip')).toBeNull();
    expect(b.hasAttribute('aria-describedby')).toBe(false);
  });

  it('chế độ truncated không hiện khi chữ không bị cắt', () => {
    const f = TestBed.createComponent(HostComponent);
    f.detectChanges();
    (f.nativeElement.querySelector('#s') as HTMLElement).dispatchEvent(new Event('mouseenter'));
    vi.advanceTimersByTime(400);
    expect(document.querySelector('.mof-tooltip')).toBeNull();
  });
});
