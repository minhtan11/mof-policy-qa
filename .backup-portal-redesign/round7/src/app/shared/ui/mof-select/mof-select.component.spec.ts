import { Component, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { MofSelectComponent, MofSelectOption } from './mof-select.component';

const OPTIONS: MofSelectOption[] = [
  { label: 'Đào tạo nội bộ', value: 'a' },
  { label: 'Giấy phép kinh doanh', value: 'b' },
  { label: 'Báo cáo đầu tư', value: 'c', disabled: true },
  { label: 'Đào tạo bên ngoài', value: 'd' },
];

@Component({
  imports: [MofSelectComponent, ReactiveFormsModule],
  template: '<app-mof-select [formControl]="ctrl" [options]="options" [searchable]="searchable()" />',
})
class HostComponent {
  readonly ctrl = new FormControl('b');
  readonly options = OPTIONS;
  readonly searchable = signal(true);
}

/** Shared UI — select dùng chung cho mọi form (AGENTS §3): CVA, lọc, bàn phím, disabled. */
describe('MofSelectComponent', () => {
  function setup() {
    const fixture = TestBed.createComponent(HostComponent);
    fixture.detectChanges();
    const trigger = fixture.nativeElement.querySelector('button[role="combobox"]') as HTMLButtonElement;
    const select = fixture.debugElement.children[0].componentInstance as MofSelectComponent;
    return { fixture, trigger, select, host: fixture.componentInstance };
  }

  const key = (el: Element, k: string) => el.dispatchEvent(new KeyboardEvent('keydown', { key: k, bubbles: true }));

  afterEach(() => document.querySelectorAll('.mof-select-panel').forEach((el) => el.remove()));

  it('writes the initial form value and shows its label', () => {
    const { trigger } = setup();
    expect(trigger.textContent).toContain('Giấy phép kinh doanh');
    expect(trigger.getAttribute('aria-expanded')).toBe('false');
  });

  it('filters options accent-insensitively and shows empty state', () => {
    const { fixture, select } = setup();
    select.openPanel();
    select.query.set('dao tao');
    fixture.detectChanges();
    expect(select.filtered().map((o) => o.value)).toEqual(['a', 'd']);
    select.query.set('zzz');
    fixture.detectChanges();
    expect(select.filtered().length).toBe(0);
    expect(document.body.querySelector('.mof-select-panel .empty')).not.toBeNull();
  });

  it('navigates with arrows, skips disabled, selects with Enter and updates the form control', () => {
    const { fixture, trigger, select, host } = setup();
    key(trigger, 'ArrowDown');
    fixture.detectChanges();
    expect(select.open()).toBe(true);
    expect(select.activeIndex()).toBe(1);
    key(trigger, 'ArrowDown');
    expect(select.activeIndex()).toBe(3);
    key(trigger, 'Enter');
    fixture.detectChanges();
    expect(host.ctrl.value).toBe('d');
    expect(select.open()).toBe(false);
  });

  it('closes on Escape without changing value', () => {
    const { fixture, trigger, select, host } = setup();
    trigger.click();
    fixture.detectChanges();
    key(trigger, 'Escape');
    expect(select.open()).toBe(false);
    expect(host.ctrl.value).toBe('b');
  });

  it('respects disabled state from the form control', () => {
    const { fixture, trigger, select, host } = setup();
    host.ctrl.disable();
    fixture.detectChanges();
    expect(trigger.disabled).toBe(true);
    select.openPanel();
    expect(select.open()).toBe(false);
  });
});
