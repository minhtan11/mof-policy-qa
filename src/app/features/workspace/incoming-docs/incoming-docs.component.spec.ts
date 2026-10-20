import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { AuthService } from '../../../core/auth/auth.service';
import { IncomingDocsComponent } from './incoming-docs.component';

describe('IncomingDocsComponent WS-IN', () => {
  beforeEach(async () => {
    localStorage.clear();
    await TestBed.configureTestingModule({
      imports: [IncomingDocsComponent],
      providers: [provideRouter([{ path: '**', component: IncomingDocsComponent }])],
    }).compileComponents();
  });

  it('hiển thị sổ văn bản đến từ fixture', () => {
    TestBed.inject(AuthService).loginAs('reception');
    const f = TestBed.createComponent(IncomingDocsComponent);
    f.detectChanges();
    expect((f.nativeElement as HTMLElement).querySelector('#in-title')).toBeTruthy();
    expect(f.componentInstance.repo.counts().all).toBeGreaterThanOrEqual(4);
  });
});
