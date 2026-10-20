import { Injectable, computed, signal } from '@angular/core';
import { PORTAL_NOTIFICATIONS, PortalNotification } from './portal-notifications';

const READ_KEY = 'mof.portal.notif.read';

/** Kho thông báo mock dùng chung: fixture + tập id đã đọc (lưu localStorage theo `readKey`). */
export class NotificationStore {
  private readonly readIds = signal<Set<string>>(this.load());
  readonly items = computed<PortalNotification[]>(() => this.list.map((n) => ({ ...n, read: n.read || this.readIds().has(n.id) })));
  readonly unread = computed(() => this.items().filter((n) => !n.read).length);

  constructor(
    private readonly list: PortalNotification[],
    private readonly readKey: string,
  ) {}

  markRead(id: string): void {
    this.save(new Set([...this.readIds(), id]));
  }

  markAllRead(): void {
    this.save(new Set(this.list.map((n) => n.id)));
  }

  private save(ids: Set<string>): void {
    this.readIds.set(ids);
    try {
      localStorage.setItem(this.readKey, JSON.stringify([...ids]));
    } catch {
      /* bỏ qua */
    }
  }

  private load(): Set<string> {
    try {
      return new Set(JSON.parse(localStorage.getItem(this.readKey) ?? '[]') as string[]);
    } catch {
      return new Set();
    }
  }
}

/** Thông báo cổng (mock): danh sách + trạng thái đã đọc (lưu localStorage). */
@Injectable({ providedIn: 'root' })
export class PortalNotificationRepository extends NotificationStore {
  constructor() {
    super(PORTAL_NOTIFICATIONS, READ_KEY);
  }
}
