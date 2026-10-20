import { ChangeDetectionStrategy, Component, forwardRef, input, signal } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';

@Component({
  selector: 'app-mof-checkbox',
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => MofCheckboxComponent),
      multi: true,
    },
  ],
  templateUrl: './mof-checkbox.component.html',
  styleUrl: './mof-checkbox.component.scss',
})
export class MofCheckboxComponent implements ControlValueAccessor {
  readonly id = input('');
  readonly label = input('');

  readonly checked = signal(false);
  private onChange: (value: boolean) => void = () => undefined;
  private onTouched: () => void = () => undefined;
  disabled = false;

  writeValue(value: boolean | null): void {
    this.checked.set(!!value);
  }

  registerOnChange(fn: (value: boolean) => void): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    this.disabled = isDisabled;
  }

  onNativeChange(event: Event): void {
    if (this.disabled) {
      return;
    }
    const next = (event.target as HTMLInputElement).checked;
    this.checked.set(next);
    this.onChange(next);
    this.markTouched();
  }

  markTouched(): void {
    this.onTouched();
  }
}
