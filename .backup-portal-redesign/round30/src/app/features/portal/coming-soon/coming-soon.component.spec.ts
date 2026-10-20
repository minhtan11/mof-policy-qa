import { TestBed } from '@angular/core/testing';
import { ActivatedRoute, provideRouter } from '@angular/router';
import { of } from 'rxjs';
import { ComingSoonComponent } from './coming-soon.component';

/** PUB-soon — placeholder Hướng dẫn / VBPL đọc titleKey từ route data. */
describe('ComingSoonComponent', () => {
  it('renders title and body from route data', () => {
    TestBed.configureTestingModule({
      imports: [ComingSoonComponent],
      providers: [
        provideRouter([]),
        {
          provide: ActivatedRoute,
          useValue: {
            data: of({ titleKey: 'nav.guide', bodyKey: 'comingSoon.guideBody' }),
            snapshot: { data: { titleKey: 'nav.guide', bodyKey: 'comingSoon.guideBody' } },
          },
        },
      ],
    });
    const f = TestBed.createComponent(ComingSoonComponent);
    f.detectChanges();
    const el: HTMLElement = f.nativeElement;
    expect(f.componentInstance.titleKey()).toBe('nav.guide');
    expect(f.componentInstance.bodyKey()).toBe('comingSoon.guideBody');
    expect(el.querySelector('h1')?.textContent?.trim().length).toBeGreaterThan(0);
    expect(el.querySelector('a[href="/portal"]')).not.toBeNull();
    expect(el.querySelector('a[href="/portal/tra-cuu"]')).not.toBeNull();
  });
});
