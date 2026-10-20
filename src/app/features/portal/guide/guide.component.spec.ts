import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { GuideComponent } from './guide.component';
import { GUIDE_FAQS, GUIDE_SECTIONS } from '../../../core/mock-api/guide-fixtures';

/** UC-162..UC-165 — Hướng dẫn cổng: hành trình + FAQ từ repository. */
describe('GuideComponent', () => {
  async function setup() {
    TestBed.configureTestingModule({
      imports: [GuideComponent],
      providers: [provideRouter([{ path: 'portal/huong-dan', component: GuideComponent }])],
    });
    const f = TestBed.createComponent(GuideComponent);
    f.detectChanges();
    return { f, cmp: f.componentInstance };
  }

  it('renders three journey sections from fixtures (no inline mock data)', async () => {
    const { f, cmp } = await setup();
    expect(cmp.sections).toEqual(GUIDE_SECTIONS);
    expect(f.nativeElement.querySelectorAll('article.journey').length).toBe(3);
    expect(f.nativeElement.querySelector('[data-id="ask"]')).not.toBeNull();
    expect(f.nativeElement.querySelector('[data-id="track"]')).not.toBeNull();
    expect(f.nativeElement.querySelector('[data-id="evaluate"]')).not.toBeNull();
  });

  it('lists FAQs and toggles one open at a time', async () => {
    const { f, cmp } = await setup();
    expect(cmp.faqs).toEqual(GUIDE_FAQS);
    expect(f.nativeElement.querySelectorAll('.faq-list > li').length).toBe(GUIDE_FAQS.length);
    expect(cmp.openFaq()).toBe(GUIDE_FAQS[0].id);
    cmp.toggleFaq(GUIDE_FAQS[1].id);
    f.detectChanges();
    expect(cmp.openFaq()).toBe(GUIDE_FAQS[1].id);
    expect(f.nativeElement.querySelector('#faq-' + GUIDE_FAQS[1].id)).not.toBeNull();
    cmp.toggleFaq(GUIDE_FAQS[1].id);
    f.detectChanges();
    expect(cmp.openFaq()).toBeNull();
  });

  it('uses portal chrome (header, footer, backdrop) and breadcrumb', async () => {
    const { f } = await setup();
    expect(f.nativeElement.querySelector('app-portal-header')).not.toBeNull();
    expect(f.nativeElement.querySelector('app-portal-footer')).not.toBeNull();
    expect(f.nativeElement.querySelector('app-page-backdrop')).not.toBeNull();
    expect(f.nativeElement.querySelector('app-mof-breadcrumb')).not.toBeNull();
  });
});
