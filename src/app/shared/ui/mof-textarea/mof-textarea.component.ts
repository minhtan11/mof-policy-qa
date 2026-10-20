import { ChangeDetectionStrategy, Component, forwardRef, input, signal } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';

@Component({
  selector: 'app-mof-textarea',
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => MofTextareaComponent),
      multi: true,
    },
  ],
  templateUrl: './mof-textarea.component.html',
  styleUrl: './mof-textarea.component.scss',
})
export class MofTextareaComponent implements ControlValueAccessor {
  readonly id = input('');
  readonly rows = input(5);
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

  onInput(event: Event): void {
    const next = (event.target as HTMLTextAreaElement).value;
    this.value.set(next);
    this.onChange(next);
  }

  markTouched(): void {
    this.onTouched();
  }
}
