import { Injectable, signal } from '@angular/core';

const COLLAPSED_KEY = 'mof.ws.sidebar.collapsed';
const GROUPS_KEY = 'mof.ws.sidebar.groups';

/**
 * Trạng thái khung workspace dùng chung cho mọi trang /workspace/** và /admin:
 * chế độ rail/mở rộng + trạng thái mở từng nhóm (lưu localStorage), drawer mobile (không lưu).
 */
@Injectable({ providedIn: 'root' })
export class WorkspaceShellState {
  readonly collapsed = signal(this.read(COLLAPSED_KEY) === '1');
  readonly groups = signal<Record<string, boolean>>(this.readGroups());
  readonly drawerOpen = signal(false);
  /** true trong lúc chuyển rail ↔ mở rộng (chỉ khi đó nhãn mới fade — không chạy khi trang tạo lại shell). */
  readonly animating = signal(false);
  /** Vị trí cuộn menu (shell tạo lại theo trang → khôi phục, không nhảy). */
  menuScroll = 0;
  private animTimer: ReturnType<typeof setTimeout> | undefined;

  toggleCollapsed(): void {
    this.setCollapsed(!this.collapsed());
  }

  setCollapsed(v: boolean): void {
    if (v !== this.collapsed()) {
      this.animating.set(true);
      clearTimeout(this.animTimer);
      this.animTimer = setTimeout(() => this.animating.set(false), 420);
    }
    this.collapsed.set(v);
    this.write(COLLAPSED_KEY, v ? '1' : '0');
  }

  /** Mặc định mở nếu chưa từng lưu. */
  isGroupOpen(id: string): boolean {
    return this.groups()[id] ?? true;
  }

  setGroup(id: string, open: boolean): void {
    if (this.isGroupOpen(id) === open && id in this.groups()) {
      return;
    }
    const next = { ...this.groups(), [id]: open };
    this.groups.set(next);
    this.write(GROUPS_KEY, JSON.stringify(next));
  }

  toggleGroup(id: string): void {
    this.setGroup(id, !this.isGroupOpen(id));
  }

  private readGroups(): Record<string, boolean> {
    try {
      const v = JSON.parse(this.read(GROUPS_KEY) ?? '{}');
      return v && typeof v === 'object' ? (v as Record<string, boolean>) : {};
    } catch {
      return {};
    }
  }

  private read(key: string): string | null {
    try {
      return localStorage.getItem(key);
    } catch {
      return null;
    }
  }

  private write(key: string, v: string): void {
    try {
      localStorage.setItem(key, v);
    } catch {
      /* bỏ qua */
    }
  }
}
