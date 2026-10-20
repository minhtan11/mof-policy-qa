import { ChangeDetectionStrategy, Component, computed, forwardRef, input, signal } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import { TranslatePipe } from '../../../core/i18n/translate.pipe';
import { MofFiIconComponent } from '../mof-fi-icon/mof-fi-icon.component';

/**
 * Input dùng chung. Bổ sung (tương thích ngược): `prefixIcon` (Flaticon UIcons), `revealable` cho mật khẩu
 * (nút hiện/ẩn có aria), `autocomplete`, `invalid` (viền lỗi + aria-invalid).
 */
@Component({
  selector: 'app-mof-input',
  imports: [TranslatePipe, MofFiIconComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [{ provide: NG_VALUE_ACCESSOR, useExisting: forwardRef(() => MofInputComponent), multi: true }],
  templateUrl: './mof-input.component.html',
  styleUrl: './mof-input.component.scss',
})
export class MofInputComponent implements ControlValueAccessor {
  readonly id = input<string>('');
  readonly type = input<'text' | 'email' | 'password' | 'search'>('text');
  readonly placeholder = input('');
  readonly disabledInput = input(false, { alias: 'disabled' });
  readonly prefixIcon = input<string | null>(null);
  readonly revealable = input(false);
  readonly autocomplete = input<string | null>(null);
  readonly invalid = input(false);
  readonly describedBy = input<string | null>(null);

  readonly value = signal('');
  readonly revealed = signal(false);
  readonly effectiveType = computed(() => (this.type() === 'password' && this.revealed() ? 'text' : this.type()));
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

  toggleReveal(): void {
    this.revealed.update((v) => !v);
  }

  markTouched(): void {
    this.onTouched();
  }
}
