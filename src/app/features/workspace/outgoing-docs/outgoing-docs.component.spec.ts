import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { AuthService } from '../../../core/auth/auth.service';
import { OutgoingDocsComponent } from './outgoing-docs.component';

describe('OutgoingDocsComponent WS-OUT', () => {
  beforeEach(async () => {
    localStorage.clear();
    await TestBed.configureTestingModule({
      imports: [OutgoingDocsComponent],
      providers: [provideRouter([{ path: '**', component: OutgoingDocsComponent }])],
    }).compileComponents();
  });

  it('liệt kê văn bản đi từ hồ sơ answered/published', () => {
    TestBed.inject(AuthService).loginAs('coordinator');
    const f = TestBed.createComponent(OutgoingDocsComponent);
    f.detectChanges();
    expect((f.nativeElement as HTMLElement).querySelector('#out-title')).toBeTruthy();
    expect(f.componentInstance.repo.counts().all).toBeGreaterThanOrEqual(1);
  });
});
