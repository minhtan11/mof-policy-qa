import { DossierStatus, UserRole } from '../models/domain.models';

/**
 * Fixture cấu hình màn W-01 “Tổng quan công việc” (round 31). Dữ liệu hồ sơ vẫn lấy từ MockDbService
 * qua WorkspaceOverviewRepository; file này chỉ chứa định nghĩa tab, KPI, màu/biểu tượng lĩnh vực, phạm vi theo vai trò.
 */
export type WsTab = 'all' | 'new' | 'processing' | 'waiting-approval' | 'answered' | 'closed';
export type WsTone = 'blue' | 'amber' | 'violet' | 'green' | 'red' | 'teal' | 'slate';

/** Tab “Hồ sơ cần chú ý” → các trạng thái. `all` = đang mở. Giá trị khớp ?filter= của sidebar (R29). */
export const WS_TABS: { id: WsTab; labelKey: string; statuses: DossierStatus[] }[] = [
  {
    id: 'all',
    labelKey: 'workspace.filterAll',
    statuses: [
      'new',
      'received',
      'processing',
      'awaiting-clarification',
      'awaiting-collaboration',
      'waiting-approval',
      'returned',
      'approved',
    ],
  },
  { id: 'new', labelKey: 'workspace.filterNew', statuses: ['new', 'received'] },
  {
    id: 'processing',
    labelKey: 'workspace.filterProcessing',
    statuses: ['processing', 'awaiting-clarification', 'awaiting-collaboration', 'returned'],
  },
  { id: 'waiting-approval', labelKey: 'workspace.filterApproval', statuses: ['waiting-approval', 'approved'] },
  { id: 'answered', labelKey: 'workspace.filterAnswered', statuses: ['answered'] },
  { id: 'closed', labelKey: 'workspace.filterClosed', statuses: ['published', 'closed', 'rejected'] },
];

/** Trạng thái đang mở (SLA / KPI) — gồm nhánh chờ bổ sung / phối hợp / trả sửa / đã duyệt chưa phát hành. */
export const WS_OPEN_STATUSES: DossierStatus[] = [
  'new',
  'received',
  'processing',
  'awaiting-clarification',
  'awaiting-collaboration',
  'waiting-approval',
  'returned',
  'approved',
];
export const WS_DONE_STATUSES: DossierStatus[] = ['answered', 'published', 'closed'];

/** Ngưỡng “sắp quá hạn” (giờ). */
export const WS_NEAR_DUE_HOURS = 48;

/** Năm chỉ số OPS-01. Bấm thẻ lọc danh sách bằng `?kpi=`, không đi qua tab trạng thái. */
export type WsKpiId = 'intake' | 'pending' | 'on-time' | 'near' | 'overdue';
export const WS_KPI_IDS: WsKpiId[] = ['intake', 'pending', 'on-time', 'near', 'overdue'];

/** Bộ lọc chung của Tổng quan: thời gian (yyyy-MM hoặc rỗng), đơn vị, lĩnh vực. */
export interface WsSlice {
  month: string;
  unit: string;
  topic: string;
}

/** Giá trị `?unit=` cho hồ sơ chưa gán đơn vị xử lý. */
export const WS_UNASSIGNED_UNIT = '__none__';

export interface WsKpiDef {
  id: WsKpiId;
  labelKey: string;
  hintKey: string;
  icon: string;
  tone: WsTone;
}

export const WS_KPIS: WsKpiDef[] = [
  { id: 'intake', labelKey: 'workspace.metricIntake', hintKey: 'workspace.kpiHintIntake', icon: 'folder', tone: 'blue' },
  { id: 'pending', labelKey: 'workspace.metricPending', hintKey: 'workspace.kpiHintPending', icon: 'clock', tone: 'amber' },
  { id: 'on-time', labelKey: 'workspace.metricOnTime', hintKey: 'workspace.kpiHintOnTime', icon: 'check-circle', tone: 'green' },
  { id: 'near', labelKey: 'workspace.metricNear', hintKey: 'workspace.kpiHintNear', icon: 'hourglass-end', tone: 'violet' },
  { id: 'overdue', labelKey: 'workspace.metricOverdue', hintKey: 'workspace.kpiHintOverdue', icon: 'exclamation', tone: 'red' },
];

/** Màu + icon (Flaticon rr) theo lĩnh vực. */
export const WS_TOPIC_VISUALS: Record<string, { icon: string; tone: WsTone }> = {
  tax: { icon: 'receipt', tone: 'blue' },
  budget: { icon: 'wallet', tone: 'green' },
  customs: { icon: 'box-open', tone: 'amber' },
  finance: { icon: 'building', tone: 'violet' },
  'public-assets': { icon: 'briefcase', tone: 'teal' },
  other: { icon: 'apps', tone: 'slate' },
};

/**
 * Phạm vi hồ sơ khớp ROLE_PERMISSIONS.scope:
 * `all` | `unit` (đúng `handlingUnitId`) | `assigned` (assignedTo) | `none`.
 * Tiếp nhận: thêm hồ sơ `new` / `received` / `rejected` (hàng chờ và quyết định tiếp nhận), kể cả chưa gán đơn vị.
 * Hồ sơ chưa gán đơn vị không hiện với lãnh đạo đơn vị khác.
 */
export type WsDataScope = 'all' | 'unit' | 'assigned' | 'none';

export const WS_ROLE_SCOPE: Record<UserRole, WsDataScope> = {
  public: 'none',
  reception: 'unit',
  specialist: 'assigned',
  leader: 'unit',
  coordinator: 'all',
  'system-admin': 'all',
};

