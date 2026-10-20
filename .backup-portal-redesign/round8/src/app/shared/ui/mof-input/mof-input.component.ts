import { ChangeDetectionStrategy, Component, forwardRef, input, signal } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';

@Component({
  selector: 'app-mof-input',
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => MofInputComponent),
      multi: true,
    },
  ],
  templateUrl: './mof-input.component.html',
  styleUrl: './mof-input.component.scss',
})
export class MofInputComponent implements ControlValueAccessor {
  readonly id = input<string>('');
  readonly type = input<'text' | 'email' | 'password' | 'search'>('text');
  readonly placeholder = input('');
  readonly disabledInput = input(false, { alias: 'disabled' });

  readonly value = signal('');
  private onChange: (value: string) => void = () => undefined;
  private onTouched: () => void = () => undefined;
  private disabledFromForm = false;

  get isDisabled(): boolean {
    return this.disabledInput() || this.disabledFromForm;
  }

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
    this.disabledFromForm = isDisabled;
  }

  onInput(event: Event): void {
    const next = (event.target as HTMLInputElement).value;
    this.value.set(next);
    this.onChange(next);
  }

  markTouched(): void {
    this.onTouched();
  }
}
