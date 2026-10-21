import { Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { Router, convertToParamMap, provideRouter } from '@angular/router';
import { By } from '@angular/platform-browser';
import { MINE_PAGE_SIZE, MyQuestionsComponent, mineParams, parseMine } from './my-questions.component';
import { AuthService } from '../../../core/auth/auth.service';
import { DEMO_DEFAULT_PASSWORD } from '../../../core/mock-api/auth-credentials';
import { MY_QUESTIONS_DEMO_EMAIL } from '../../../core/mock-api/my-questions-fixtures';
import { ToastService } from '../../../core/toast/toast.service';
import { MofPaginationComponent } from '../../../shared/ui/mof-pagination/mof-pagination.component';

@Component({ template: 'detail' })
class DetailStub {}

/** UC-110, UC-122 — Câu hỏi của tôi: email, tải, lọc, sắp xếp, phân trang theo URL, thẻ mobile, mở chi tiết. */
describe('MyQuestionsComponent', () => {
  afterEach(() => {
    vi.useRealTimers();
    localStorage.clear();
  });

  async function setup(url = '/portal/cau-hoi-cua-toi', login = true) {
    vi.useFakeTimers();
    localStorage.clear();
    TestBed.configureTestingModule({
      imports: [MyQuestionsComponent],
      providers: [
        provideRouter([
          { path: 'portal/cau-hoi-cua-toi', component: MyQuestionsComponent },
          { path: 'portal/ho-so/:code', component: DetailStub },
        ]),
      ],
    });
    if (login) TestBed.inject(AuthService).loginWithCredentials('minhanh', DEMO_DEFAULT_PASSWORD, false);
    const router = TestBed.inject(Router);
    await router.navigateByUrl(url);
    const f = TestBed.createComponent(MyQuestionsComponent);
    f.detectChanges();
    const flush = async () => {
      await vi.runAllTimersAsync();
      f.detectChanges();
    };
    await flush();
    const rows = () => Array.from(f.nativeElement.querySelectorAll('tbody tr')) as HTMLElement[];
    return { f, cmp: f.componentInstance, router, flush, rows };
  }

  it('parses/serialises URL params with defaults omitted and bogus values ignored', () => {
    const s = parseMine(convertToParamMap({ status: 'rejected', topic: 'tax', sort: 'due', page: '3', size: '20' }));
    expect(s).toEqual({ status: 'rejected', topic: 'tax', sort: 'due', page: 3, size: 20 });
    const d = parseMine(convertToParamMap({ status: 'bogus', sort: 'x', size: '7', page: '-2' }));
    expect(d).toEqual({ status: null, topic: null, sort: 'newest', page: 1, size: MINE_PAGE_SIZE });
    expect(mineParams(d)).toEqual({ status: null, topic: null, sort: null, page: null, size: null });
  });

  it('signed in: prefills the account email and auto-loads the first page', async () => {
    const { cmp, rows, f } = await setup();
    expect(cmp.emailCtrl.value).toBe(MY_QUESTIONS_DEMO_EMAIL);
    expect(cmp.results().length).toBeGreaterThan(MINE_PAGE_SIZE);
    expect(rows().length).toBe(MINE_PAGE_SIZE);
    expect(f.nativeElement.querySelector('.total strong').textContent.trim()).toBe(String(cmp.results().length));
  });

  it('validates the email in a reserved error slot (no layout shift)', async () => {
    const { cmp, f } = await setup('/portal/cau-hoi-cua-toi', false);
    const slot = f.nativeElement.querySelector('#my-email-error p, p.mof-field-error') as HTMLElement;
    expect(slot).not.toBeNull();
    cmp.emailCtrl.setValue('khong-hop-le@abc');
    cmp.load();
    f.detectChanges();
    expect(cmp.emailError()).toContain('Email không hợp lệ');
    expect(f.nativeElement.querySelector('p.mof-field-error')).toBe(slot);
    cmp.emailCtrl.setValue('');
    f.detectChanges();
    expect(cmp.emailError()).toBe('Vui lòng nhập email.');
  });

  it('guest lookup: loads by email and toasts when nothing is found', async () => {
    const { cmp, f, flush, rows } = await setup('/portal/cau-hoi-cua-toi', false);
    const toast = TestBed.inject(ToastService);
    const spy = vi.spyOn(toast, 'info');
    cmp.emailCtrl.setValue('khong-ai@example.vn');
    cmp.load();
    await flush();
    expect(spy).toHaveBeenCalledWith('my.toastEmpty', expect.objectContaining({ params: { email: 'khong-ai@example.vn' } }));
    expect(f.nativeElement.querySelector('.empty')).not.toBeNull();
    cmp.emailCtrl.setValue(' MinhAnh@Example.vn ');
    cmp.load();
    await flush();
    expect(rows().length).toBe(MINE_PAGE_SIZE);
    expect(spy).toHaveBeenCalledTimes(1);
  });

  it('filters by status/topic via URL and resets to page 1', async () => {
    const { cmp, router, flush, rows } = await setup('/portal/cau-hoi-cua-toi?page=2');
    expect(cmp.page()).toBe(2);
    cmp.setStatus('rejected');
    await flush();
    expect(router.url).toContain('status=rejected');
    expect(router.url).not.toContain('page=');
    expect(rows().every((r) => r.dataset['status'] === 'rejected')).toBe(true);
    cmp.setTopic('other');
    await flush();
    expect(router.url).toContain('topic=other');
    expect(cmp.results().every((r) => r.topicId === 'other' && r.status === 'rejected')).toBe(true);
    cmp.clearFilters();
    await flush();
    expect(cmp.results().length).toBeGreaterThan(MINE_PAGE_SIZE);
  });

  it('sorts via ?sort= (oldest first) and resets the page', async () => {
    const { cmp, router, flush } = await setup('/portal/cau-hoi-cua-toi?page=3');
    cmp.setSort('oldest');
    await flush();
    expect(router.url).toContain('sort=oldest');
    expect(router.url).not.toContain('page=');
    const v = cmp.visible();
    expect(new Date(v[0].receivedAt).getTime()).toBeLessThanOrEqual(new Date(v[1].receivedAt).getTime());
  });

  it('paginates with ?page= / ?size= and keeps the same component instance', async () => {
    const { f, cmp, router, flush, rows } = await setup();
    const instance = cmp;
    const firstIds = cmp.visible().map((r) => r.id);
    const total = cmp.results().length;
    const last = Math.ceil(total / MINE_PAGE_SIZE);
    f.debugElement.query(By.directive(MofPaginationComponent)).componentInstance.pageChange.emit(last);
    await flush();
    expect(router.url).toContain(`page=${last}`);
    expect(rows().length).toBe(total - MINE_PAGE_SIZE * (last - 1));
    expect(cmp.visible().some((r) => firstIds.includes(r.id))).toBe(false);
    cmp.setSize(20);
    await flush();
    expect(router.url).toContain('size=20');
    expect(router.url).not.toContain('page=');
    expect(rows().length).toBe(Math.min(20, total));
    expect(f.componentInstance).toBe(instance);
    expect(f.nativeElement.querySelector('app-mof-pagination .per-page')).not.toBeNull();
  });

  it('clamps an out-of-range page', async () => {
    const { cmp } = await setup('/portal/cau-hoi-cua-toi?page=99');
    expect(cmp.page()).toBe(cmp.pages());
  });

  it('renders rows that collapse into stacked cards on mobile (labels + tone on each row)', async () => {
    const { rows } = await setup();
    const r = rows()[0];
    const labels = Array.from(r.querySelectorAll('td')).map((td) => td.getAttribute('data-label'));
    expect(labels).toEqual(['Mã hồ sơ', 'Nội dung', 'Trạng thái', 'Ngày gửi', 'Hạn xử lý', 'Thao tác']);
    expect(r.dataset['status']).toBeTruthy();
    expect(r.querySelector('.pill app-mof-fi-icon')).not.toBeNull();
  });

  it('shows “-” as due for answered rows and flags overdue/near ones', async () => {
    const { cmp, flush, f } = await setup();
    cmp.setStatus('answered');
    await flush();
    const due = f.nativeElement.querySelector('td.due') as HTMLElement;
    expect(due.dataset['due']).toBe('done');
    expect(due.textContent?.trim()).toBe('-');
  });

  it('opens the existing detail route from “Xem chi tiết”', async () => {
    const { rows, router, flush } = await setup();
    const link = rows()[0].querySelector('a.view') as HTMLAnchorElement;
    const code = rows()[0].querySelector('.code a')!.textContent!.trim();
    link.click();
    await flush();
    expect(router.url).toBe(`/portal/ho-so/${code}`);
  });
});
