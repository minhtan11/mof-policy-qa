import { Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { vi } from 'vitest';
import { RevealDirective } from './reveal.directive';

@Component({ imports: [RevealDirective], template: '<div appReveal [revealDelay]="80">x</div>' })
class HostComponent {}

/** UC-162 — acceptance PUB-home: nội dung luôn hiển thị khi không có IntersectionObserver / reduced-motion / đã trong viewport. */
describe('RevealDirective', () => {
  afterEach(() => {
    TestBed.resetTestingModule();
  });

  it('adds base class and becomes visible without IntersectionObserver', () => {
    const original = (globalThis as { IntersectionObserver?: unknown }).IntersectionObserver;
    delete (globalThis as { IntersectionObserver?: unknown }).IntersectionObserver;
    const fixture = TestBed.createComponent(HostComponent);
    fixture.detectChanges();
    const el = fixture.nativeElement.querySelector('div') as HTMLElement;
    expect(el.classList.contains('mof-reveal')).toBe(true);
    expect(el.classList.contains('is-visible')).toBe(true);
    (globalThis as { IntersectionObserver?: unknown }).IntersectionObserver = original;
  });

  it('reveals immediately when element is already in the viewport', () => {
    const observed: Element[] = [];
    class FakeIO {
      constructor(private readonly cb: IntersectionObserverCallback) {}
      observe(el: Element): void {
        observed.push(el);
        // Không gọi callback — directive phải tự hiện qua kiểm tra viewport đồng bộ.
      }
      unobserve(): void {}
      disconnect(): void {}
      takeRecords(): IntersectionObserverEntry[] {
        return [];
      }
      readonly root = null;
      readonly rootMargin = '';
      readonly thresholds = [];
    }
    const original = (globalThis as { IntersectionObserver?: unknown }).IntersectionObserver;
    (globalThis as { IntersectionObserver: unknown }).IntersectionObserver = FakeIO;

    const fixture = TestBed.createComponent(HostComponent);
    const el = fixture.nativeElement.querySelector('div') as HTMLElement;
    vi.spyOn(el, 'getBoundingClientRect').mockReturnValue({
      top: 40,
      left: 0,
      bottom: 120,
      right: 200,
      width: 200,
      height: 80,
      x: 0,
      y: 40,
      toJSON: () => ({}),
    } as DOMRect);

    fixture.detectChanges();
    expect(el.classList.contains('is-visible')).toBe(true);
    expect(observed.length).toBe(0);

    (globalThis as { IntersectionObserver?: unknown }).IntersectionObserver = original;
  });
});
