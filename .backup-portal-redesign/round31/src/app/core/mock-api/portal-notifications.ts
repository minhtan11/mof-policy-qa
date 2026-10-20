/** Fixture thông báo cổng (chuông header). Mock — backend thật thay `PortalNotificationRepository`. */
export type PortalNotificationKind = 'answer' | 'status' | 'system' | 'news' | 'assign' | 'sla' | 'approval';

export interface PortalNotification {
  id: string;
  kind: PortalNotificationKind;
  /** Khóa i18n. */
  titleKey: string;
  bodyKey: string;
  params?: Record<string, string>;
  at: string;
  route: string;
  fragment?: string;
  /** Query params khi điều hướng (vd. ?filter= của hàng đợi workspace). */
  query?: Record<string, string>;
  read: boolean;
}

export const PORTAL_NOTIFICATIONS: PortalNotification[] = [
  { id: 'n1', kind: 'answer', titleKey: 'notif.answerTitle', bodyKey: 'notif.answerBody', params: { code: 'CSTC-2026-000128' }, at: '2026-10-20T08:15:00+07:00', route: '/portal/tra-cuu', read: false },
  { id: 'n2', kind: 'status', titleKey: 'notif.statusTitle', bodyKey: 'notif.statusBody', params: { code: 'CSTC-2026-000131' }, at: '2026-10-19T16:40:00+07:00', route: '/portal/tra-cuu', read: false },
  { id: 'n3', kind: 'news', titleKey: 'notif.newsTitle', bodyKey: 'notif.newsBody', at: '2026-10-18T09:00:00+07:00', route: '/portal', fragment: 'tin-tuc', read: false },
  { id: 'n4', kind: 'system', titleKey: 'notif.systemTitle', bodyKey: 'notif.systemBody', at: '2026-10-15T20:00:00+07:00', route: '/portal', fragment: 'thong-bao', read: true },
];
