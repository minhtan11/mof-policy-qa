import { Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { PortalHeaderComponent } from './portal-header.component';
import { AuthService } from '../../../core/auth/auth.service';

@Component({ standalone: true, template: '' })
class BlankPage {}

const PORTAL_NAV_ROUTES = [
  { path: 'portal/tra-cuu', component: BlankPage },
  { path: 'portal/huong-dan', component: BlankPage },
  { path: 'portal/van-ban', component: BlankPage },
];


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
    expect(el.querySelector('.login-btn')).not.toBeNull();
    expect(el.querySelector('.user-btn')).toBeNull();
    // Tuỳ chọn (giao diện, VI|EN) vẫn truy cập được khi chưa đăng nhập
    expect(el.querySelector('.settings app-header-prefs app-lang-switch')).not.toBeNull();
  });

  it('shows avatar initials + name with a menu, and logs out back to the login link', () => {
    const { auth, make } = setup();
    auth.loginById('u-public');
    const fixture = make();
    const el: HTMLElement = fixture.nativeElement;
    expect(el.querySelector('.login-btn')).toBeNull();
    expect(el.querySelector('.avatar')?.textContent?.trim()).toBe('MA');
    expect(el.querySelector('.user-name')?.textContent?.trim()).toBe('Nguyễn Minh Anh');

    const btn = el.querySelector<HTMLButtonElement>('.user-btn')!;
    btn.click();
    fixture.detectChanges();
    expect(btn.getAttribute('aria-expanded')).toBe('true');
    expect(el.querySelector('.user-dropdown a[href="/portal/cau-hoi-cua-toi"]')).not.toBeNull();
    // Công dân không thấy lối vào không gian làm việc
    expect(el.querySelector('.user-dropdown a[href="/workspace"]')).toBeNull();
    expect(el.querySelector('.user-dropdown a[href="/admin"]')).toBeNull();

    el.querySelector<HTMLButtonElement>('.user-dropdown .logout')!.click();
    fixture.detectChanges();
    expect(auth.user()).toBeNull();
    expect(localStorage.getItem('mof-policy-qa.session.v1')).toBeNull();
    expect(el.querySelector('.login-btn')).not.toBeNull();
  });

  it('shows workspace entry for internal officers and admin landing for system-admin', () => {
    const { auth, make } = setup();
    auth.loginAs('reception');
    let fixture = make();
    let el: HTMLElement = fixture.nativeElement;
    el.querySelector<HTMLButtonElement>('.user-btn')!.click();
    fixture.detectChanges();
    expect(el.querySelector('.user-dropdown a[href="/workspace"]')?.textContent).toContain('Không gian làm việc');

    auth.loginAs('system-admin');
    fixture = make();
    el = fixture.nativeElement;
    el.querySelector<HTMLButtonElement>('.user-btn')!.click();
    fixture.detectChanges();
    expect(el.querySelector('.user-dropdown a[href="/admin"]')?.textContent).toContain('Không gian làm việc');
    expect(el.querySelector('.user-dropdown a[href="/workspace"]')).toBeNull();
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

  it('puts the utilities chip row right under the drawer header', () => {
    const { el } = mobile();
    const drawer = el.querySelector('.drawer')!;
    expect(drawer.children[1].classList.contains('drawer-tools')).toBe(true);
    expect(drawer.querySelector('.drawer-tools app-lang-switch')).not.toBeNull();
    expect(drawer.querySelector('.drawer-foot')).toBeNull();
  });
});

