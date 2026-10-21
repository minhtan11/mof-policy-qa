import { Component, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { MofDatePickerComponent, formatDisplay, parseAny, parseDisplay, toIso } from './mof-date-picker.component';

@Component({
  imports: [ReactiveFormsModule, MofDatePickerComponent],
  template: `<app-mof-date-picker [formControl]="ctrl" [min]="min()" />`,
})
class HostComponent {
  readonly ctrl = new FormControl('2026-10-15', { nonNullable: true });
  readonly min = signal<string | null>(null);
}

describe('MofDatePickerComponent', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({ imports: [HostComponent] }).compileComponents();
  });

  function setup() {
    const fixture = TestBed.createComponent(HostComponent);
    fixture.detectChanges();
    const el: HTMLElement = fixture.nativeElement;
    const segs = () => Array.from(el.querySelectorAll<HTMLInputElement>('input.seg'));
    const key = (i: number, k: string) => {
      segs()[i].dispatchEvent(new KeyboardEvent('keydown', { key: k, bubbles: true, cancelable: true }));
      fixture.detectChanges();
    };
    const type = (i: number, text: string) => [...text].forEach((ch) => key(i, ch));
    return { fixture, el, segs, key, type };
  }

  it('parses and formats dd/MM/yyyy and paste formats', () => {
    expect(parseDisplay('5/3/2026')).toBe('2026-03-05');
    expect(parseDisplay('31/02/2026')).toBeNull();
    expect(parseDisplay('abc')).toBeNull();
    expect(formatDisplay('2026-10-15')).toBe('15/10/2026');
    expect(parseAny('2026-10-16')).toBe('2026-10-16');
    expect(parseAny('16-10-26')).toBe('2026-10-16');
  });

  it('shows the value in 3 segments with dd/mm/yyyy placeholders', () => {
    const { segs } = setup();
    expect(segs().map((s) => s.value)).toEqual(['15', '10', '2026']);
    expect(segs().map((s) => s.placeholder)).toEqual(['dd', 'mm', 'yyyy']);
  });

  it('typing digits auto-advances day -> month -> year and emits ISO', () => {
    const { fixture, segs, key, type } = setup();
    key(0, 'Delete');
    key(1, 'Delete');
    key(2, 'Delete');
    type(0, '01');
    expect(document.activeElement).toBe(segs()[1]);
    type(1, '11');
    expect(document.activeElement).toBe(segs()[2]);
    type(2, '2026');
    expect(fixture.componentInstance.ctrl.value).toBe('2026-11-01');
  });

  it('auto-pads a day 4-9 / month 2-9 and "/" advances', () => {
    const { fixture, segs, key, type } = setup();
    type(0, '5');
    expect(segs()[0].value).toBe('05');
    expect(document.activeElement).toBe(segs()[1]);
    type(1, '1');
    key(1, '/');
    expect(segs()[1].value).toBe('01');
    expect(document.activeElement).toBe(segs()[2]);
    type(2, '2027');
    expect(fixture.componentInstance.ctrl.value).toBe('2027-01-05');
  });

  it('invalid complete date shows error and keeps the previous model value', () => {
    const { fixture, el, key, type } = setup();
    key(0, 'Delete');
    key(1, 'Delete');
    key(2, 'Delete');
    type(0, '31');
    type(1, '02');
    type(2, '2026');
    expect(fixture.componentInstance.ctrl.value).toBe('2026-10-15');
    expect(el.querySelector('.mdp')!.classList).toContain('is-invalid');
  });

  it('backspace on an empty segment moves back; arrows step values', () => {
    const { segs, key } = setup();
    segs()[1].focus();
    key(1, 'Backspace');
    key(1, 'Backspace');
    expect(segs()[1].value).toBe('');
    key(1, 'Backspace');
    expect(document.activeElement).toBe(segs()[0]);
    expect(segs()[0].value).toBe('1');
    key(2, 'ArrowUp');
    expect(segs()[2].value).toBe('2027');
  });

  it('paste of a full date fills all segments', () => {
    const { fixture, el, segs } = setup();
    const ev = new Event('paste', { bubbles: true, cancelable: true }) as ClipboardEvent;
    Object.defineProperty(ev, 'clipboardData', { value: { getData: () => '16/10/2026' } });
    el.querySelector('.mof-field')!.dispatchEvent(ev);
    fixture.detectChanges();
    expect(segs().map((s) => s.value)).toEqual(['16', '10', '2026']);
    expect(fixture.componentInstance.ctrl.value).toBe('2026-10-16');
  });
  it('opens the calendar, picks a day and closes', () => {
    const { fixture, el } = setup();
    (el.querySelector('.trigger') as HTMLButtonElement).click();
    fixture.detectChanges();
    expect(el.querySelector('.panel')).toBeTruthy();
    const day = el.querySelector('[aria-label="2026-10-20"]') as HTMLButtonElement;
    day.click();
    fixture.detectChanges();
    expect(fixture.componentInstance.ctrl.value).toBe('2026-10-20');
    expect(el.querySelector('.panel')).toBeNull();
  });

  it('disables days before min and Clear empties the value', () => {
    const { fixture, el } = setup();
    fixture.componentInstance.min.set('2026-10-10');
    fixture.detectChanges();
    (el.querySelector('.trigger') as HTMLButtonElement).click();
    fixture.detectChanges();
    expect((el.querySelector('[aria-label="2026-10-09"]') as HTMLButtonElement).disabled).toBe(true);
    (el.querySelector('.foot .muted') as HTMLButtonElement).click();
    fixture.detectChanges();
    expect(fixture.componentInstance.ctrl.value).toBe('');
  });

  it('Escape closes the panel and arrow keys move focus', () => {
    const { fixture, el } = setup();
    const cmp = fixture.debugElement.children[0].componentInstance as MofDatePickerComponent;
    cmp.show();
    fixture.detectChanges();
    const grid = el.querySelector('.grid') as HTMLElement;
    grid.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowRight' }));
    expect(cmp.focused()).toBe('2026-10-16');
    grid.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowDown' }));
    expect(cmp.focused()).toBe('2026-10-23');
    grid.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }));
    fixture.detectChanges();
    expect(el.querySelector('.panel')).toBeNull();
    expect(toIso(new Date(2026, 0, 5))).toBe('2026-01-05');
  });
});