import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { AuthService } from '../../../core/auth/auth.service';
import { WorkspaceReportsComponent } from './reports.component';

describe('WorkspaceReportsComponent DASH-RPT', () => {
  beforeEach(async () => {
    localStorage.clear();
    await TestBed.configureTestingModule({
      imports: [WorkspaceReportsComponent],
      providers: [provideRouter([{ path: '**', component: WorkspaceReportsComponent }])],
    }).compileComponents();
  });

  it('leader sinh được báo cáo và có chart', () => {
    TestBed.inject(AuthService).loginAs('leader');
    const f = TestBed.createComponent(WorkspaceReportsComponent);
    f.detectChanges();
    const el = f.nativeElement as HTMLElement;
    expect(el.querySelector('#rpt-title')).toBeTruthy();
    expect(f.componentInstance.reports.definitions.length).toBe(16);
    f.componentInstance.generateReport();
    expect(f.componentInstance.reportResult()).toBeTruthy();
    expect(f.componentInstance.reportChart()?.series?.length).toBe(1);
  });
});
