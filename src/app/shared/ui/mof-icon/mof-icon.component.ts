import { ChangeDetectionStrategy, Component, input } from '@angular/core';

export type MofIconName =
  | 'search'
  | 'arrow-right'
  | 'arrow-left'
  | 'arrow-up-right'
  | 'send'
  | 'check'
  | 'plus'
  | 'sun'
  | 'moon'
  | 'globe'
  | 'briefcase'
  | 'building'
  | 'calendar'
  | 'clock'
  | 'info'
  | 'close'
  | 'inbox'
  | 'book'
  | 'cog'
  | 'menu'
  | 'chevron-left'
  | 'user'
  | 'sparkles';

@Component({
  selector: 'app-mof-icon',
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './mof-icon.component.html',
  styleUrl: './mof-icon.component.scss',
})
export class MofIconComponent {
  readonly name = input.required<MofIconName>();
  readonly size = input(18);
}
