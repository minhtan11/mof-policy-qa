import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { AuthService } from '../../../core/auth/auth.service';
import { CoopDossiersComponent } from './coop-dossiers.component';

describe('CoopDossiersComponent EXP-05-INBOX', () => {
  beforeEach(async () => {
    localStorage.clear();
    await TestBed.configureTestingModule({
      imports: [CoopDossiersComponent],
      providers: [provideRouter([{ path: '**', component: CoopDossiersComponent }])],
    }).compileComponents();
  });

  it('specialist thấy hộp phối hợp với yêu cầu mở từ seed', () => {
    TestBed.inject(AuthService).loginAs('specialist');
    const f = TestBed.createComponent(CoopDossiersComponent);
    f.detectChanges();
    const el = f.nativeElement as HTMLElement;
    expect(el.querySelector('#coop-title')).toBeTruthy();
    expect(f.componentInstance.repo.counts().open).toBeGreaterThanOrEqual(1);
  });
});
