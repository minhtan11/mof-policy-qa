import { TestBed } from '@angular/core/testing';
import { Router, provideRouter } from '@angular/router';
import { RouterTestingHarness } from '@angular/router/testing';
import { WorkspaceComponent } from './workspace.component';
import { AuthService } from '../../../core/auth/auth.service';
import { DEMO_DEFAULT_PASSWORD } from '../../../core/mock-api/auth-credentials';
import { WorkspaceOverviewRepository } from '../../../core/mock-api/workspace-overview.repository';

/** R31 — W-01: tab + tìm kiếm + phân trang + tháng đồng bộ URL; KPI dẫn tới hàng đợi đã lọc. */
describe('WorkspaceComponent (Tổng quan công việc)', () => {
  beforeAll(() => {
    // ApexCharts (mof-chart) cần ResizeObserver — jsdom không có.
    (globalThis as { ResizeObserver?: unknown }).ResizeObserver ??= class {
      observe(): void {}
      unobserve(): void {}
      disconnect(): void {}
    };
  });
  afterEach(() => {
    vi.useRealTimers();
    localStorage.clear();
  });

  async function setup(url = '/workspace', user = 'ha.tt') {
    vi.useFakeTimers({ toFake: ['setTimeout', 'clearTimeout', 'Date'] });
    vi.setSystemTime(new Date('2026-10-20T09:00:00'));
    localStorage.clear();
    TestBed.configureTestingModule({ providers: [provideRouter([{ path: 'workspace', component: WorkspaceComponent }])] });
    TestBed.inject(AuthService).loginWithCredentials(user, DEMO_DEFAULT_PASSWORD, false);
    const h = await RouterTestingHarness.create(url);
    const el = h.routeNativeElement as HTMLElement;
    const cmp = h.routeDebugElement!.componentInstance as WorkspaceComponent;
    const router = TestBed.inject(Router);
    const flush = async () => {
      await vi.runAllTimersAsync();
      h.detectChanges();
    };
    await flush();
    return { h, el, cmp, router, flush, repo: TestBed.inject(WorkspaceOverviewRepository) };
  }

  it('renders hero (h1, localized date), 4 KPI cards from the repository and KPI links to filtered queues', async () => {
    const { el, repo } = await setup();
    expect(el.querySelector('.crumbs')).toBeNull();
    expect(el.querySelectorAll('h1').length).toBe(1);
    expect(el.querySelector('h1')?.textContent).toContain('Tổng quan công việc');
    expect(el.querySelector('.date-card strong')?.textContent).toBe('Thứ Ba, 20/10/2026');
    const kpis = [...el.querySelectorAll('.kpi')];
    expect(kpis.length).toBe(4);
    const values = repo.kpis(Date.now()).map((k) => String(k.value));
    expect(kpis.map((k) => k.querySelector('.k-num')?.textContent?.trim())).toEqual(values);
    expect(kpis[1].querySelector('a.k-go')?.getAttribute('href')).toBe('/workspace?filter=processing');
  });

  it('syncs tabs with ?filter= and search with ?q= (debounced, replaceUrl)', async () => {
    const { el, router, flush, cmp } = await setup('/workspace?filter=waiting-approval');
    expect(el.querySelector('.tab.on')?.getAttribute('data-tab')).toBe('waiting-approval');
    expect(el.querySelectorAll('.mof-tbl tbody tr').length).toBe(cmp.rows().length);
    (el.querySelector('.tab[data-tab="new"]') as HTMLButtonElement).click();
    await flush();
    expect(router.url).toBe('/workspace?filter=new');
    const input = el.querySelector('.search input') as HTMLInputElement;
    input.value = 'thue';
    input.dispatchEvent(new Event('input'));
    expect(router.url).toBe('/workspace?filter=new');
    await flush();
    expect(router.url).toBe('/workspace?filter=new&q=thue');
    (el.querySelector('.tab[data-tab="all"]') as HTMLButtonElement).click();
    await flush();
    expect(router.url).toBe('/workspace?q=thue');
    const fold = (v: string) => v.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();
    expect(cmp.rows().length).toBeGreaterThan(0);
    expect(cmp.rows().every((d) => fold(`${d.code} ${d.question} ${d.sender} ${d.organization}`).includes('thue'))).toBe(true);
  });

  it('paginates with mof-pagination (first/last, page size) and keeps ?page= / ?size=', async () => {
    // Điều phối viên scope=all — đủ hồ sơ để kiểm tra phân trang (>10).
    const { el, router, flush, cmp } = await setup('/workspace', 'ngoc.db');
    const total = cmp.rows().length;
    expect(total).toBeGreaterThan(10);
    expect(el.querySelectorAll('.mof-tbl tbody tr').length).toBe(10);
    expect(el.querySelector('.mof-dt__foot app-mof-pagination')).toBeTruthy();
    (el.querySelector('button[aria-label="Trang cuối"]') as HTMLButtonElement).click();
    await flush();
    expect(router.url).toBe(`/workspace?page=${Math.ceil(total / 10)}`);
    expect(el.querySelectorAll('.mof-tbl tbody tr').length).toBe(total - 10 * (Math.ceil(total / 10) - 1));
    cmp.setSize(20);
    await flush();
    expect(router.url).toBe('/workspace?size=20');
    expect(el.querySelectorAll('.mof-tbl tbody tr').length).toBe(Math.min(20, total));
  });

  it('filters the progress donut by month (?month=) with centre total and legend', async () => {
    const { el, router, flush, cmp, repo } = await setup();
    expect(cmp.selectedMonth()).toBe('2026-10');
    const oct = repo.progress('2026-10', Date.now());
    expect(el.querySelector('.center strong')?.textContent).toBe(String(oct.total));
    cmp.setMonth('2026-09');
    await flush();
    expect(router.url).toBe('/workspace?month=2026-09');
    const sep = repo.progress('2026-09', Date.now());
    expect(el.querySelector('.center strong')?.textContent).toBe(String(sep.total));
    const legend = [...el.querySelectorAll('.legend b')].map((b) => +b.textContent!);
    expect(legend).toEqual([sep.onTime, sep.nearDue, sep.overdue, sep.done]);
  });

  it('lists topics with percentage + count', async () => {
    const { el, repo } = await setup();
    const first = repo.topicStats()[0];
    expect(el.querySelector('.t-list li .t-name')?.textContent).toBe(first.name);
    expect(el.querySelector('.t-list li .t-val')?.textContent?.replace(/\s+/g, ' ').trim()).toBe(`${first.pct}% (${first.count})`);
  });

  it('role scoping: specialist only sees assigned dossiers and has no create action', async () => {
    const { cmp } = await setup('/workspace', 'hung.lq');
    expect(cmp.rows().every((d) => d.assignedTo === 'Lê Quốc Hưng')).toBe(true);
    expect(cmp.canCreate()).toBe(false);
  });
});
