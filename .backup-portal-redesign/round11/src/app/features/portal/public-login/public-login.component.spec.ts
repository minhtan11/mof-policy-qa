import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { PublicLoginComponent } from './public-login.component';

/** UC-1..UC-8 — PUB-login acceptance: validation trước khi đăng nhập, đổi loại tài khoản. */
describe('PublicLoginComponent', () => {
  function setup() {
    TestBed.configureTestingModule({ imports: [PublicLoginComponent], providers: [provideRouter([])] });
    const fixture = TestBed.createComponent(PublicLoginComponent);
    fixture.detectChanges();
    return { fixture, cmp: fixture.componentInstance };
  }

  it('blocks submit and shows i18n errors when empty', () => {
    const { cmp } = setup();
    cmp.login();
    expect(cmp.loading()).toBe(false);
    expect(cmp.errorOf('identifier')).toBe('login.errIdentifierRequired');
    expect(cmp.errorOf('password')).toBe('login.errPasswordRequired');
  });

  it('flags short password and starts loading when valid', () => {
    const { cmp } = setup();
    cmp.form.setValue({ identifier: 'dan@example.vn', password: '123', remember: true });
    cmp.login();
    expect(cmp.errorOf('password')).toBe('login.errPasswordShort');
    cmp.form.controls.password.setValue('123456');
    cmp.login();
    expect(cmp.loading()).toBe(true);
  });

  it('reserves error slots so showing errors does not add/remove elements', () => {
    const { fixture, cmp } = setup();
    const before = fixture.nativeElement.querySelectorAll('app-mof-field-error').length;
    cmp.login();
    fixture.detectChanges();
    const slots = fixture.nativeElement.querySelectorAll('app-mof-field-error');
    expect(before).toBe(2);
    expect(slots.length).toBe(2);
    expect(fixture.nativeElement.querySelectorAll('.mof-field-error.visible').length).toBe(2);
  });

  it('switches account type', () => {
    const { cmp } = setup();
    cmp.accountType.set('business');
    expect(cmp.accountType()).toBe('business');
  });
});
