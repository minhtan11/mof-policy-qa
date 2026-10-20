import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';

/** Flaticon UIcons wrapper — https://www.flaticon.com/uicons/interface-icons */
export type MofFiWeight = 'rr' | 'sr' | 'br';

@Component({
  selector: 'app-mof-fi-icon',
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './mof-fi-icon.component.html',
  styleUrl: './mof-fi-icon.component.scss',
})
export class MofFiIconComponent {
  /** Icon slug without prefix, e.g. `search`, `comments`, `book-open-cover`. */
  readonly name = input.required<string>();
  readonly weight = input<MofFiWeight>('rr');
  readonly iconClass = computed(() => `fi fi-${this.weight()}-${this.name()}`);
}
