import { PortalNotification } from './portal-notifications';

/** Fixture thông báo workspace (chuông header nội bộ). Mock — backend thật thay `WorkspaceNotificationRepository`. */
export const WORKSPACE_NOTIFICATIONS: PortalNotification[] = [
  { id: 'w1', kind: 'assign', titleKey: 'wsNotif.assignTitle', bodyKey: 'wsNotif.assignBody', params: { code: 'CSTC-2026-001284' }, at: '2026-10-20T08:05:00+07:00', route: '/workspace/ho-so/d-001', read: false },
  { id: 'w2', kind: 'sla', titleKey: 'wsNotif.slaTitle', bodyKey: 'wsNotif.slaBody', params: { n: '3' }, at: '2026-10-20T07:30:00+07:00', route: '/workspace', query: { filter: 'processing' }, read: false },
  { id: 'w3', kind: 'approval', titleKey: 'wsNotif.approvalTitle', bodyKey: 'wsNotif.approvalBody', params: { code: 'CSTC-2026-001279' }, at: '2026-10-19T16:45:00+07:00', route: '/workspace', query: { filter: 'waiting-approval' }, read: false },
  { id: 'w4', kind: 'system', titleKey: 'wsNotif.systemTitle', bodyKey: 'wsNotif.systemBody', at: '2026-10-18T20:00:00+07:00', route: '/workspace', read: true },
];
