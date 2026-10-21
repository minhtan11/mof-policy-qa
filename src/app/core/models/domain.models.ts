export type UserRole =
  | 'public'
  | 'reception'
  | 'specialist'
  | 'leader'
  | 'coordinator'
  | 'system-admin';

/** Kênh tiếp nhận hồ sơ — khớp danh mục `intake-method`. */
export type IntakeChannel = 'portal' | 'email' | 'paper';

/** Loại câu hỏi trên kho tra cứu công khai. */
export type PortalQaType = 'policy' | 'procedure' | 'guidance' | 'feedback';

/**
 * Trạng thái hồ sơ — G5 bám dac-ta §4.3 (rút gọn mã kỹ thuật, đủ nhánh thao tác được).
 * Nháp/đã gửi công khai map `new`; chờ ĐV gộp vào `received`+handlingUnitId.
 */
export type DossierStatus =
  | 'new'
  | 'received'
  | 'processing'
  | 'awaiting-clarification'
  | 'awaiting-collaboration'
  | 'waiting-approval'
  | 'returned'
  | 'approved'
  | 'answered'
  | 'published'
  | 'closed'
  /** Không tiếp nhận / ngoài phạm vi. */
  | 'rejected';

export interface PortalUser {
  id: string;
  name: string;
  email: string;
  /** Tên đăng nhập ngắn (mock) — đăng nhập được bằng username hoặc email. */
  username?: string;
  organization?: string;
  /** Đơn vị xử lý — data scope `unit` (khớp AdminAccount.organizationId). */
  organizationId?: string;
  role: UserRole;
  avatar: string;
}

export interface Topic {
  id: string;
  name: string;
  description: string;
  icon: string;
  count: number;
}

export interface TimelineEvent {
  at: string;
  title: string;
  description: string;
  actor: string;
  state: 'done' | 'current' | 'pending';
}

export interface DossierRating {
  id: string;
  stars: number;
  comment: string;
  at: string;
}

export interface DossierClarification {
  id: string;
  text: string;
  at: string;
  status: 'open' | 'answered';
}

export interface DossierCollaboration {
  id: string;
  unitId: string;
  unitName: string;
  note: string;
  dueAt: string;
  status: 'open' | 'done';
  requestedBy: string;
  at: string;
}

/** Bút phê / ghi chú audit nội bộ — UC-176..UC-187 */
export interface DossierAuditNote {
  id: string;
  text: string;
  actor: string;
  at: string;
}

export interface Dossier {
  id: string;
  code: string;
  question: string;
  topicId: string;
  sender: string;
  senderEmail: string;
  organization: string;
  receivedAt: string;
  dueAt: string;
  status: DossierStatus;
  priority: 'normal' | 'high' | 'urgent';
  assignedTo?: string;
  /** Khóa cán bộ xử lý (`USERS.id`). Cùng người với `assignedTo`. */
  assigneeId?: string;
  /** Khóa người gửi (`SEED_PARTIES.id`). */
  senderId?: string;
  /** Đơn vị đang giữ hồ sơ — lọc data scope `unit`. Trùng đơn vị của `assigneeId` khi đã giao. */
  handlingUnitId?: string;
  /** Kênh tiếp nhận. */
  intakeChannel?: IntakeChannel;
  /** Niêm yết trên kho tra cứu. Hồ sơ `published` luôn được niêm yết. */
  listedOnPortal?: boolean;
  portalType?: PortalQaType;
  portalViews?: number;
  portalReplies?: number;
  answer?: string;
  legalBasis: string[];
  attachments: string[];
  timeline: TimelineEvent[];
  isPublic: boolean;
  ratings?: DossierRating[];
  clarifications?: DossierClarification[];
  collaborations?: DossierCollaboration[];
  auditNotes?: DossierAuditNote[];
}

export interface Notice {
  id: string;
  title: string;
  body: string;
  date: string;
  category: 'news' | 'guide' | 'notice';
}

