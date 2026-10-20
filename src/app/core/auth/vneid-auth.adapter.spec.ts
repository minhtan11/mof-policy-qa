import { TestBed } from '@angular/core/testing';
import { AuthService } from './auth.service';
import { MockVneidAuthAdapter, VneidAuthAdapter } from './vneid-auth.adapter';
import { VNEID_MOCK } from '../mock-api/vneid-fixtures';

/** UC-1..UC-8 — máy trạng thái đăng nhập VNeID (mock). */
describe('MockVneidAuthAdapter', () => {
  let adapter: VneidAuthAdapter;
  let auth: AuthService;

  beforeEach(() => {
    vi.useFakeTimers();
    localStorage.clear();
    TestBed.configureTestingModule({});
    adapter = TestBed.inject(VneidAuthAdapter);
    auth = TestBed.inject(AuthService);
  });

  afterEach(() => {
    adapter.cancel();
    vi.useRealTimers();
    localStorage.clear();
  });

  it('defaults to the mock implementation', () => {
    expect(adapter).toBeInstanceOf(MockVneidAuthAdapter);
    expect(adapter.status()).toBe('idle');
  });

  it('waiting → scanning → scanned → confirming → success and logs in the default citizen', () => {
    const seen: string[] = [];
    adapter.status$.subscribe((s) => seen.push(s));
    adapter.startSession();
    expect(adapter.status()).toBe('waiting');
    expect(adapter.session()?.qrPayload).toContain(VNEID_MOCK.authorizeUrl);
    adapter.simulateScan!();
    expect(adapter.status()).toBe('scanning');
    vi.advanceTimersByTime(VNEID_MOCK.scanDelayMs);
    expect(adapter.status()).toBe('scanned');
    adapter.confirm();
    expect(adapter.status()).toBe('confirming');
    vi.advanceTimersByTime(VNEID_MOCK.confirmDelayMs);
    expect(adapter.status()).toBe('success');
    expect(auth.user()?.id).toBe('u-public');
    expect(seen).toEqual(['idle', 'waiting', 'scanning', 'scanned', 'confirming', 'success']);
  });

  it('deny → denied; retry starts a new waiting session', () => {
    adapter.startSession();
    const first = adapter.session()!.id;
    adapter.simulateScan!();
    vi.advanceTimersByTime(VNEID_MOCK.scanDelayMs);
    adapter.deny();
    expect(adapter.status()).toBe('denied');
    expect(auth.user()).toBeNull();
    adapter.refresh();
    expect(adapter.status()).toBe('waiting');
    expect(adapter.session()!.id).not.toBe(first);
  });

  it('auto-refreshes the QR on expiry while waiting, counts down each second', () => {
    adapter.startSession();
    const first = adapter.session()!.id;
    vi.advanceTimersByTime(1000);
    expect(adapter.remaining()).toBe(VNEID_MOCK.qrTtlSec - 1);
    vi.advanceTimersByTime((VNEID_MOCK.qrTtlSec - 1) * 1000);
    expect(adapter.status()).toBe('waiting');
    expect(adapter.session()!.id).not.toBe(first);
    expect(adapter.remaining()).toBe(VNEID_MOCK.qrTtlSec);
  });

  it('expires when the scan is not confirmed in time; ignores invalid transitions', () => {
    adapter.startSession();
    adapter.confirm(); // chưa quét → bỏ qua
    expect(adapter.status()).toBe('waiting');
    adapter.simulateScan!();
    vi.advanceTimersByTime(VNEID_MOCK.qrTtlSec * 1000);
    expect(adapter.status()).toBe('expired');
    adapter.confirm();
    expect(adapter.status()).toBe('expired');
  });
});
