import { Injectable, inject, signal } from '@angular/core';
import { I18nService } from '../i18n/i18n.service';

export type ToastType = 'success' | 'error' | 'warning' | 'info';

export interface ToastAction {
  /** Khóa i18n hoặc chữ thường. */
  label: string;
  run: () => void;
}

export interface ToastOptions {
  /** Khóa i18n hoặc chữ. */
  title?: string;
  /** ms; mặc định 4000 (error 6000). 0 = không tự đóng. */
  duration?: number;
  action?: ToastAction;
  /** Tham số nội suy {{x}} cho message/title. */
  params?: Record<string, string | number>;
}

export interface Toast {
  id: number;
  type: ToastType;
  title?: string;
  message: string;
  duration: number;
  action?: ToastAction;
  /** Tăng khi toast trùng được "làm mới" → render lại thanh tiến độ. */
  rev: number;
  paused: boolean;
  leaving: boolean;
}

/** Tương thích API cũ `show({ severity, summary, detail, life })`. */
export interface LegacyToastInput {
  severity: 'success' | 'info' | 'warn' | 'error';
  summary: string;
  detail?: string;
  life?: number;
}

export const TOAST_MAX = 3;
export const TOAST_LEAVE_MS = 200;
const DEFAULT_MS: Record<ToastType, number> = { success: 4000, info: 4000, warning: 4000, error: 6000 };

interface Timer {
  handle?: ReturnType<typeof setTimeout>;
  startedAt: number;
  remaining: number;
}

/**
 * Thông báo toast dùng chung (signals). Tối đa 3 (bỏ cái cũ nhất), gộp toast trùng (cùng loại + tiêu đề + nội dung
 * → làm mới thời gian), tạm dừng khi hover/focus. Hiển thị bởi `app-mof-toaster` (mount một lần ở App).
 */
@Injectable({ providedIn: 'root' })
export class ToastService {
  private readonly i18n = inject(I18nService);
  private readonly list = signal<Toast[]>([]);
  readonly toasts = this.list.asReadonly();
  /** @deprecated dùng `toasts` — giữ cho mã cũ. */
  readonly messages = this.list.asReadonly();
  private readonly timers = new Map<number, Timer>();
  private seq = 0;

  success(message: string, options?: ToastOptions): number {
    return this.push('success', message, options);
  }

  error(message: string, options?: ToastOptions): number {
    return this.push('error', message, options);
  }

  warning(message: string, options?: ToastOptions): number {
    return this.push('warning', message, options);
  }

  info(message: string, options?: ToastOptions): number {
    return this.push('info', message, options);
  }

  /** API cũ: summary làm tiêu đề khi có detail, ngược lại làm nội dung. */
  show(input: LegacyToastInput): number {
    const type: ToastType = input.severity === 'warn' ? 'warning' : input.severity;
    return input.detail
      ? this.push(type, input.detail, { title: input.summary, duration: input.life })
      : this.push(type, input.summary, { duration: input.life });
  }

  dismiss(id: number): void {
    const t = this.list().find((x) => x.id === id);
    if (!t || t.leaving) {
      return;
    }
    this.stop(id);
    this.timers.delete(id);
    this.patch(id, { leaving: true });
    const reduce = typeof window !== 'undefined' && window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
    if (reduce) {
      this.remove(id);
    } else {
      setTimeout(() => this.remove(id), TOAST_LEAVE_MS);
    }
  }

  clear(): void {
    this.timers.forEach((_, id) => this.stop(id));
    this.timers.clear();
    this.list.set([]);
  }

  pause(id: number): void {
    const tm = this.timers.get(id);
    if (!tm || !tm.handle) {
      return;
    }
    this.stop(id);
    tm.remaining = Math.max(0, tm.remaining - (Date.now() - tm.startedAt));
    this.patch(id, { paused: true });
  }

  resume(id: number): void {
    const tm = this.timers.get(id);
    if (!tm || tm.handle) {
      return;
    }
    this.patch(id, { paused: false });
    this.arm(id, tm.remaining);
  }

  private push(type: ToastType, message: string, o: ToastOptions = {}): number {
    const text = this.i18n.t(message, o.params);
    const title = o.title ? this.i18n.t(o.title, o.params) : undefined;
    const duration = o.duration ?? DEFAULT_MS[type];
    const dup = this.list().find((t) => !t.leaving && t.type === type && t.message === text && t.title === title);
    if (dup) {
      this.patch(dup.id, { rev: dup.rev + 1, paused: false });
      this.stop(dup.id);
      this.arm(dup.id, duration);
      return dup.id;
    }
    const id = ++this.seq;
    const action = o.action ? { label: this.i18n.t(o.action.label), run: o.action.run } : undefined;
    this.list.update((l) => [...l, { id, type, title, message: text, duration, action, rev: 0, paused: false, leaving: false }]);
    this.arm(id, duration);
    const live = this.list().filter((t) => !t.leaving);
    if (live.length > TOAST_MAX) {
      live.slice(0, live.length - TOAST_MAX).forEach((t) => this.dismiss(t.id));
    }
    return id;
  }

  private arm(id: number, ms: number): void {
    if (ms <= 0) {
      this.timers.set(id, { startedAt: Date.now(), remaining: 0 });
      return;
    }
    this.timers.set(id, { startedAt: Date.now(), remaining: ms, handle: setTimeout(() => this.dismiss(id), ms) });
  }

  private stop(id: number): void {
    const tm = this.timers.get(id);
    if (tm?.handle) {
      clearTimeout(tm.handle);
      tm.handle = undefined;
    }
  }

  private patch(id: number, p: Partial<Toast>): void {
    this.list.update((l) => l.map((t) => (t.id === id ? { ...t, ...p } : t)));
  }

  private remove(id: number): void {
    this.list.update((l) => l.filter((t) => t.id !== id));
  }
}
