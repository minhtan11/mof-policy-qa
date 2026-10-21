import { ChangeDetectionStrategy, Component, ElementRef, forwardRef, input, output, signal, viewChild } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import { MofButtonComponent } from '../mof-button/mof-button.component';
import { MofFiIconComponent } from '../mof-fi-icon/mof-fi-icon.component';
import { MofIconButtonComponent } from '../mof-icon-button/mof-icon-button.component';
import { MofTooltipDirective } from '../mof-tooltip/mof-tooltip.directive';

/**
 * Vùng đính kèm dùng chung: dropzone viền đứt (kéo-thả) + nút "Chọn tệp"; chip tệp có icon theo loại, tên,
 * dung lượng, nút xóa (`app-mof-icon-button`). Giá trị CVA vẫn là `string[]` tên tệp (tương thích ngược);
 * dung lượng chỉ giữ nội bộ để hiển thị.
 */
@Component({
  selector: 'app-mof-file-upload',
  imports: [MofTooltipDirective, MofButtonComponent, MofFiIconComponent, MofIconButtonComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [{ provide: NG_VALUE_ACCESSOR, useExisting: forwardRef(() => MofFileUploadComponent), multi: true }],
  templateUrl: './mof-file-upload.component.html',
  styleUrl: './mof-file-upload.component.scss',
})
export class MofFileUploadComponent implements ControlValueAccessor {
  readonly id = input('');
  readonly buttonLabel = input('Upload');
  readonly hint = input('');
  readonly dropLabel = input('');
  /** Nhãn aria nút xóa; `{name}` được thay bằng tên tệp. */
  readonly removeLabel = input('Remove {name}');
  readonly accept = input('.pdf,.doc,.docx,.png,.jpg,.jpeg');
  readonly multiple = input(true);
  /** Dung lượng tối đa mỗi tệp (byte), mặc định 10 MB. */
  readonly maxSize = input(10 * 1024 * 1024);
  /** Tệp bị từ chối (sai loại / quá dung lượng) — cha hiển thị thông báo. */
  readonly rejected = output<{ name: string; reason: 'type' | 'size' }>();

  private readonly fileInput = viewChild<ElementRef<HTMLInputElement>>('fileInput');
  readonly files = signal<string[]>([]);
  readonly sizes = signal<Record<string, number>>({});
  readonly dragging = signal(false);
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
    if (!this.disabled) {
      this.fileInput()?.nativeElement.click();
    }
  }

  onFilesSelected(event: Event): void {
    const inputEl = event.target as HTMLInputElement;
    this.addFiles(Array.from(inputEl.files ?? []));
    inputEl.value = '';
  }

  onDragOver(e: DragEvent): void {
    e.preventDefault();
    if (!this.disabled) {
      this.dragging.set(true);
    }
  }

  onDragLeave(e: DragEvent): void {
    const to = e.relatedTarget as Node | null;
    if (!to || !(e.currentTarget as HTMLElement).contains(to)) {
      this.dragging.set(false);
    }
  }

  onDrop(e: DragEvent): void {
    e.preventDefault();
    this.dragging.set(false);
    if (!this.disabled) {
      this.addFiles(Array.from(e.dataTransfer?.files ?? []));
    }
  }

  addFiles(all: File[]): void {
    const exts = this.accept().split(',').map((x) => x.trim().toLowerCase()).filter(Boolean);
    const list = all.filter((f) => {
      const ext = '.' + (f.name.split('.').pop() ?? '').toLowerCase();
      if (exts.length && !exts.includes(ext)) {
        this.rejected.emit({ name: f.name, reason: 'type' });
        return false;
      }
      if (f.size > this.maxSize()) {
        this.rejected.emit({ name: f.name, reason: 'size' });
        return false;
      }
      return true;
    });
    if (!list.length) {
      return;
    }
    const names = list.map((f) => f.name);
    this.sizes.update((s) => ({ ...s, ...Object.fromEntries(list.map((f) => [f.name, f.size])) }));
    const merged = this.multiple() ? [...this.files(), ...names.filter((n) => !this.files().includes(n))] : names.slice(0, 1);
    this.files.set(merged);
    this.onChange(merged);
    this.onTouched();
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

  iconFor(name: string): string {
    const ext = name.split('.').pop()?.toLowerCase() ?? '';
    if (ext === 'pdf') return 'file-pdf';
    if (ext === 'doc' || ext === 'docx') return 'file-word';
    if (['png', 'jpg', 'jpeg', 'gif', 'webp'].includes(ext)) return 'picture';
    return 'document';
  }

  kind(name: string): string {
    return this.iconFor(name).replace('file-', '');
  }

  sizeLabel(name: string): string {
    const b = this.sizes()[name];
    if (b == null) return '';
    if (b < 1024) return `${b} B`;
    if (b < 1024 * 1024) return `${(b / 1024).toFixed(0)} KB`;
    return `${(b / 1024 / 1024).toFixed(1)} MB`;
  }

  removeAria(name: string): string {
    return this.removeLabel().replace('{name}', name);
  }
}
