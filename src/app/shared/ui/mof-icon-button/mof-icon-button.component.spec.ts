import { TestBed } from '@angular/core/testing';
import { Component } from '@angular/core';
import { MofIconButtonComponent } from './mof-icon-button.component';

@Component({ imports: [MofIconButtonComponent], template: '<app-mof-icon-button icon="close" label="Xóa" size="sm" variant="danger" />' })
class HostComponent {}

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
});
