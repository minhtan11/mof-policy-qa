import { ChangeDetectionStrategy, Component, ElementRef, forwardRef, input, signal, viewChild } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import { MofButtonComponent } from '../mof-button/mof-button.component';
import { MofFiIconComponent } from '../mof-fi-icon/mof-fi-icon.component';
import { MofIconComponent } from '../mof-icon/mof-icon.component';

@Component({
  selector: 'app-mof-file-upload',
  imports: [MofButtonComponent, MofFiIconComponent, MofIconComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => MofFileUploadComponent),
      multi: true,
    },
  ],
  templateUrl: './mof-file-upload.component.html',
  styleUrl: './mof-file-upload.component.scss',
})
export class MofFileUploadComponent implements ControlValueAccessor {
  readonly id = input('');
  readonly buttonLabel = input('Upload');
  readonly hint = input('');
  readonly accept = input('.pdf,.doc,.docx,.png,.jpg,.jpeg');
  readonly multiple = input(true);

  private readonly fileInput = viewChild<ElementRef<HTMLInputElement>>('fileInput');
  readonly files = signal<string[]>([]);
  private onChange: (value: string[]) => void = () => undefined;
  private onTouched: () => void = () => undefined;
  disabled = false;

  writeValue(value: string[] | null): void {
    this.files.set(value ?? []);
  }

  registerOnChange(fn: (value: string[]) => void): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    this.disabled = isDisabled;
  }

  openPicker(): void {
    if (this.disabled) {
      return;
    }
    this.fileInput()?.nativeElement.click();
  }

  onFilesSelected(event: Event): void {
    const inputEl = event.target as HTMLInputElement;
    const names = Array.from(inputEl.files ?? []).map((file) => file.name);
    const next = this.multiple() ? [...this.files(), ...names] : names.slice(0, 1);
    this.files.set(next);
    this.onChange(next);
    this.onTouched();
    inputEl.value = '';
  }

  remove(name: string): void {
    if (this.disabled) {
      return;
    }
    const next = this.files().filter((item) => item !== name);
    this.files.set(next);
    this.onChange(next);
    this.onTouched();
  }
}
