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

describe('PortalHeaderComponent (mobile drawer)', () => {
  beforeEach(() => localStorage.clear());
  afterEach(() => {
    localStorage.clear();
    document.documentElement.classList.remove('mof-scroll-lock');
  });

  function mobile() {
    TestBed.configureTestingModule({ imports: [PortalHeaderComponent], providers: [provideRouter([])] });
    const fixture = TestBed.createComponent(PortalHeaderComponent);
    fixture.componentInstance.desktop.set(false);
    fixture.detectChanges();
    return { fixture, cmp: fixture.componentInstance, el: fixture.nativeElement as HTMLElement };
  }

  it('opens with scroll lock, Esc closes and unlocks', () => {
    const { fixture, cmp, el } = mobile();
    el.querySelector<HTMLButtonElement>('.menu-btn')!.click();
    fixture.detectChanges();
    expect(cmp.menuOpen()).toBe(true);
    expect(document.documentElement.classList.contains('mof-scroll-lock')).toBe(true);
    expect(el.querySelector('.drawer-root.open')).not.toBeNull();
    el.querySelector('.drawer')!.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }));
    fixture.detectChanges();
    expect(cmp.menuOpen()).toBe(false);
    expect(document.documentElement.classList.contains('mof-scroll-lock')).toBe(false);
  });

  it('accordion keeps only one section open', () => {
    const { fixture, cmp, el } = mobile();
    cmp.openMenu();
    fixture.detectChanges();
    const rows = el.querySelectorAll<HTMLButtonElement>('button.acc-row');
    rows[0].click();
    fixture.detectChanges();
    expect(el.querySelectorAll('.acc-panel.open').length).toBe(1);
    rows[1].click();
    fixture.detectChanges();
    expect(el.querySelectorAll('.acc-panel.open').length).toBe(1);
    expect(rows[1].getAttribute('aria-expanded')).toBe('true');
    expect(rows[0].getAttribute('aria-expanded')).toBe('false');
    rows[1].click();
    fixture.detectChanges();
    expect(el.querySelectorAll('.acc-panel.open').length).toBe(0);
  });

  it('highlights no child when no child route is current, shows login CTA when logged out', () => {
    const { fixture, cmp, el } = mobile();
    cmp.openMenu();
    fixture.detectChanges();
    expect(el.querySelectorAll('.acc-children a.current').length).toBe(0);
    expect(el.querySelector('.drawer-login')).not.toBeNull();
    expect(el.querySelector('.drawer-user .avatar')).toBeNull();
  });

  it('shows the user block when logged in', () => {
    TestBed.configureTestingModule({ imports: [PortalHeaderComponent], providers: [provideRouter([])] });
    TestBed.inject(AuthService).loginById('u-public');
    const fixture = TestBed.createComponent(PortalHeaderComponent);
    fixture.componentInstance.desktop.set(false);
    fixture.detectChanges();
    const el = fixture.nativeElement as HTMLElement;
    expect(el.querySelector('.drawer-user .du-text strong')?.textContent?.trim()).toBe('Nguyễn Minh Anh');
    expect(el.querySelector('.drawer-user a[href="/portal/cau-hoi-cua-toi"]')).not.toBeNull();
  });
});
