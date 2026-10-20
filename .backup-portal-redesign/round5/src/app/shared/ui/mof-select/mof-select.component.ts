import { ChangeDetectionStrategy, Component, forwardRef, input, signal } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';

export interface MofSelectOption {
  label: string;
  value: string;
}

@Component({
  selector: 'app-mof-select',
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => MofSelectComponent),
      multi: true,
    },
  ],
  templateUrl: './mof-select.component.html',
  styleUrl: './mof-select.component.scss',
})
export class MofSelectComponent implements ControlValueAccessor {
  readonly id = input('');
  readonly options = input<MofSelectOption[]>([]);
  readonly placeholder = input('');

  readonly value = signal('');
  private onChange: (value: string) => void = () => undefined;
  private onTouched: () => void = () => undefined;
  disabled = false;

  writeValue(value: string | null): void {
    this.value.set(value ?? '');
  }

  registerOnChange(fn: (value: string) => void): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    this.disabled = isDisabled;
  }

  onSelect(event: Event): void {
    const next = (event.target as HTMLSelectElement).value;
    this.value.set(next);
    this.onChange(next);
  }

  markTouched(): void {
    this.onTouched();
  }
}
