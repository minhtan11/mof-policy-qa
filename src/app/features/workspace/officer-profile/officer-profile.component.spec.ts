import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { AuthService } from '../../../core/auth/auth.service';
import { maskEmail, OfficerProfileComponent } from './officer-profile.component';

describe('OfficerProfileComponent WS-PROF', () => {
  beforeEach(async () => {
    localStorage.clear();
    await TestBed.configureTestingModule({
      imports: [OfficerProfileComponent],
      providers: [provideRouter([{ path: '**', component: OfficerProfileComponent }])],
    }).compileComponents();
  });

  it('che email và lưu tùy chọn 2FA/chữ ký', () => {
    expect(maskEmail('ngoc.db@mof.gov.vn')).toBe('ng***@mof.gov.vn');
    TestBed.inject(AuthService).loginAs('specialist');
    const f = TestBed.createComponent(OfficerProfileComponent);
    f.detectChanges();
    expect((f.nativeElement as HTMLElement).querySelector('#prof-title')).toBeTruthy();
    f.componentInstance.form.patchValue({ twoFa: true, signaturePrefs: true });
    f.componentInstance.save();
    expect(localStorage.getItem('mof-policy-qa.officer-profile.v1')).toContain('"twoFa":true');
  });
});
