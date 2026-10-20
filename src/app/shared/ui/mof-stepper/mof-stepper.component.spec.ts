import { Component, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { MofStepperComponent, MofStepperStep } from './mof-stepper.component';

@Component({
  imports: [MofStepperComponent],
  template: '<app-mof-stepper [steps]="steps" [activeIndex]="active()" [completed]="done()" (stepSelect)="picked = $event" />',
})
class HostComponent {
  steps: MofStepperStep[] = [{ id: 'a', label: 'A' }, { id: 'b', label: 'B' }, { id: 'c', label: 'C' }];
  active = signal(1);
  done = signal<number[] | null>([0]);
  picked = -1;
}

describe('MofStepperComponent', () => {
  it('marks current with aria-current, done with a check, emits on click and moves focus with arrows', () => {
    const f = TestBed.createComponent(HostComponent);
    f.detectChanges();
    const btns = f.nativeElement.querySelectorAll('button') as NodeListOf<HTMLButtonElement>;
    expect(btns[1].getAttribute('aria-current')).toBe('step');
    expect(btns[0].querySelector('svg.check path')?.getAttribute('d')).toBe('M5 12.5l4.5 4.5L19 7.5');
    expect(btns[2].querySelector('svg.check')).toBeNull();
    btns[2].click();
    expect(f.componentInstance.picked).toBe(2);
    btns[1].dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowLeft', bubbles: true }));
    expect(document.activeElement).toBe(btns[0]);
  });
});
