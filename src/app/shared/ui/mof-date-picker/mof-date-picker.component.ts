import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  computed,
  forwardRef,
  inject,
  input,
  signal,
  viewChild,
  viewChildren,
} from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import { TranslatePipe } from '../../../core/i18n/translate.pipe';
import { I18nService } from '../../../core/i18n/i18n.service';
import { MofFiIconComponent } from '../mof-fi-icon/mof-fi-icon.component';

export interface MofCalendarDay {
  iso: string;
  day: number;
  outside: boolean;
  today: boolean;
  selected: boolean;
  disabled: boolean;
}

const pad = (n: number): string => String(n).padStart(2, '0');
export const toIso = (d: Date): string => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
export const fromIso = (iso: string | null | undefined): Date | null => {
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(iso ?? '');
  if (!m) {
    return null;
  }
  const d = new Date(+m[1], +m[2] - 1, +m[3]);
  return d.getMonth() === +m[2] - 1 ? d : null;
};
/** Parse dd/MM/yyyy (also d/M/yy, separators / - .) -> ISO, or null. */
export const parseDisplay = (text: string): string | null => {
  const m = /^\s*(\d{1,2})[/.-](\d{1,2})[/.-](\d{2}|\d{4})\s*$/.exec(text);
  if (!m) {
    return null;
  }
  const year = m[3].length === 2 ? 2000 + +m[3] : +m[3];
  const d = new Date(year, +m[2] - 1, +m[1]);
  return d.getDate() === +m[1] && d.getMonth() === +m[2] - 1 ? toIso(d) : null;
};
/** Paste: dd/MM/yyyy, d-M-yy, yyyy-MM-dd -> ISO. */
export const parseAny = (text: string): string | null => {
  const t = text.trim();
  const iso = /^(\d{4})[-/.](\d{1,2})[-/.](\d{1,2})$/.exec(t);
  if (iso) {
    return parseDisplay(iso[3] + '/' + iso[2] + '/' + iso[1]);
  }
  return parseDisplay(t);
};

export const formatDisplay = (iso: string): string => {
  const d = fromIso(iso);
  return d ? `${pad(d.getDate())}/${pad(d.getMonth() + 1)}/${d.getFullYear()}` : '';
};

/**
 * Date picker dung chung. Gia tri ISO `YYYY-MM-DD`; hien thi dd/MM/yyyy (go tay + parse).
 * Popover lich: dieu huong thang, Hom nay / Xoa, min/max, ban phim (mui ten, Enter, Esc), lat len khi thieu cho.
 */