export interface DashboardMetric {
  label: string;
  value: number;
  delta: string;
  icon: string;
  tone: 'blue' | 'green' | 'amber' | 'violet';
}

export interface LegalDocument {
  id: string;
  code: string;
  title: string;
  issuer: string;
  issuedAt: string;
  effectiveFrom: string;
  effectiveTo?: string;
  status: 'effective' | 'expired' | 'replaced' | 'draft';
  version: number;
  chapters: number;
  source: 'synced' | 'manual';
}

export interface WorkflowDefinition {
  id: string;
  name: string;
  version: number;
  status: 'draft' | 'active' | 'archived';
  slaDays: number;
  steps: Array<{ id: string; name: string; role: UserRole; required: boolean }>;
  updatedAt: string;
}

export interface AiSuggestion {
  id: string;
  dossierId: string;
  kind: 'classification' | 'routing' | 'legal-basis' | 'summary' | 'duplicate' | 'translation';
  value: string;
  confidence: number;
  status: 'suggested' | 'accepted' | 'rejected';
  model: string;
}

export interface ReportDefinition {
  id: string;
  code: string;
  name: string;
  description: string;
  category: 'operations' | 'sla' | 'quality' | 'public' | 'audit';
  lastGenerated?: string;
}

/** Job vận hành mock — UC-084..UC-099 */
export interface OpsJob {
  id: string;
  name: string;
  schedule: string;
  lastRunAt: string;
  status: 'idle' | 'running' | 'success' | 'failed';
}

export interface BackupSnapshot {
  id: string;
  label: string;
  createdAt: string;
  sizeLabel: string;
}

export interface AiModelInfo {
  id: string;
  name: string;
  purpose: string;
  version: string;
  status: 'online' | 'degraded' | 'offline';
}

/** Kênh tích hợp ngoài — UC-052..UC-059 (adapter mock, chưa API thật) */
export type IntegrationKind = 'vneid-sso' | 'email' | 'sms' | 'storage' | 'webhook' | 'vbpq';

export type IntegrationStatus = 'connected' | 'disconnected' | 'degraded' | 'mock';

export interface IntegrationChannel {
  id: string;
  kind: IntegrationKind;
  nameKey: string;
  descriptionKey: string;
  enabled: boolean;
  status: IntegrationStatus;
  lastCheckedAt: string;
  endpointHint: string;
}

/** Nhật ký audit bất biến — UC-176..UC-187 / admin audit tab */
export type AuditActionType =
  | 'login'
  | 'status-change'
  | 'assign'
  | 'approve'
  | 'publish'
  | 'recall'
  | 'config'
  | 'integration'
  | 'note'
  | 'timeline';

export interface AuditLogEntry {
  id: string;
  actionType: AuditActionType;
  actor: string;
  at: string;
  dossierCode?: string;
  summaryKey: string;
}

export interface CatalogEntry {
  id: string;
  type: 'topic' | 'priority' | 'tag' | 'answer-template' | 'intake-method';
  code: string;
  label: string;
  active: boolean;
  sortOrder: number;
}

/** Đơn vị tổ chức — UC-009..UC-017 */
export interface OrganizationUnit {
  id: string;
  code: string;
  name: string;
  parentId: string | null;
  intakeTopicIds: string[];
  active: boolean;
}

/** Tài khoản nội bộ quản trị — UC-018..UC-030 */
export interface AdminAccount {
  id: string;
  name: string;
  email: string;
  organizationId: string;
  role: Exclude<UserRole, 'public'>;
  active: boolean;
  avatar: string;
}

/** Ma trận quyền hiển thị — UC-031..UC-040 */
export interface RolePermissionRow {
  role: Exclude<UserRole, 'public'>;
  permissions: string[];
  scope: 'all' | 'unit' | 'assigned';
}

export type UseCaseTraceStatus = 'specified' | 'mocked' | 'tested' | 'integrated' | 'blocked';

export interface UseCaseDefinition {
  id: string;
  number: number;
  group: string;
  title: string;
  mdc: string;
  status: UseCaseTraceStatus;
}
