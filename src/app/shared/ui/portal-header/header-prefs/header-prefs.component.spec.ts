import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { HeaderPrefsComponent } from './header-prefs.component';
import { ThemeService } from '../../../../core/theme/theme.service';

/** Nhãn switch giao diện đổi sáng ↔ tối theo theme hiện tại (header portal/workspace). */
describe('HeaderPrefsComponent (theme label)', () => {
  beforeEach(() => localStorage.clear());
  afterEach(() => localStorage.clear());

  function setup() {
    TestBed.configureTestingModule({
      imports: [HeaderPrefsComponent],
      providers: [provideRouter([])],
    });
    const theme = TestBed.inject(ThemeService);
    theme.set('light');
    const fixture = TestBed.createComponent(HeaderPrefsComponent);
    fixture.detectChanges();
    return { theme, fixture, el: fixture.nativeElement as HTMLElement };
  }

  it('shows light-mode label when theme is light, then dark-mode after toggle', () => {
    const { theme, fixture, el } = setup();
    const pref = el.querySelector('.pref')!;
    expect(pref.textContent).toContain('Giao diện sáng');
    expect(pref.textContent).not.toContain('Giao diện tối');

    theme.toggle();
    fixture.detectChanges();
    expect(pref.textContent).toContain('Giao diện tối');
    expect(pref.textContent).not.toContain('Giao diện sáng');
  });
});
