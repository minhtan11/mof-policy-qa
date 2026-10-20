import { Injectable } from '@angular/core';
import { NotificationStore } from './portal-notification.repository';
import { WORKSPACE_NOTIFICATIONS } from './workspace-notifications';

/** Thông báo workspace (mock): phân công, SLA, chờ duyệt, hệ thống. Đã đọc lưu localStorage riêng. */
@Injectable({ providedIn: 'root' })
export class WorkspaceNotificationRepository extends NotificationStore {
  constructor() {
    super(WORKSPACE_NOTIFICATIONS, 'mof.ws.notif.read');
  }
}
