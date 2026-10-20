import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { AuthService } from '../../../core/auth/auth.service';
import { DataStoreComponent } from './data-store.component';

describe('DataStoreComponent WS-DS', () => {
  beforeEach(async () => {
    localStorage.clear();
    await TestBed.configureTestingModule({
      imports: [DataStoreComponent],
      providers: [provideRouter([{ path: '**', component: DataStoreComponent }])],
    }).compileComponents();
  });

  it('hiển thị thống kê kho dữ liệu và backup', () => {
    TestBed.inject(AuthService).loginAs('leader');
    const f = TestBed.createComponent(DataStoreComponent);
    f.detectChanges();
    expect((f.nativeElement as HTMLElement).querySelector('#ds-title')).toBeTruthy();
    expect(f.componentInstance.health().dossierTotal).toBeGreaterThan(0);
    expect(f.componentInstance.ops.backups().length).toBeGreaterThan(0);
  });
});
