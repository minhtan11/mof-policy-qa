import { TestBed } from '@angular/core/testing';
import { Router, provideRouter } from '@angular/router';
import { InternalLoginComponent } from './internal-login.component';
import { AuthService, SESSION_KEY } from '../../../core/auth/auth.service';
import { DEMO_DEFAULT_PASSWORD } from '../../../core/mock-api/auth-credentials';
import { ToastService } from '../../../core/toast/toast.service';

/** AU-02 — đăng nhập cán bộ: chỉ tài khoản nội bộ, vai trò mô phỏng chỉ điền sẵn. */
describe('InternalLoginComponent', () => {
  beforeEach(() => {
    localStorage.clear();
    sessionStorage.clear();
  });
  afterEach(() => {
    TestBed.inject(ToastService).clear();
    vi.useRealTimers();
    localStorage.clear();
    sessionStorage.clear();
  });

  function setup() {
    TestBed.configureTestingModule({ imports: [InternalLoginComponent], providers: [provideRouter([])] });
    const fixture = TestBed.createComponent(InternalLoginComponent);
    fixture.detectChanges();
    const nav = vi.spyOn(TestBed.inject(Router), 'navigateByUrl').mockResolvedValue(true);
    return { fixture, cmp: fixture.componentInstance, auth: TestBed.inject(AuthService), toast: TestBed.inject(ToastService), nav };
  }

  function submit(cmp: InternalLoginComponent, identifier: string, password = DEMO_DEFAULT_PASSWORD, remember = true) {
    vi.useFakeTimers();
    cmp.form.setValue({ identifier, password, remember });
    cmp.login();
    vi.advanceTimersByTime(400);
  }

  it('prefills and selects the first internal account', () => {
    const { cmp } = setup();
    expect(cmp.demoAccount).toBe('u-reception');
    expect(cmp.form.getRawValue()).toEqual({ identifier: 'ha.tt', password: DEMO_DEFAULT_PASSWORD, remember: true });
    expect(cmp.accounts.map((u) => u.username)).toEqual(['ha.tt', 'hung.lq', 'long.pd', 'ngoc.db', 'admin']);
  });

  it('choosing a demo role fills username + default password', () => {
    const { cmp } = setup();
    cmp.form.controls.password.setValue('x');
    cmp.pickAccount('u-leader');
    expect(cmp.form.getRawValue()).toMatchObject({ identifier: 'long.pd', password: DEMO_DEFAULT_PASSWORD });
  });

  it('rejects a citizen account with a distinct message and no session', () => {
    const { cmp, auth, toast, nav } = setup();
    submit(cmp, 'minhanh');
    expect(cmp.formError()).toBe('ws.errNotInternal');
    expect(auth.user()).toBeNull();
    expect(toast.toasts().at(-1)?.type).toBe('error');
    expect(nav).not.toHaveBeenCalled();
  });

  it('rejects unknown usernames and wrong passwords', () => {
    const { cmp, auth } = setup();
    submit(cmp, 'nobody');
    expect(cmp.formError()).toBe('login.errCredentials');
    submit(cmp, 'ha.tt', 'sai-mat-khau');
    expect(cmp.formError()).toBe('login.errCredentials');
    expect(auth.user()).toBeNull();
  });

  it.each([
    ['ha.tt', '/workspace'],
    ['HUNG.LQ@moj.gov.vn', '/workspace'],
    ['long.pd', '/workspace'],
    ['ngoc.db', '/workspace'],
    ['admin', '/admin'],
  ])('logs in %s and redirects to %s', (id, url) => {
    const { cmp, nav, auth } = setup();
    submit(cmp, id);
    expect(auth.user()?.role).not.toBe('public');
    expect(nav).toHaveBeenCalledWith(url);
  });

  it('remember off stores the session in sessionStorage only', () => {
    const { cmp } = setup();
    submit(cmp, 'ha.tt', DEMO_DEFAULT_PASSWORD, false);
    expect(sessionStorage.getItem(SESSION_KEY)).toBeTruthy();
    expect(localStorage.getItem(SESSION_KEY)).toBeNull();
  });
});
