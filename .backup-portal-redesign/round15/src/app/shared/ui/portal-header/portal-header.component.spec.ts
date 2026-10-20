import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { PortalHeaderComponent } from './portal-header.component';
import { AuthService } from '../../../core/auth/auth.service';

/** UC-1..UC-8 — header cổng: trạng thái đăng nhập (avatar + tên + menu) và đăng xuất. */
describe('PortalHeaderComponent (auth state)', () => {
  beforeEach(() => localStorage.clear());
  afterEach(() => localStorage.clear());

  function setup() {
    TestBed.configureTestingModule({ imports: [PortalHeaderComponent], providers: [provideRouter([])] });
    const auth = TestBed.inject(AuthService);
    return { auth, make: () => { const f = TestBed.createComponent(PortalHeaderComponent); f.detectChanges(); return f; } };
  }

  it('shows the login link when logged out', () => {
    const { make } = setup();
    const el: HTMLElement = make().nativeElement;
    expect(el.querySelector('.login-link')).not.toBeNull();
    expect(el.querySelector('.user-menu')).toBeNull();
  });

  it('shows avatar initials + name with a menu, and logs out back to the login link', () => {
    const { auth, make } = setup();
    auth.loginById('u-public');
    const fixture = make();
    const el: HTMLElement = fixture.nativeElement;
    expect(el.querySelector('.login-link')).toBeNull();
    expect(el.querySelector('.avatar')?.textContent?.trim()).toBe('MA');
    expect(el.querySelector('.user-name')?.textContent?.trim()).toBe('Nguyễn Minh Anh');

    const btn = el.querySelector<HTMLButtonElement>('.user-btn')!;
    btn.click();
    fixture.detectChanges();
    expect(btn.getAttribute('aria-expanded')).toBe('true');
    expect(el.querySelector('.user-dropdown a[href="/portal/cau-hoi-cua-toi"]')).not.toBeNull();

    el.querySelector<HTMLButtonElement>('.user-dropdown .logout')!.click();
    fixture.detectChanges();
    expect(auth.user()).toBeNull();
    expect(localStorage.getItem('mof-policy-qa.session.v1')).toBeNull();
    expect(el.querySelector('.login-link')).not.toBeNull();
  });
});
