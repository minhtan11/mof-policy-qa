import { TestBed } from '@angular/core/testing';
import { AuthService, SESSION_KEY } from './auth.service';
import { DEMO_DEFAULT_PASSWORD } from '../mock-api/auth-credentials';

/** UC-1..UC-8 — phiên demo, đăng nhập bằng tài khoản/mật khẩu, ghi nhớ. */
describe('AuthService', () => {
  let service: AuthService;
  beforeEach(() => {
    localStorage.clear();
    sessionStorage.clear();
    TestBed.configureTestingModule({});
    service = TestBed.inject(AuthService);
  });
  afterEach(() => {
    localStorage.clear();
    sessionStorage.clear();
  });

  it('creates a role-aware demo session', () => {
    service.loginAs('specialist');
    expect(service.user()?.role).toBe('specialist');
    expect(service.isInternal()).toBe(true);
  });

  it('logs in by username or case-insensitive email with the demo password', () => {
    expect(service.loginWithCredentials('minhanh', DEMO_DEFAULT_PASSWORD)?.id).toBe('u-public');
    expect(service.loginWithCredentials('  HUNG.LQ@moj.gov.vn ', DEMO_DEFAULT_PASSWORD)?.id).toBe('u-specialist');
    expect(service.user()?.id).toBe('u-specialist');
  });

  it('rejects a wrong password or unknown user without changing the session', () => {
    service.loginWithCredentials('admin', DEMO_DEFAULT_PASSWORD);
    expect(service.loginWithCredentials('admin', 'sai-mat-khau')).toBeNull();
    expect(service.loginWithCredentials('khong-ton-tai', DEMO_DEFAULT_PASSWORD)).toBeNull();
    expect(service.user()?.id).toBe('u-admin');
  });

  it('remember → localStorage, otherwise sessionStorage; logout clears both', () => {
    service.loginWithCredentials('minhanh', DEMO_DEFAULT_PASSWORD, true);
    expect(localStorage.getItem(SESSION_KEY)).not.toBeNull();
    expect(sessionStorage.getItem(SESSION_KEY)).toBeNull();
    service.loginWithCredentials('minhanh', DEMO_DEFAULT_PASSWORD, false);
    expect(localStorage.getItem(SESSION_KEY)).toBeNull();
    expect(sessionStorage.getItem(SESSION_KEY)).not.toBeNull();
    service.logout();
    expect(localStorage.getItem(SESSION_KEY)).toBeNull();
    expect(sessionStorage.getItem(SESSION_KEY)).toBeNull();
  });

  it('restores a session from sessionStorage', () => {
    service.loginWithCredentials('ngoc.db', DEMO_DEFAULT_PASSWORD, false);
    TestBed.resetTestingModule();
    TestBed.configureTestingModule({});
    expect(TestBed.inject(AuthService).user()?.id).toBe('u-coordinator');
  });

  it('routes each role to a sensible landing page', () => {
    expect(service.landingFor(service.loginAs('public'))).toBe('/portal/hoi-dap');
    expect(service.landingFor(service.loginAs('leader'))).toBe('/workspace');
    expect(service.landingFor(service.loginAs('system-admin'))).toBe('/admin');
  });
});
