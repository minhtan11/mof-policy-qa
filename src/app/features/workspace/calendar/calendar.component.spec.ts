import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { AuthService } from '../../../core/auth/auth.service';
import { WorkspaceCalendarComponent } from './calendar.component';

describe('WorkspaceCalendarComponent WS-CAL', () => {
  beforeEach(async () => {
    localStorage.clear();
    await TestBed.configureTestingModule({
      imports: [WorkspaceCalendarComponent],
      providers: [provideRouter([{ path: '**', component: WorkspaceCalendarComponent }])],
    }).compileComponents();
  });

  it('hiển thị lịch SLA theo tháng và có hồ sơ đến hạn', () => {
    TestBed.inject(AuthService).loginAs('specialist');
    const f = TestBed.createComponent(WorkspaceCalendarComponent);
    f.detectChanges();
    const el = f.nativeElement as HTMLElement;
    expect(el.querySelector('#cal-title')).toBeTruthy();
    expect(f.componentInstance.repo.months().length).toBeGreaterThan(0);
    f.componentInstance.onMonth(f.componentInstance.repo.months()[0]);
    f.detectChanges();
    expect(f.componentInstance.rows().length).toBeGreaterThan(0);
  });
});
