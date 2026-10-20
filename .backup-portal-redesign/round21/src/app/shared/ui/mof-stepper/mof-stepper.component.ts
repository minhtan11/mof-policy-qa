import { ChangeDetectionStrategy, Component, input } from '@angular/core';

export interface MofStepperStep {
  id: string;
  label: string;
}

@Component({
  selector: 'app-mof-stepper',
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './mof-stepper.component.html',
  styleUrl: './mof-stepper.component.scss',
})
export class MofStepperComponent {
  readonly steps = input.required<MofStepperStep[]>();
  /** 0-based active step index. */
  readonly activeIndex = input(0);
}
