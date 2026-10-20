import { TestBed } from '@angular/core/testing';
import { provideRouter, Router } from '@angular/router';
import { AuthService } from '../../../core/auth/auth.service';
import { MyDossiersComponent } from './my-dossiers.component';

describe('MyDossiersComponent EXP-01', () => {
  beforeEach(async () => {
    localStorage.clear();
    await TestBed.configureTestingModule({
      imports: [MyDossiersComponent],
      providers: [provideRouter([{ path: '**', component: MyDossiersComponent }])],
    }).compileComponents();
  });

  it('specialist thấy tiêu đề và KPI theo hồ sơ được giao', () => {
    TestBed.inject(AuthService).loginAs('specialist');
    const f = TestBed.createComponent(MyDossiersComponent);
    f.detectChanges();
    const el = f.nativeElement as HTMLElement;
    expect(el.querySelector('#my-title')).toBeTruthy();
    expect(f.componentInstance.repo.counts().all).toBeGreaterThan(0);
  });

  it('setTab gọi navigate với query sla', async () => {
    TestBed.inject(AuthService).loginAs('specialist');
    const router = TestBed.inject(Router);
    const spy = vi.spyOn(router, 'navigate').mockResolvedValue(true);
    const f = TestBed.createComponent(MyDossiersComponent);
    f.detectChanges();
    f.componentInstance.setTab('overdue');
    expect(spy).toHaveBeenCalled();
    const args = spy.mock.calls.at(-1)!;
    expect(args[1]?.queryParams).toEqual(expect.objectContaining({ sla: 'overdue' }));
  });

  it('togglePin đổi active trên nút ghim', () => {
    TestBed.inject(AuthService).loginAs('specialist');
    const f = TestBed.createComponent(MyDossiersComponent);
    f.detectChanges();
    const row = f.componentInstance.pageRows()[0];
    expect(row).toBeTruthy();
    expect(f.componentInstance.repo.isPinned(row.id)).toBe(false);
    f.componentInstance.togglePin(row, new Event('click'));
    f.detectChanges();
    expect(f.componentInstance.repo.isPinned(row.id)).toBe(true);
    const btn = f.nativeElement.querySelector('.pin-col button') as HTMLButtonElement;
    expect(btn.classList.contains('is-active')).toBe(true);
    expect(btn.getAttribute('aria-pressed')).toBe('true');
  });

  it('bọc bảng + pagination trong mof-data-table', () => {
    TestBed.inject(AuthService).loginAs('specialist');
    const f = TestBed.createComponent(MyDossiersComponent);
    f.detectChanges();
    const el = f.nativeElement as HTMLElement;
    expect(el.querySelector('app-mof-data-table')).toBeTruthy();
    expect(el.querySelector('.mof-dt__scroll table.mof-tbl')).toBeTruthy();
    expect(el.querySelector('.mof-dt__foot app-mof-pagination')).toBeTruthy();
  });
});

