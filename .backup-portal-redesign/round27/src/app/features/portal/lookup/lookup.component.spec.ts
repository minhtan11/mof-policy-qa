import { TestBed } from '@angular/core/testing';
import { Router, convertToParamMap, provideRouter } from '@angular/router';
import { LOOKUP_PAGE_SIZE, LookupComponent, parseLookup, toParams } from './lookup.component';
import { PUBLIC_QA } from '../../../core/mock-api/public-qa-fixtures';

/** UC-162..UC-165 — tra cứu: tìm kiếm, lọc, sắp xếp, kiểu hiển thị, đồng bộ query params, trạng thái rỗng. */
describe('LookupComponent', () => {
  afterEach(() => vi.useRealTimers());

  async function setup(url = '/portal/tra-cuu') {
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
    expect(toParams({ ...s, sort: 'newest', view: 'list', page: 1, types: [] })).toEqual({
      q: 'thuế', topic: null, type: null, status: 'answered', period: null, sort: null, view: null, page: null,
    });
  });

  it('shows a skeleton first, then the first page with load more', async () => {
    const { f, cmp } = await setup();
    expect(cmp.loading()).toBe(false);
    expect(f.nativeElement.querySelectorAll('article.qa').length).toBe(LOOKUP_PAGE_SIZE);
    expect(cmp.results().length).toBe(PUBLIC_QA.length);
    expect(cmp.hasMore()).toBe(true);
  });

  it('searches via the hero bar and writes ?q= to the URL', async () => {
    const { cmp, router, flush } = await setup();
    cmp.keyword.set('CSTC-2026-000140');
    cmp.search();
    await flush();
    expect(router.url).toContain('q=CSTC-2026-000140');
    expect(cmp.results().map((r) => r.id)).toEqual(['qa-1']);
  });

  it('applies filters only on "Áp dụng bộ lọc" and resets them', async () => {
    const { cmp, router, flush } = await setup();
    cmp.toggleStatus('processing', true);
    cmp.draftTopic.set('tax');
    expect(cmp.state().statuses).toEqual([]);
    cmp.applyFilters();
    await flush();
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
    cmp.setSort('views');
    await flush();
    expect(router.url).toContain('sort=views');
    expect(cmp.results()[0].views).toBe(Math.max(...PUBLIC_QA.map((r) => r.views)));
    cmp.setView('grid');
    await flush();
    expect(router.url).toContain('view=grid');
    expect(f.nativeElement.querySelector('.list.grid')).not.toBeNull();
  });

  it('restores state from the URL and shows the empty state', async () => {
    const { f, cmp } = await setup('/portal/tra-cuu?q=khong-ton-tai-xyz');
    expect(cmp.keyword()).toBe('khong-ton-tai-xyz');
    expect(cmp.results().length).toBe(0);
    expect(f.nativeElement.querySelector('.empty')).not.toBeNull();
  });
});