@Component({
  selector: 'app-mof-date-picker',
  imports: [TranslatePipe, MofFiIconComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [{ provide: NG_VALUE_ACCESSOR, useExisting: forwardRef(() => MofDatePickerComponent), multi: true }],
  host: {
    '(document:pointerdown)': 'onDocPointer($event)',
  },
  templateUrl: './mof-date-picker.component.html',
  styleUrl: './mof-date-picker.component.scss',
})
export class MofDatePickerComponent implements ControlValueAccessor {
  private readonly host = inject<ElementRef<HTMLElement>>(ElementRef);
  private readonly i18n = inject(I18nService);

  readonly id = input<string>('');
  readonly placeholder = input('');
  readonly min = input<string | null>(null);
  readonly max = input<string | null>(null);
  readonly invalid = input(false);
  readonly disabledInput = input(false, { alias: 'disabled' });

  readonly value = signal('');
  /** Segment dd / mm / yyyy (chuoi so, co the dang go do). */
  readonly segs = signal<[string, string, string]>(['', '', '']);
  readonly segLen = [2, 2, 4] as const;
  readonly segKeys = ['day', 'month', 'year'] as const;
  readonly open = signal(false);
  readonly above = signal(false);
  readonly view = signal(this.firstOfMonth(new Date()));
  readonly focused = signal(toIso(new Date()));
  readonly typedError = signal(false);
  private readonly disabledFromForm = signal(false);
  readonly isDisabled = computed(() => this.disabledInput() || this.disabledFromForm());
  readonly isEmpty = computed(() => this.segs().every((s) => !s));

  private readonly grid = viewChild<ElementRef<HTMLElement>>('grid');
  private readonly segInputs = viewChildren<ElementRef<HTMLInputElement>>('seg');

  readonly weekdays = computed(() => {
    const keys = ['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun'];
    return keys.map((k) => this.i18n.dictionary()['datePicker.wd.' + k] ?? k);
  });

  readonly monthLabel = computed(() => {
    const v = this.view();
    const name = this.i18n.dictionary()['datePicker.month.' + (v.getMonth() + 1)] ?? String(v.getMonth() + 1);
    return `${name} ${v.getFullYear()}`;
  });

  readonly days = computed<MofCalendarDay[]>(() => {
    const v = this.view();
    const offset = (v.getDay() + 6) % 7; // Monday first
    const start = new Date(v.getFullYear(), v.getMonth(), 1 - offset);
    const today = toIso(new Date());
    return Array.from({ length: 42 }, (_, i) => {
      const d = new Date(start.getFullYear(), start.getMonth(), start.getDate() + i);
      const iso = toIso(d);
      return {
        iso,
        day: d.getDate(),
        outside: d.getMonth() !== v.getMonth(),
        today: iso === today,
        selected: iso === this.value(),
        disabled: this.isOutOfRange(iso),
      };
    });
  });

  private onChange: (value: string) => void = () => undefined;
  private onTouched: () => void = () => undefined;

  writeValue(value: string | null): void {
    const iso = fromIso(value) ? (value as string) : '';
    this.value.set(iso);
    this.segs.set(this.segsFromIso(iso));
    this.typedError.set(false);
  }

  registerOnChange(fn: (value: string) => void): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    this.disabledFromForm.set(isDisabled);
    if (isDisabled) {
      this.open.set(false);
    }
  }

  isOutOfRange(iso: string): boolean {
    const min = this.min();
    const max = this.max();
    return (!!min && iso < min) || (!!max && iso > max);
  }

  // ---------- Segmented input ----------

  /** Click vao vung trong cua field -> focus segment dau tien con trong. */
  focusField(event: MouseEvent): void {
    if (this.isDisabled() || (event.target as HTMLElement).tagName === 'INPUT' || (event.target as HTMLElement).closest('button')) {
      return;
    }
    const idx = this.segs().findIndex((s, i) => s.length < this.segLen[i]);
    this.focusSeg(idx < 0 ? 2 : idx);
  }

  onSegFocus(event: FocusEvent): void {
    (event.target as HTMLInputElement).select();
  }

  onSegKey(i: number, event: KeyboardEvent): void {
    const k = event.key;
    if (/^\d$/.test(k)) {
      event.preventDefault();
      this.typeDigit(i, k);
    } else if (k === '/' || k === '.' || k === '-') {
      event.preventDefault();
      const v = this.segs()[i];
      if (v.length === 1 && i < 2) {
        this.setSeg(i, '0' + v);
      }
      if (v) {
        this.focusSeg(i + 1);
      }
    } else if (k === 'Backspace') {
      event.preventDefault();
      const v = this.segs()[i];
      if (v) {
        this.setSeg(i, v.slice(0, -1));
      } else if (i > 0) {
        this.setSeg(i - 1, this.segs()[i - 1].slice(0, -1));
        this.focusSeg(i - 1, false);
      }
    } else if (k === 'Delete') {
      event.preventDefault();
      this.setSeg(i, '');
    } else if (k === 'ArrowLeft' && i > 0) {
      event.preventDefault();
      this.focusSeg(i - 1);
    } else if (k === 'ArrowRight' && i < 2) {
      event.preventDefault();
      this.focusSeg(i + 1);
    } else if ((k === 'ArrowDown' && event.altKey) || k === 'F4') {
      event.preventDefault();
      this.show(true);
    } else if (k === 'ArrowUp' || k === 'ArrowDown') {
      event.preventDefault();
      this.step(i, k === 'ArrowUp' ? 1 : -1);
    } else if (k === 'Enter') {
      event.preventDefault();
      this.finalize();
    } else if (k === 'Escape' && this.open()) {
      event.preventDefault();
      this.close();
    } else if (k.length === 1 && !event.ctrlKey && !event.metaKey) {
      event.preventDefault(); // chi cho phep so
    }
  }

  /** Fallback cho ban phim ao (keydown 'Unidentified'): lay so tu input event. */
  onSegInput(i: number, event: Event): void {
    const el = event.target as HTMLInputElement;
    const digits = el.value.replace(/\D/g, '');
    const prev = this.segs()[i];
    el.value = prev;
    const added = digits.startsWith(prev) ? digits.slice(prev.length) : digits;
    let idx = i;
    for (const ch of added) {
      idx = this.typeDigit(idx, ch);
    }
  }

  onPaste(event: ClipboardEvent): void {
    const text = event.clipboardData?.getData('text') ?? '';
    const iso = parseAny(text);
    event.preventDefault();
    if (iso) {
      this.segs.set(this.segsFromIso(iso));
      this.tryCommit();
      this.focusSeg(2);
    }
  }

  onGroupFocusOut(event: FocusEvent): void {
    const next = event.relatedTarget as Node | null;
    if (next && this.host.nativeElement.contains(next)) {
      return;
    }
    this.finalize();
    this.onTouched();
  }

  /** Go 1 so vao segment i; tra ve segment dang focus sau do. */
  private typeDigit(i: number, ch: string): number {
    const len = this.segLen[i];
    const cur = this.segs()[i];
    let v = cur.length >= len ? ch : cur + ch;
    let advance = false;
    if (v.length === 1 && ((i === 0 && +ch > 3) || (i === 1 && +ch > 1))) {
      v = '0' + ch;
    }
    if (v.length === len) {
      advance = i < 2;
    }
    this.setSeg(i, v);
    if (advance) {
      this.focusSeg(i + 1);
      return i + 1;
    }
    return i;
  }

  private step(i: number, delta: number): void {
    const v = this.segs()[i];
    let n: number;
    if (i === 2) {
      n = (v.length === 4 ? +v : new Date().getFullYear()) + (v.length === 4 ? delta : 0);
      this.setSeg(2, String(Math.min(9999, Math.max(1, n))).padStart(4, '0'));
    } else {
      const max = i === 0 ? 31 : 12;
      const base = v ? +v : delta > 0 ? 0 : max + 1;
      n = ((base - 1 + delta + max) % max) + 1;
      this.setSeg(i, String(n).padStart(2, '0'));
    }
    this.selectSeg(i);
  }

  private setSeg(i: number, v: string): void {
    const next = [...this.segs()] as [string, string, string];
    next[i] = v;
    this.segs.set(next);
    this.typedError.set(false);
    this.tryCommit();
  }

  /** Khi du 3 segment: hop le -> emit ISO; sai -> do. */
  private tryCommit(): void {
    const [d, m, y] = this.segs();
    if (d.length < 2 || m.length < 2 || y.length < 4) {
      return;
    }
    const iso = parseDisplay(`${d}/${m}/${y}`);
    if (iso && !this.isOutOfRange(iso)) {
      this.typedError.set(false);
      if (iso !== this.value()) {
        this.value.set(iso);
        this.onChange(iso);
      }
      this.view.set(this.firstOfMonth(fromIso(iso)!));
      this.focused.set(iso);
    } else {
      this.typedError.set(true);
    }
  }

  /** Blur/Enter: rong -> xoa gia tri; chua du/sai -> bao loi, giu gia tri model cu. */
  private finalize(): void {
    if (this.isEmpty()) {
      this.typedError.set(false);
      if (this.value()) {
        this.value.set('');
        this.onChange('');
      }
      return;
    }
    const [d, m, y] = this.segs();
    if (d.length < 2 || m.length < 2 || y.length < 4) {
      this.typedError.set(true);
      return;
    }
    this.tryCommit();
  }

  private focusSeg(i: number, select = true): void {
    const el = this.segInputs()[Math.max(0, Math.min(2, i))]?.nativeElement;
    if (el) {
      el.focus();
      if (select) {
        el.select();
      }
    }
  }

  private selectSeg(i: number): void {
    queueMicrotask(() => this.segInputs()[i]?.nativeElement.select());
  }

  private segsFromIso(iso: string): [string, string, string] {
    const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(iso);
    return m ? [m[3], m[2], m[1]] : ['', '', ''];
  }
  toggle(): void {
    if (this.open()) {
      this.close();
    } else {
      this.show(true);
    }
  }

  show(focusGrid = false): void {
    if (this.isDisabled()) {
      return;
    }
    const base = fromIso(this.value()) ?? this.clampToRange(new Date());
    this.view.set(this.firstOfMonth(base));
    this.focused.set(toIso(base));
    const rect = this.host.nativeElement.getBoundingClientRect();
    const need = 360;
    this.above.set(window.innerHeight - rect.bottom < need && rect.top > window.innerHeight - rect.bottom);
    this.open.set(true);
    if (focusGrid) {
      this.focusDay();
    }
  }

  close(restoreFocus = true): void {
    if (!this.open()) {
      return;
    }
    this.open.set(false);
    this.onTouched();
    if (restoreFocus) {
      this.focusSeg(0);
    }
  }

  shiftMonth(delta: number): void {
    const v = this.view();
    this.view.set(new Date(v.getFullYear(), v.getMonth() + delta, 1));
    const f = fromIso(this.focused())!;
    const target = new Date(v.getFullYear(), v.getMonth() + delta, 1);
    const last = new Date(target.getFullYear(), target.getMonth() + 1, 0).getDate();
    this.focused.set(toIso(new Date(target.getFullYear(), target.getMonth(), Math.min(f.getDate(), last))));
  }

  pick(day: MofCalendarDay): void {
    if (day.disabled) {
      return;
    }
    this.set(day.iso);
    this.close();
  }

  pickToday(): void {
    const iso = toIso(new Date());
    if (!this.isOutOfRange(iso)) {
      this.set(iso);
      this.close();
    }
  }

  clear(): void {
    this.set('');
    this.close();
  }

  readonly todayDisabled = computed(() => this.isOutOfRange(toIso(new Date())));

  onGridKey(event: KeyboardEvent): void {
    const moves: Record<string, number> = { ArrowLeft: -1, ArrowRight: 1, ArrowUp: -7, ArrowDown: 7 };
    const f = fromIso(this.focused())!;
    if (event.key in moves) {
      event.preventDefault();
      this.moveFocus(new Date(f.getFullYear(), f.getMonth(), f.getDate() + moves[event.key]));
    } else if (event.key === 'PageUp' || event.key === 'PageDown') {
      event.preventDefault();
      this.shiftMonth(event.key === 'PageUp' ? -1 : 1);
      this.focusDay();
    } else if (event.key === 'Home' || event.key === 'End') {
      event.preventDefault();
      const dow = (f.getDay() + 6) % 7;
      this.moveFocus(new Date(f.getFullYear(), f.getMonth(), f.getDate() + (event.key === 'Home' ? -dow : 6 - dow)));
    } else if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      const day = this.days().find((d) => d.iso === this.focused());
      if (day) {
        this.pick(day);
      }
    } else if (event.key === 'Escape') {
      event.preventDefault();
      this.close();
    }
  }

  onPanelKey(event: KeyboardEvent): void {
    if (event.key === 'Escape') {
      event.preventDefault();
      this.close();
    }
  }

  onDocPointer(event: Event): void {
    if (this.open() && !this.host.nativeElement.contains(event.target as Node)) {
      this.close(false);
    }
  }

  private moveFocus(d: Date): void {
    this.focused.set(toIso(d));
    const v = this.view();
    if (d.getMonth() !== v.getMonth() || d.getFullYear() !== v.getFullYear()) {
      this.view.set(this.firstOfMonth(d));
    }
    this.focusDay();
  }

  private focusDay(): void {
    queueMicrotask(() =>
      setTimeout(() => this.grid()?.nativeElement.querySelector<HTMLElement>('[data-focused="true"]')?.focus()),
    );
  }

  private set(iso: string): void {
    this.value.set(iso);
    this.segs.set(this.segsFromIso(iso));
    this.typedError.set(false);
    this.onChange(iso);
  }

  private clampToRange(d: Date): Date {
    const iso = toIso(d);
    const min = this.min();
    const max = this.max();
    if (min && iso < min) {
      return fromIso(min) ?? d;
    }
    if (max && iso > max) {
      return fromIso(max) ?? d;
    }
    return d;
  }

  private firstOfMonth(d: Date): Date {
    return new Date(d.getFullYear(), d.getMonth(), 1);
  }
}