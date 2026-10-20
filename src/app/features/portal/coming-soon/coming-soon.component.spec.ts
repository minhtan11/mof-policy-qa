import { TestBed } from '@angular/core/testing';
import { Router, provideRouter } from '@angular/router';
import { RouterTestingHarness } from '@angular/router/testing';
import { ComingSoonComponent } from './coming-soon.component';
import { routes } from '../../../app.routes';
import { AuthService } from '../../../core/auth/auth.service';
import { DEMO_DEFAULT_PASSWORD } from '../../../core/mock-api/auth-credentials';

/** PUB-soon / WS-soon — trang Sắp ra mắt đọc titleKey/icon/bodyKey/shell từ route data. */
describe('ComingSoonComponent', () => {
  afterEach(() => localStorage.clear());

  it('portal: renders title/body from route data with portal links', () => {
    TestBed.configureTestingModule({ imports: [ComingSoonComponent], providers: [provideRouter([])] });
    const f = TestBed.createComponent(ComingSoonComponent);
    f.detectChanges();
    const el: HTMLElement = f.nativeElement;
    expect(f.componentInstance.titleKey()).toBe('comingSoon.title');
    expect(f.componentInstance.workspace()).toBe(false);
    expect(el.querySelector('app-portal-header')).not.toBeNull();
    expect(el.querySelector('.panel .badge')?.textContent).toContain('Sắp ra mắt');
    expect(el.querySelector('.panel .lead')?.textContent).toContain('Tính năng đang được xây dựng');
    expect(el.querySelector('a[href="/portal"]')).not.toBeNull();
  });

  it('workspace: a sidebar coming-soon route shows that feature name, icon, description and back buttons', async () => {
    TestBed.configureTestingModule({ providers: [provideRouter(routes)] });
    TestBed.inject(AuthService).loginWithCredentials('ha.tt', DEMO_DEFAULT_PASSWORD, false);
    const h = await RouterTestingHarness.create('/workspace/lich-lam-viec');
    const el = h.routeNativeElement as HTMLElement;
    h.detectChanges();
    expect(el.querySelector('app-workspace-shell')).not.toBeNull();
    expect(el.querySelector('.panel .f-title')?.textContent).toContain('Lịch làm việc');
    expect(TestBed.inject(Router).url).toBe('/workspace/lich-lam-viec');
    expect(el.querySelector('.panel .body')?.textContent).toContain('Lịch làm việc, cuộc họp');
    expect(el.querySelector('.panel a[href="/workspace"]')?.textContent).toContain('Về tổng quan');
    expect(el.querySelector('.panel .actions')?.textContent).toContain('Quay lại');
  });
});
