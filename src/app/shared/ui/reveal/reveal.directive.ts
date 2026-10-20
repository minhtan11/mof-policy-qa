import { Directive, ElementRef, OnDestroy, OnInit, inject, input } from '@angular/core';

/**
 * Scroll-reveal nhẹ (fade-up ~220ms) — chỉ dùng trên landing trang chủ (`portal-home`).
 * Reduced-motion / không có IntersectionObserver → hiện ngay. Chỉ chạy một lần mỗi phần tử
 * (đổi ngôn ngữ/theme không ẩn lại).
 *
 * Phần tử đã nằm trong viewport lúc mount phải hiện ngay, không chờ scroll.
 * Không dùng rootMargin âm phía dưới: trước đây `-8%` khiến khối gần đáy màn hình
 * vẫn `opacity: 0` dù đã nhìn thấy.
 */
@Directive({
  selector: '[appReveal]',
  host: { class: 'mof-reveal', '[style.--reveal-delay.ms]': 'revealDelay()' },
})
export class RevealDirective implements OnInit, OnDestroy {
  readonly revealDelay = input(0);
  private readonly el = inject<ElementRef<HTMLElement>>(ElementRef);
  private observer?: IntersectionObserver;
  private revealed = false;
  private raf = 0;

  ngOnInit(): void {
    const node = this.el.nativeElement;
    const reduce =
      typeof window.matchMedia === 'function' && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduce || typeof IntersectionObserver === 'undefined') {
      this.show(node);
      return;
    }

    // Đã trong viewport → hiện ngay (giữ transition-delay CSS cho stagger).
    if (this.isInViewport(node)) {
      this.show(node);
      return;
    }

    this.observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            this.show(node);
            break;
          }
        }
      },
      // threshold 0 = bất kỳ pixel nào; rootMargin dưới dương = reveal sớm khi sắp vào khung nhìn.
      { root: null, rootMargin: '0px 0px 64px 0px', threshold: 0 },
    );
    this.observer.observe(node);

    // Sau layout: bắt trường hợp mount lúc chưa đo được kích thước.
    this.raf = requestAnimationFrame(() => {
      if (!this.revealed && this.isInViewport(node)) {
        this.show(node);
      }
    });
  }

  ngOnDestroy(): void {
    if (this.raf) cancelAnimationFrame(this.raf);
    this.observer?.disconnect();
  }

  private show(node: HTMLElement): void {
    if (this.revealed) return;
    this.revealed = true;
    node.classList.add('is-visible');
    this.observer?.disconnect();
    this.observer = undefined;
  }

  /** Giao bất kỳ phần nào với khung nhìn (không trừ margin âm). */
  private isInViewport(node: HTMLElement): boolean {
    const rect = node.getBoundingClientRect();
    const vh = window.innerHeight || document.documentElement.clientHeight;
    const vw = window.innerWidth || document.documentElement.clientWidth;
    return rect.bottom > 0 && rect.right > 0 && rect.top < vh && rect.left < vw;
  }
}
