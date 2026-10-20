import { TestBed } from '@angular/core/testing';
import { ActivatedRoute, Router, convertToParamMap, provideRouter } from '@angular/router';
import { PublicLoginComponent } from './public-login.component';
import { AuthService, SESSION_KEY } from '../../../core/auth/auth.service';
import { DEMO_DEFAULT_PASSWORD } from '../../../core/mock-api/auth-credentials';
import { ToastService } from '../../../core/toast/toast.service';

/** UC-1..UC-8 — PUB-login: validation, đăng nhập bằng tài khoản thật trong fixture, ghi nhớ, VNeID. */
describe('PublicLoginComponent', () => {
  beforeEach(() => {
    localStorage.clear();
    sessionStorage.clear();
  });
  afterEach(() => {
    vi.useRealTimers();
    localStorage.clear();
    sessionStorage.clear();
  });

  function setup() {
    TestBed.configureTestingModule({ imports: [PublicLoginComponent], providers: [provideRouter([])] });
    const fixture = TestBed.createComponent(PublicLoginComponent);
    fixture.detectChanges();
    const router = TestBed.inject(Router);
    const nav = vi.spyOn(router, 'navigateByUrl').mockResolvedValue(true);
    return { fixture, cmp: fixture.componentInstance, auth: TestBed.inject(AuthService), nav };
  }

  function submit(cmp: PublicLoginComponent, identifier: string, password: string, remember = true) {
    vi.useFakeTimers();
    cmp.form.setValue({ identifier, password, remember });
    cmp.login();
    vi.advanceTimersByTime(400);
  }

  it('prefills the default demo account', () => {
    const { cmp } = setup();
    expect(cmp.form.getRawValue()).toEqual({ identifier: 'minhanh', password: DEMO_DEFAULT_PASSWORD, remember: true });
  });

  it('blocks submit and shows i18n errors when empty', () => {
    const { cmp } = setup();
    cmp.form.setValue({ identifier: '', password: '', remember: true });
    cmp.login();
    expect(cmp.loading()).toBe(false);
    expect(cmp.errorOf('identifier')).toBe('login.errIdentifierRequired');
    expect(cmp.errorOf('password')).toBe('login.errPasswordRequired');
  });

  it('flags a short password', () => {
    const { cmp } = setup();
    cmp.form.setValue({ identifier: 'dan@example.vn', password: '123', remember: true });
    cmp.login();
    expect(cmp.errorOf('password')).toBe('login.errPasswordShort');
  });

  it('logs in with the correct username + password and goes to the portal', () => {
    const { cmp, auth, nav } = setup();
    submit(cmp, 'minhanh', DEMO_DEFAULT_PASSWORD);
    expect(auth.user()?.id).toBe('u-public');
    expect(nav).toHaveBeenCalledWith('/portal/hoi-dap');
  });

  it('uses the typed email (not the prefill) and routes internal roles to /workspace', () => {
    const { cmp, auth, nav } = setup();
    submit(cmp, 'Long.PD@moj.gov.vn', DEMO_DEFAULT_PASSWORD);
    expect(auth.user()?.id).toBe('u-leader');
    expect(nav).toHaveBeenCalledWith('/workspace');
  });

  it('shows one reserved-space form error on a wrong password and clears it on edit', () => {
    const { fixture, cmp, auth, nav } = setup();
    const slots = fixture.nativeElement.querySelectorAll('app-mof-field-error').length;
    submit(cmp, 'minhanh', 'sai-mat-khau');
    fixture.detectChanges();
    expect(auth.user()).toBeNull();
    expect(nav).not.toHaveBeenCalled();
    expect(cmp.formError()).toBe('login.errCredentials');
    expect(fixture.nativeElement.querySelectorAll('app-mof-field-error').length).toBe(slots);
    expect(fixture.nativeElement.querySelector('#login-form-err')?.classList.contains('visible')).toBe(true);
    expect(fixture.nativeElement.querySelectorAll('[id="login-form-err"]').length).toBe(1);
    cmp.form.controls.password.setValue('khac123456');
    expect(cmp.formError()).toBeNull();
  });

  it('remember unchecked stores the session in sessionStorage only', () => {
    const { cmp } = setup();
    submit(cmp, 'admin', DEMO_DEFAULT_PASSWORD, false);
    expect(sessionStorage.getItem(SESSION_KEY)).not.toBeNull();
    expect(localStorage.getItem(SESSION_KEY)).toBeNull();
  });

  it('reserves error slots so showing errors does not add/remove elements', () => {
    const { fixture, cmp } = setup();
    const before = fixture.nativeElement.querySelectorAll('app-mof-field-error').length;
    cmp.form.setValue({ identifier: '', password: '', remember: true });
    cmp.login();
    fixture.detectChanges();
    expect(before).toBe(3);
    expect(fixture.nativeElement.querySelectorAll('app-mof-field-error').length).toBe(3);
    expect(fixture.nativeElement.querySelectorAll('.mof-field-error.visible').length).toBe(2);
  });

  it('opens the VNeID QR view in-place and goes back to password', () => {
    const { fixture, cmp } = setup();
    fixture.nativeElement.querySelector('.vneid-card').click();
    fixture.detectChanges();
    expect(cmp.mode()).toBe('vneid');
    expect(fixture.nativeElement.querySelector('app-vneid-qr-panel app-mof-qr')).not.toBeNull();
    cmp.backToPassword();
    expect(cmp.mode()).toBe('password');
  });

  it('opens VNeID mode when arriving with ?method=vneid', () => {
    TestBed.resetTestingModule();
    TestBed.configureTestingModule({
      imports: [PublicLoginComponent],
      providers: [
        provideRouter([]),
        {
          provide: ActivatedRoute,
          useValue: { snapshot: { queryParamMap: convertToParamMap({ method: 'vneid' }) } },
        },
      ],
    });
    const fixture = TestBed.createComponent(PublicLoginComponent);
    fixture.detectChanges();
    expect(fixture.componentInstance.mode()).toBe('vneid');
    expect(fixture.nativeElement.querySelector('app-vneid-qr-panel app-mof-qr')).not.toBeNull();
  });

  it('switches account type', () => {
    const { cmp } = setup();
    cmp.accountType.set('business');
    expect(cmp.accountType()).toBe('business');
  });

  it('toasts: warning on invalid form, error on wrong credentials, welcome on success', () => {
    const { cmp } = setup();
    const toast = TestBed.inject(ToastService);
    cmp.form.setValue({ identifier: '', password: '', remember: true });
    cmp.login();
    expect(toast.toasts().at(-1)).toMatchObject({ type: 'warning' });
    submit(cmp, 'minhanh', 'sai-mat-khau');
    expect(toast.toasts().at(-1)).toMatchObject({ type: 'error' });
    submit(cmp, 'minhanh', DEMO_DEFAULT_PASSWORD);
    expect(toast.toasts().at(-1)?.type).toBe('success');
    expect(toast.toasts().at(-1)?.message).toContain('Nguyễn Minh Anh');
    toast.clear();
  });
});