/** Header 1 hàng: tìm kiếm, chuông, Tuỳ chọn trong menu, gom mục thừa vào "Thêm", chỉ một mục sáng. */
describe('PortalHeaderComponent (compact bar)', () => {
  beforeEach(() => localStorage.clear());

  function setup() {
    TestBed.configureTestingModule({
      imports: [PortalHeaderComponent],
      providers: [provideRouter(PORTAL_NAV_ROUTES)],
    });
    const auth = TestBed.inject(AuthService);
    return { auth, make: () => { const f = TestBed.createComponent(PortalHeaderComponent); f.detectChanges(); return f; } };
  }

  it('has a single compact row with search, bell and prefs inside the account menu', () => {
    const { auth, make } = setup();
    auth.loginById('u-public');
    const el: HTMLElement = make().nativeElement;
    expect(el.querySelector('.util-bar')).toBeNull();
    expect(el.querySelector('.brand-bar')).toBeNull();
    expect(el.querySelector('.bar app-header-search')).not.toBeNull();
    expect(el.querySelector('.bar app-header-notifications')).not.toBeNull();
    expect(el.querySelector('.user-dropdown app-header-prefs [role="switch"]')).not.toBeNull();
  });

  it('collapses overflowing nav items into "Thêm"', () => {
    const { make } = setup();
    const f = make();
    const cmp = f.componentInstance;
    cmp.visibleCount.set(4);
    f.detectChanges();
    const el: HTMLElement = f.nativeElement;
    expect(el.querySelectorAll('.nav-item.overflowed').length).toBe(cmp.navItems.length - 4);
    expect(el.querySelector('.nav-item.more')?.classList.contains('hidden')).toBe(false);
    expect(el.querySelectorAll('.nav-item.more .submenu a').length).toBe(cmp.navItems.length - 4);
  });

  it('marks at most one top-level item active', async () => {
    const { make } = setup();
    const f = make();
    const { Router } = await import('@angular/router');
    await TestBed.inject(Router).navigateByUrl('/portal/tra-cuu').catch(() => undefined);
    const cmp = f.componentInstance;
    expect(cmp.navItems.filter((n) => cmp.isActive(n)).length).toBeLessThanOrEqual(1);
  });

  it('on /portal/tra-cuu only highlights Dịch vụ công → Tra cứu (not Hướng dẫn / VBPL)', async () => {
    const { make } = setup();
    const f = make();
    const { Router } = await import('@angular/router');
    await TestBed.inject(Router).navigateByUrl('/portal/tra-cuu').catch(() => undefined);
    const cmp = f.componentInstance;
    const children = cmp.navItems.flatMap((n) => n.children ?? []);
    const current = children.filter((c) => cmp.isChildActive(c));
    expect(current.map((c) => c.key)).toEqual(['nav.search']);
    expect(cmp.isActive(cmp.navItems.find((n) => n.key === 'portal.nav.services')!)).toBe(true);
    expect(cmp.isActive(cmp.navItems.find((n) => n.key === 'portal.nav.about')!)).toBe(false);
    expect(cmp.isActive(cmp.navItems.find((n) => n.key === 'portal.nav.legal')!)).toBe(false);
  });

  it('on /portal/huong-dan only highlights Giới thiệu → Hướng dẫn', async () => {
    const { make } = setup();
    const f = make();
    const { Router } = await import('@angular/router');
    await TestBed.inject(Router).navigateByUrl('/portal/huong-dan').catch(() => undefined);
    const cmp = f.componentInstance;
    const current = cmp.navItems.flatMap((n) => n.children ?? []).filter((c) => cmp.isChildActive(c));
    expect(current.map((c) => c.key)).toEqual(['nav.guide']);
    expect(cmp.isActive(cmp.navItems.find((n) => n.key === 'portal.nav.about')!)).toBe(true);
    expect(cmp.isActive(cmp.navItems.find((n) => n.key === 'portal.nav.legal')!)).toBe(false);
    expect(cmp.isActive(cmp.navItems.find((n) => n.key === 'portal.nav.services')!)).toBe(false);
  });

  it('on /portal/van-ban only highlights Văn bản pháp luật', async () => {
    const { make } = setup();
    const f = make();
    const { Router } = await import('@angular/router');
    await TestBed.inject(Router).navigateByUrl('/portal/van-ban').catch(() => undefined);
    const cmp = f.componentInstance;
    const current = cmp.navItems.flatMap((n) => n.children ?? []).filter((c) => cmp.isChildActive(c));
    expect(current.map((c) => c.key)).toEqual(['portal.nav.legalLookup']);
    expect(cmp.isActive(cmp.navItems.find((n) => n.key === 'portal.nav.legal')!)).toBe(true);
    expect(cmp.isActive(cmp.navItems.find((n) => n.key === 'portal.nav.services')!)).toBe(false);
  });

  it('keeps only one desktop submenu open and closes it when opening user menu', () => {
    const { auth, make } = setup();
    auth.loginById('u-public');
    const f = make();
    const cmp = f.componentInstance;
    const el: HTMLElement = f.nativeElement;

    cmp.openNav('portal.nav.about');
    f.detectChanges();
    expect(cmp.openKey()).toBe('portal.nav.about');
    expect(el.querySelectorAll('.nav-item.open').length).toBe(1);

    cmp.openNav('portal.nav.services');
    f.detectChanges();
    expect(cmp.openKey()).toBe('portal.nav.services');
    expect(el.querySelectorAll('.nav-item.open').length).toBe(1);
    expect(el.querySelector('.nav-item.open')?.textContent).toContain('Dịch vụ');

    cmp.toggleUser();
    f.detectChanges();
    expect(cmp.userOpen()).toBe(true);
    expect(cmp.openKey()).toBeNull();
    expect(el.querySelectorAll('.nav-item.open').length).toBe(0);
  });
});

