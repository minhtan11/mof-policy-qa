import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  ElementRef,
  computed,
  effect,
  forwardRef,
  inject,
  input,
  signal,
  viewChild,
} from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import { TranslatePipe } from '../../../core/i18n/translate.pipe';
import { MofFiIconComponent } from '../mof-fi-icon/mof-fi-icon.component';
import { anchorFloating, AnchoredHandle } from '../../../core/overlay/floating';

export interface MofSelectOption {
  label: string;
  value: string;
  disabled?: boolean;
}

let nextId = 0;

/**
 * Select dùng chung (combobox + listbox) thay cho <select> native.
 * Panel neo vào wrapper position:relative qua core `anchorFloating`: mặc định absolute trong luồng
 * (cuộn native cùng trigger, không JS khi cuộn, flip chỉ tính lúc mở/resize). Nếu tổ tiên cắt overflow:
 * CSS Anchor Positioning, hoặc portal và tự đóng khi container cuộn → không bao giờ nhấp nhô. Giữ nguyên API cũ (id, options, placeholder) + CVA.
 */
@Component({
  selector: 'app-mof-select',
  imports: [TranslatePipe, MofFiIconComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [{ provide: NG_VALUE_ACCESSOR, useExisting: forwardRef(() => MofSelectComponent), multi: true }],
  templateUrl: './mof-select.component.html',
  styleUrl: './mof-select.component.scss',
  host: { '[class.is-sm]': "size() === 'sm'", '[class.is-open]': 'open()' },
})
export class MofSelectComponent implements ControlValueAccessor {
  readonly id = input('');
  readonly options = input<MofSelectOption[]>([]);
  /** Nếu rỗng dùng i18n `select.placeholder` ("Chọn..."). */
  readonly placeholder = input('');
  readonly label = input('');
  readonly searchable = input(false);
  readonly size = input<'sm' | 'md'>('md');
  readonly disabledInput = input(false, { alias: 'disabled' });

  readonly value = signal('');
  readonly open = signal(false);
  readonly query = signal('');
  readonly activeIndex = signal(-1);
  private formDisabled = signal(false);

  readonly uid = `mof-select-${++nextId}`;
  readonly listId = `${this.uid}-list`;
  readonly isDisabled = computed(() => this.disabledInput() || this.formDisabled());
  readonly selected = computed(() => this.options().find((o) => o.value === this.value()) ?? null);
  readonly filtered = computed(() => {
    const q = this.normalize(this.query());
    return q ? this.options().filter((o) => this.normalize(o.label).includes(q)) : this.options();
  });
  readonly activeId = computed(() => (this.activeIndex() >= 0 ? `${this.uid}-opt-${this.activeIndex()}` : null));

  /** Giữ tương thích code cũ đọc `disabled`. */
  get disabled(): boolean {
    return this.isDisabled();
  }

  private readonly host = inject<ElementRef<HTMLElement>>(ElementRef);
  private readonly trigger = viewChild.required<ElementRef<HTMLButtonElement>>('trigger');
  private readonly anchor = viewChild.required<ElementRef<HTMLElement>>('anchor');
  private readonly panel = viewChild<ElementRef<HTMLElement>>('panel');
  private readonly searchBox = viewChild<ElementRef<HTMLInputElement>>('search');
  private onChange: (value: string) => void = () => undefined;
  private onTouched: () => void = () => undefined;
  private typeBuffer = '';
  private typeTimer?: ReturnType<typeof setTimeout>;
  private floating?: AnchoredHandle;

  constructor() {
    const outside = (event: Event) => {
      const target = event.target as Node;
      if (!this.open() || this.host.nativeElement.contains(target) || this.panel()?.nativeElement.contains(target)) {
        return;
      }
      this.close(false);
    };
    document.addEventListener('pointerdown', outside, true);

    // Neo panel khi mở; huỷ khi đóng. Không có listener scroll ở chế độ mặc định.
    effect(() => {
      const el = this.panel()?.nativeElement;
      if (el && !this.floating) {
        this.floating = anchorFloating(this.anchor().nativeElement, el, {
          gap: 6,
          matchWidth: true,
          minHeight: 160,
          onAncestorScroll: () => this.close(false),
          onReferenceHidden: () => this.close(false),
        });
        queueMicrotask(() => (this.searchBox()?.nativeElement ?? this.trigger().nativeElement).focus());
      } else if (!el && this.floating) {
        this.floating.destroy();
        this.floating = undefined;
      }
    });

    // Danh sách lọc thay đổi chiều cao → đo lại một lần (không đo mỗi frame).
    effect(() => {
      this.filtered();
      this.floating?.remeasure();
    });

    inject(DestroyRef).onDestroy(() => {
      this.floating?.destroy();
      document.removeEventListener('pointerdown', outside, true);
      clearTimeout(this.typeTimer);
    });
  }

  // ---- ControlValueAccessor ----
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
    this.formDisabled.set(isDisabled);
    if (isDisabled) {
      this.close(false);
    }
  }

  // ---- Interaction ----
  toggle(): void {
    if (this.open()) {
      this.close();
    } else {
      this.openPanel();
    }
  }

  openPanel(): void {
    if (this.isDisabled() || this.open()) {
      return;
    }
    this.query.set('');
    const idx = this.filtered().findIndex((o) => o.value === this.value());
    this.activeIndex.set(idx >= 0 ? idx : this.firstEnabled(0, 1));
    this.open.set(true);
  }

  close(focusTrigger = true): void {
    if (!this.open()) {
      return;
    }
    this.open.set(false);
    this.markTouched();
    if (focusTrigger) {
      this.trigger().nativeElement.focus();
    }
  }

  choose(option: MofSelectOption): void {
    if (option.disabled) {
      return;
    }
    if (option.value !== this.value()) {
      this.value.set(option.value);
      this.onChange(option.value);
    }
    this.close();
  }

  onQuery(event: Event): void {
    this.query.set((event.target as HTMLInputElement).value);
    this.activeIndex.set(this.firstEnabled(0, 1));
  }

  onKeydown(event: KeyboardEvent): void {
    if (this.isDisabled()) {
      return;
    }
    const list = this.filtered();
    switch (event.key) {
      case 'ArrowDown':
      case 'ArrowUp': {
        event.preventDefault();
        if (!this.open()) {
          this.openPanel();
          return;
        }
        const dir = event.key === 'ArrowDown' ? 1 : -1;
        this.activeIndex.set(this.firstEnabled(this.activeIndex() + dir, dir));
        this.scrollActive();
        return;
      }
      case 'Home':
      case 'End':
        if (this.open()) {
          event.preventDefault();
          this.activeIndex.set(event.key === 'Home' ? this.firstEnabled(0, 1) : this.firstEnabled(list.length - 1, -1));
          this.scrollActive();
        }
        return;
      case 'Enter':
      case ' ':
        if (event.key === ' ' && event.target instanceof HTMLInputElement) {
          return;
        }
        event.preventDefault();
        if (!this.open()) {
          this.openPanel();
        } else if (list[this.activeIndex()]) {
          this.choose(list[this.activeIndex()]);
        }
        return;
      case 'Escape':
        if (this.open()) {
          event.preventDefault();
          event.stopPropagation();
          this.close();
        }
        return;
      case 'Tab':
        this.close(false);
        return;
      default:
        if (event.key.length === 1 && !event.ctrlKey && !event.metaKey && !(event.target instanceof HTMLInputElement)) {
          this.typeAhead(event.key);
        }
    }
  }

  markTouched(): void {
    this.onTouched();
  }

  // ---- Helpers ----
  private typeAhead(char: string): void {
    this.typeBuffer += char;
    clearTimeout(this.typeTimer);
    this.typeTimer = setTimeout(() => (this.typeBuffer = ''), 600);
    if (this.searchable()) {
      this.openPanel();
      this.query.set(this.typeBuffer);
      this.activeIndex.set(this.firstEnabled(0, 1));
      return;
    }
    const q = this.normalize(this.typeBuffer);
    const idx = this.filtered().findIndex((o) => !o.disabled && this.normalize(o.label).startsWith(q));
    if (idx >= 0) {
      if (this.open()) {
        this.activeIndex.set(idx);
        this.scrollActive();
      } else {
        this.choose(this.filtered()[idx]);
      }
    }
  }

  private firstEnabled(start: number, dir: 1 | -1): number {
    const list = this.filtered();
    if (!list.length) {
      return -1;
    }
    let i = Math.min(Math.max(start, 0), list.length - 1);
    for (let n = 0; n < list.length; n++) {
      if (!list[i].disabled) {
        return i;
      }
      i = (i + dir + list.length) % list.length;
    }
    return -1;
  }

  private scrollActive(): void {
    queueMicrotask(() => document.getElementById(this.activeId() ?? '')?.scrollIntoView({ block: 'nearest' }));
  }

  private normalize(text: string): string {
    return text
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/đ/g, 'd')
      .trim();
  }
}
