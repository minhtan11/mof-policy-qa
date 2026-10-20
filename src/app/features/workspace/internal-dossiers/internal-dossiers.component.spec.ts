import { TestBed } from '@angular/core/testing';
import { provideRouter, Router } from '@angular/router';
import { AuthService } from '../../../core/auth/auth.service';
import { InternalDossiersComponent } from './internal-dossiers.component';

describe('InternalDossiersComponent OPS-LIST', () => {
  beforeEach(async () => {
    localStorage.clear();
    await TestBed.configureTestingModule({
      imports: [InternalDossiersComponent],
      providers: [provideRouter([{ path: '**', component: InternalDossiersComponent }])],
    }).compileComponents();
  });

  it('leader thấy tiêu đề và danh sách theo phạm vi', () => {
    TestBed.inject(AuthService).loginAs('leader');
    const f = TestBed.createComponent(InternalDossiersComponent);
    f.detectChanges();
    const el = f.nativeElement as HTMLElement;
    expect(el.querySelector('#int-title')).toBeTruthy();
    expect(f.componentInstance.repo.kpi().all).toBeGreaterThan(0);
  });

  it('setTab gọi navigate với query filter', () => {
    TestBed.inject(AuthService).loginAs('leader');
    const router = TestBed.inject(Router);
    const spy = vi.spyOn(router, 'navigate').mockResolvedValue(true);
    const f = TestBed.createComponent(InternalDossiersComponent);
    f.detectChanges();
    f.componentInstance.setTab('processing');
    expect(spy).toHaveBeenCalled();
    const args = spy.mock.calls.at(-1)!;
    expect(args[1]?.queryParams).toEqual(expect.objectContaining({ filter: 'processing' }));
  });
});

