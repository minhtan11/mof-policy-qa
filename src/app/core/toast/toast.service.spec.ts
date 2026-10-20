import { TestBed } from '@angular/core/testing';
import { TOAST_LEAVE_MS, TOAST_MAX, ToastService } from './toast.service';

/** Toast dùng chung: giới hạn hàng đợi, gộp trùng, tự đóng, tạm dừng. */
describe('ToastService', () => {
  let svc: ToastService;
  beforeEach(() => {
    vi.useFakeTimers();
    TestBed.configureTestingModule({});
    svc = TestBed.inject(ToastService);
  });
  afterEach(() => {
    svc.clear();
    vi.useRealTimers();
  });

  const live = () => svc.toasts().filter((t) => !t.leaving);

  it('keeps at most 3 visible toasts (drops the oldest)', () => {
    ['a', 'b', 'c', 'd'].forEach((m) => svc.info(m));
    expect(live().length).toBe(TOAST_MAX);
    expect(live().map((t) => t.message)).toEqual(['b', 'c', 'd']);
    vi.advanceTimersByTime(TOAST_LEAVE_MS);
    expect(svc.toasts().length).toBe(3);
  });

  it('dedupes identical toasts and refreshes their timer', () => {
    const id = svc.error('Sai', { title: 'Lỗi' });
    vi.advanceTimersByTime(5000);
    expect(svc.error('Sai', { title: 'Lỗi' })).toBe(id);
    expect(svc.toasts().length).toBe(1);
    expect(svc.toasts()[0].rev).toBe(1);
    vi.advanceTimersByTime(5000);
    expect(live().length).toBe(1);
  });

  it('auto-dismisses after 4s by default and 6s for errors; translates keys with params', () => {
    svc.success('ask.toastBody', { params: { code: 'X-1' } });
    svc.error('boom');
    expect(svc.toasts()[0].message).toContain('X-1');
    vi.advanceTimersByTime(4000 + TOAST_LEAVE_MS);
    expect(svc.toasts().map((t) => t.type)).toEqual(['error']);
    vi.advanceTimersByTime(2000 + TOAST_LEAVE_MS);
    expect(svc.toasts().length).toBe(0);
  });

  it('pauses on hover/focus and resumes with the remaining time', () => {
    const id = svc.info('x');
    vi.advanceTimersByTime(3000);
    svc.pause(id);
    vi.advanceTimersByTime(10000);
    expect(live().length).toBe(1);
    expect(svc.toasts()[0].paused).toBe(true);
    svc.resume(id);
    vi.advanceTimersByTime(999);
    expect(live().length).toBe(1);
    vi.advanceTimersByTime(1);
    expect(live().length).toBe(0);
  });

  it('maps the legacy show() API', () => {
    svc.show({ severity: 'warn', summary: 'Tiêu đề', detail: 'Nội dung' });
    expect(svc.toasts()[0]).toMatchObject({ type: 'warning', title: 'Tiêu đề', message: 'Nội dung' });
  });
});
