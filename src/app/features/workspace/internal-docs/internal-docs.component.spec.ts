import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { AuthService } from '../../../core/auth/auth.service';
import { InternalDocsComponent } from './internal-docs.component';

describe('InternalDocsComponent WS-TPL', () => {
  beforeEach(async () => {
    localStorage.clear();
    await TestBed.configureTestingModule({
      imports: [InternalDocsComponent],
      providers: [provideRouter([{ path: '**', component: InternalDocsComponent }])],
    }).compileComponents();
  });

  it('liệt kê mẫu trả lời từ catalog', () => {
    TestBed.inject(AuthService).loginAs('specialist');
    const f = TestBed.createComponent(InternalDocsComponent);
    f.detectChanges();
    expect((f.nativeElement as HTMLElement).querySelector('#tpl-title')).toBeTruthy();
    expect(f.componentInstance.repo.counts().all).toBeGreaterThanOrEqual(3);
  });
});
