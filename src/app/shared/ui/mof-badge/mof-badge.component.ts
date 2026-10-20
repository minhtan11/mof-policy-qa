import { ChangeDetectionStrategy, Component, input } from '@angular/core';

@Component({
  selector: 'app-mof-badge',
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './mof-badge.component.html',
  styleUrl: './mof-badge.component.scss',
})
export class MofBadgeComponent {
  readonly label = input.required<string>();
  readonly tone = input<'info' | 'success' | 'warn' | 'neutral'>('info');
}
