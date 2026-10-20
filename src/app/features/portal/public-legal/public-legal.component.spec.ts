import { TestBed } from '@angular/core/testing';
import { Router, convertToParamMap, provideRouter } from '@angular/router';
import { LEGAL_DOCUMENTS } from '../../../core/mock-api/domain-fixtures';
import { LegalDocumentRepository } from '../../../core/mock-api/legal-document.repository';
import { legalParams, parseLegal, PublicLegalComponent } from './public-legal.component';

/** UC-162..UC-165 — văn bản pháp luật công khai: tìm, lọc hiệu lực, mở chi tiết. */
describe('PublicLegalComponent', () => {
  afterEach(() => vi.useRealTimers());

  async function setup(url = '/portal/van-ban') {
    vi.useFakeTimers();
    TestBed.configureTestingModule({
      imports: [PublicLegalComponent],
      providers: [provideRouter([{ path: 'portal/van-ban', component: PublicLegalComponent }])],
    });
    const router = TestBed.inject(Router);
    await router.navigateByUrl(url);
    const f = TestBed.createComponent(PublicLegalComponent);
    f.detectChanges();
    const flush = async () => {
      await vi.runAllTimersAsync();
      f.detectChanges();
    };
    await flush();
    return { f, cmp: f.componentInstance, router, flush };
  }

  it('parses/serialises URL params and ignores bogus status', () => {
    expect(parseLegal(convertToParamMap({ q: 'thuế', status: 'effective' }))).toEqual({ q: 'thuế', status: 'effective' });
    expect(parseLegal(convertToParamMap({ status: 'bogus' }))).toEqual({ q: '', status: null });
    expect(legalParams({ q: '', status: null })).toEqual({ q: null, status: null });
  });

  it('lists LEGAL_DOCUMENTS from the repository on load', async () => {
    const { f, cmp } = await setup();
    expect(cmp.results().length).toBe(LEGAL_DOCUMENTS.length);
    expect(f.nativeElement.querySelectorAll('tbody tr[data-id]').length).toBe(LEGAL_DOCUMENTS.length);
    expect(f.nativeElement.querySelector('app-portal-header')).not.toBeNull();
  });

  it('searches by keyword and writes ?q= to the URL', async () => {
    const { cmp, router, flush } = await setup();
    cmp.keyword.set('38/2019');
    cmp.search();
    await flush();
    expect(router.url).toContain('q=38%2F2019');
    expect(cmp.results().every((d) => d.code.includes('38/2019'))).toBe(true);
  });

  it('filters by status via ?status=', async () => {
    const { cmp, router, flush } = await setup();
    cmp.setStatus('draft');
    await flush();
    expect(router.url).toContain('status=draft');
    expect(cmp.results().length).toBe(1);
    expect(cmp.results()[0].status).toBe('draft');
  });

  it('expands a row to show detail fields (code, title, issuer, effective, status)', async () => {
    const { f, cmp, flush } = await setup();
    const id = cmp.results()[0].id;
    cmp.toggleExpand(id);
    await flush();
    const detail = f.nativeElement.querySelector(`tr.detail-row[data-for="${id}"]`) as HTMLElement;
    expect(detail).not.toBeNull();
    expect(detail.textContent).toContain(cmp.results()[0].code);
    expect(detail.textContent).toContain(cmp.results()[0].title);
    expect(detail.querySelector('app-mof-badge')).not.toBeNull();
  });

  it('clears filters and shows empty state when nothing matches', async () => {
    const { cmp, flush, f } = await setup('/portal/van-ban?q=khong-co-van-ban-xyz');
    expect(cmp.results().length).toBe(0);
    expect(f.nativeElement.querySelector('.empty')).not.toBeNull();
    cmp.clearFilters();
    await flush();
    expect(cmp.results().length).toBe(LEGAL_DOCUMENTS.length);
  });

  it('repository list() supports status filter used by the page', async () => {
    await setup();
    const repo = TestBed.inject(LegalDocumentRepository);
    expect(repo.list({ status: 'effective' }).every((d) => d.status === 'effective')).toBe(true);
    expect(repo.list({ query: 'Bộ Tài chính', status: 'draft' }).length).toBe(1);
  });
});
