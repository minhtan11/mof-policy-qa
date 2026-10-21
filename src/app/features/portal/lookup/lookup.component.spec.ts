import { TestBed } from '@angular/core/testing';
import { Router, convertToParamMap, provideRouter } from '@angular/router';
import { LOOKUP_PAGE_SIZE, LookupComponent, parseLookup, toParams } from './lookup.component';
import { MofPaginationComponent } from '../../../shared/ui/mof-pagination/mof-pagination.component';
import { By } from '@angular/platform-browser';
import { PublicQaRepository } from '../../../core/mock-api/public-qa.repository';

/** UC-162..UC-165 — tra cứu: tìm kiếm, lọc, sắp xếp, kiểu hiển thị, đồng bộ query params, trạng thái rỗng. */
describe('LookupComponent', () => {
  afterEach(() => vi.useRealTimers());

  async function setup(url = '/portal/tra-cuu') {
    localStorage.clear();
    vi.useFakeTimers();
    TestBed.configureTestingModule({
      imports: [LookupComponent],
      providers: [provideRouter([{ path: 'portal/tra-cuu', component: LookupComponent }])],
    });
    const router = TestBed.inject(Router);
    await router.navigateByUrl(url);
    const f = TestBed.createComponent(LookupComponent);
    f.detectChanges();
    const flush = async () => {
      await vi.runAllTimersAsync();
      f.detectChanges();
    };
    await flush();
    return { f, cmp: f.componentInstance, router, flush };
  }

  it('parses and serialises query params (defaults omitted)', () => {
    const s = parseLookup(convertToParamMap({ q: 'thuế', type: 'policy,bogus', status: 'answered', sort: 'views', view: 'grid', page: '2' }));
    expect(s).toMatchObject({ q: 'thuế', types: ['policy'], statuses: ['answered'], sort: 'views', view: 'grid', page: 2, period: 'all' });
    expect(s.size).toBe(LOOKUP_PAGE_SIZE);
    expect(parseLookup(convertToParamMap({ size: '12' })).size).toBe(12);
    expect(parseLookup(convertToParamMap({ size: '7' })).size).toBe(LOOKUP_PAGE_SIZE);
    expect(toParams({ ...s, sort: 'newest', view: 'list', page: 1, types: [] })).toEqual({
      q: 'thuế', topic: null, type: null, status: 'answered', period: null, sort: null, view: null, page: null, size: null,
    });
  });

  it('renders the first page immediately (no skeleton) with pagination', async () => {
    const { f, cmp } = await setup();
    expect(f.nativeElement.querySelector('.skeleton')).toBeNull();
    expect(f.nativeElement.querySelectorAll('article.qa').length).toBe(LOOKUP_PAGE_SIZE);
    const total = TestBed.inject(PublicQaRepository).search({}).length;
    expect(cmp.pages()).toBe(Math.ceil(total / LOOKUP_PAGE_SIZE));
    expect(f.nativeElement.querySelector('app-mof-pagination .range')?.textContent?.replace(/\s+/g, ' ')).toContain(`1–${LOOKUP_PAGE_SIZE} / ${total}`);
  });

  it('pages via ?page= and page size via ?size= (reset to page 1)', async () => {
    const { f, cmp, router, flush } = await setup();
    f.debugElement.query(By.directive(MofPaginationComponent)).componentInstance.pageChange.emit(3);
    await flush();
    expect(router.url).toContain('page=3');
    const ordered = TestBed.inject(PublicQaRepository).search({});
    expect(cmp.visible()[0].id).toBe(ordered[2 * LOOKUP_PAGE_SIZE].id);
    cmp.setSize(12);
    await flush();
    expect(router.url).toContain('size=12');
    expect(router.url).not.toContain('page=');
    expect(f.nativeElement.querySelectorAll('article.qa').length).toBe(12);
  });

  it('clamps an out-of-range ?page= to the last page', async () => {
    const { cmp } = await setup('/portal/tra-cuu?page=99');
    expect(cmp.page()).toBe(cmp.pages());
  });

  it('searches via the hero bar and writes ?q= to the URL', async () => {
    const { cmp, router, flush } = await setup();
    cmp.keyword.set('CSTC-2026-000140');
    cmp.search();
    await flush();
    expect(router.url).toContain('q=CSTC-2026-000140');
    expect(cmp.results().map((r) => r.code)).toEqual(['CSTC-2026-000140']);
  });

  it('applies filters only on "Áp dụng bộ lọc" and resets them', async () => {
    const { cmp, router, flush } = await setup();
    cmp.toggleStatus('processing', true);
    cmp.draftTopic.set('tax');
    expect(cmp.state().statuses).toEqual([]);
    cmp.goPage(2);
    await flush();
    expect(router.url).toContain('page=2');
    cmp.applyFilters();
    await flush();
    expect(router.url).not.toContain('page=');
    expect(router.url).toContain('status=processing');
    expect(router.url).toContain('topic=tax');
    expect(cmp.results().every((r) => r.status === 'processing' && r.topicId === 'tax')).toBe(true);
    cmp.reset();
    await flush();
    expect(cmp.state().statuses).toEqual([]);
    expect(cmp.state().topic).toBeNull();
  });

  it('sorts and toggles view mode via the URL', async () => {
    const { f, cmp, router, flush } = await setup();
    cmp.goPage(2);
    await flush();
    cmp.setSort('views');
    await flush();
    expect(router.url).toContain('sort=views');
    expect(router.url).not.toContain('page=');
    const maxViews = Math.max(...TestBed.inject(PublicQaRepository).search({}).map((r) => r.views));
    expect(cmp.results()[0].views).toBe(maxViews);
    const before = Array.from(f.nativeElement.querySelectorAll('article.qa')) as Element[];
    const list = f.nativeElement.querySelector('.list');
    cmp.setView('grid');
    await flush();
    expect(router.url).toContain('view=grid');
    // Cùng container + cùng node thẻ (không tạo lại → không nháy)
    expect(f.nativeElement.querySelector('.list.grid')).toBe(list);
    const after = Array.from(f.nativeElement.querySelectorAll('article.qa')) as Element[];
    expect(after.length).toBe(before.length);
    expect(after.every((el, i) => el === before[i])).toBe(true);
  });

  it('restores state from the URL and shows the empty state', async () => {
    const { f, cmp } = await setup('/portal/tra-cuu?q=khong-ton-tai-xyz');
    expect(cmp.keyword()).toBe('khong-ton-tai-xyz');
    expect(cmp.results().length).toBe(0);
    expect(f.nativeElement.querySelector('.empty')).not.toBeNull();
  });
});
