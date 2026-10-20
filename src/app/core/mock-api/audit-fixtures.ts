import { AuditLogEntry } from '../models/domain.models';

/** Seed nhật ký audit hệ thống — bất biến khi đọc; timeline hồ sơ merge thêm lúc runtime */
export const AUDIT_LOG_FIXTURES: AuditLogEntry[] = [
  {
    id: 'aud-001',
    actionType: 'login',
    actor: 'Quản trị hệ thống',
    at: '2026-10-20T07:55:00',
    summaryKey: 'admin.audit.summary.login',
  },
  {
    id: 'aud-002',
    actionType: 'config',
    actor: 'Quản trị hệ thống',
    at: '2026-10-20T08:10:00',
    summaryKey: 'admin.audit.summary.config',
  },
  {
    id: 'aud-003',
    actionType: 'integration',
    actor: 'Quản trị hệ thống',
    at: '2026-10-20T08:12:00',
    summaryKey: 'admin.audit.summary.integration',
  },
  {
    id: 'aud-004',
    actionType: 'assign',
    actor: 'Trần Thu Hà',
    at: '2026-10-15T10:15:00',
    dossierCode: 'CSTC-2026-001284',
    summaryKey: 'admin.audit.summary.assign',
  },
  {
    id: 'aud-005',
    actionType: 'status-change',
    actor: 'Lê Quốc Hưng',
    at: '2026-10-16T15:40:00',
    dossierCode: 'CSTC-2026-001279',
    summaryKey: 'admin.audit.summary.status',
  },
  {
    id: 'aud-006',
    actionType: 'approve',
    actor: 'Phạm Đức Long',
    at: '2026-10-15T16:00:00',
    dossierCode: 'CSTC-2026-001261',
    summaryKey: 'admin.audit.summary.approve',
  },
  {
    id: 'aud-007',
    actionType: 'publish',
    actor: 'Phạm Đức Long',
    at: '2026-10-15T16:30:00',
    dossierCode: 'CSTC-2026-001261',
    summaryKey: 'admin.audit.summary.publish',
  },
  {
    id: 'aud-008',
    actionType: 'note',
    actor: 'Lê Quốc Hưng',
    at: '2026-10-16T11:30:00',
    dossierCode: 'CSTC-2026-001284',
    summaryKey: 'admin.audit.summary.note',
  },
  {
    id: 'aud-009',
    actionType: 'recall',
    actor: 'Đỗ Bích Ngọc',
    at: '2026-10-19T09:20:00',
    dossierCode: 'CSTC-2026-001261',
    summaryKey: 'admin.audit.summary.recall',
  },
];
