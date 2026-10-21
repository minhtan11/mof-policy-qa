import { Component, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { MofFieldErrorComponent } from './mof-field-error.component';

@Component({ imports: [MofFieldErrorComponent], template: '<app-mof-field-error id="e1" [message]="msg()" />' })
class HostComponent {
  readonly msg = signal<string | null>(null);
}

/** Shared UI — ô lỗi form giữ chỗ cố định (không layout shift), AGENTS §4.5. */
describe('MofFieldErrorComponent', () => {
  it('keeps the slot in the DOM when there is no error and toggles visibility only', () => {
    const fixture = TestBed.createComponent(HostComponent);
    fixture.detectChanges();
    const p = fixture.nativeElement.querySelector('p.mof-field-error') as HTMLElement;
    expect(p).not.toBeNull();
    expect(p.classList.contains('visible')).toBe(false);
    expect(p.getAttribute('aria-hidden')).toBe('true');

    fixture.componentInstance.msg.set('Vui lòng nhập mật khẩu.');
    fixture.detectChanges();
    expect(p.classList.contains('visible')).toBe(true);
    expect(p.textContent?.trim()).toBe('Vui lòng nhập mật khẩu.');
    // Tooltip dùng chung (mofTooltip, chỉ khi bị cắt) thay title native.
    expect(p.hasAttribute('title')).toBe(false);

    fixture.componentInstance.msg.set(null);
    fixture.detectChanges();
    // Chữ cũ giữ lại khi fade-out; vẫn cùng phần tử → không thay đổi chiều cao.
    expect(fixture.nativeElement.querySelector('p.mof-field-error')).toBe(p);
    expect(p.classList.contains('visible')).toBe(false);
    expect(p.textContent?.trim()).toBe('Vui lòng nhập mật khẩu.');
  });
});
