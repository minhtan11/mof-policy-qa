import { TestBed } from '@angular/core/testing';
import { Router, provideRouter } from '@angular/router';
import { HeaderSearchComponent } from './header-search.component';

describe('HeaderSearchComponent', () => {
  it('opens with Ctrl+K, submits to /portal/tra-cuu?q= and closes on Esc', () => {
    TestBed.configureTestingModule({ imports: [HeaderSearchComponent], providers: [provideRouter([])] });
    const f = TestBed.createComponent(HeaderSearchComponent);
    const nav = vi.spyOn(TestBed.inject(Router), 'navigate').mockResolvedValue(true);
    f.detectChanges();
    document.dispatchEvent(new KeyboardEvent('keydown', { key: 'k', ctrlKey: true }));
    f.detectChanges();
    expect(f.nativeElement.querySelector('[role="dialog"]')).not.toBeNull();
    f.componentInstance.keyword.set('hoàn thuế');
    f.componentInstance.submit();
    expect(nav).toHaveBeenCalledWith(['/portal/tra-cuu'], { queryParams: { q: 'hoàn thuế' } });
    f.componentInstance.show();
    f.detectChanges();
    f.componentInstance.onKey(new KeyboardEvent('keydown', { key: 'Escape' }));
    f.detectChanges();
    expect(f.nativeElement.querySelector('[role="dialog"]')).toBeNull();
  });
});
