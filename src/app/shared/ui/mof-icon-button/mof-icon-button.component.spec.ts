import { TestBed } from '@angular/core/testing';
import { Component, signal } from '@angular/core';
import { MofIconButtonComponent } from './mof-icon-button.component';

@Component({ imports: [MofIconButtonComponent], template: '<app-mof-icon-button icon="close" label="Xóa" size="sm" variant="danger" />' })
class HostComponent {}

@Component({
  imports: [MofIconButtonComponent],
  template: `<app-mof-icon-button fi="thumbtack" label="Ghim" size="sm" [active]="on()" />`,
})
class ActiveHostComponent {
  readonly on = signal(false);
}

describe('MofIconButtonComponent', () => {
  it('renders a labelled square icon button', () => {
    const f = TestBed.createComponent(HostComponent);
    f.detectChanges();
    const b = f.nativeElement.querySelector('button') as HTMLButtonElement;
    expect(b.getAttribute('aria-label')).toBe('Xóa');
    expect(b.classList).toContain('is-sm');
    expect(b.classList).toContain('is-danger');
    expect(b.querySelector('app-mof-icon')).not.toBeNull();
  });

  it('active bật is-active + aria-pressed trên nút', () => {
    const f = TestBed.createComponent(ActiveHostComponent);
    f.detectChanges();
    const b = () => f.nativeElement.querySelector('button') as HTMLButtonElement;
    expect(b().classList.contains('is-active')).toBe(false);
    expect(b().getAttribute('aria-pressed')).toBeNull();
    f.componentInstance.on.set(true);
    f.detectChanges();
    expect(b().classList.contains('is-active')).toBe(true);
    expect(b().getAttribute('aria-pressed')).toBe('true');
  });
});
