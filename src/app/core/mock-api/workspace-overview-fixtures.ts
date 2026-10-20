import { DossierStatus, UserRole } from '../models/domain.models';

/**
 * Fixture cấu hình màn W-01 “Tổng quan công việc” (round 31). Dữ liệu hồ sơ vẫn lấy từ MockDbService
 * qua WorkspaceOverviewRepository; file này chỉ chứa định nghĩa tab, KPI, màu/biểu tượng lĩnh vực, phạm vi theo vai trò.
 */
export type WsTab = 'all' | 'new' | 'processing' | 'waiting-approval' | 'answered' | 'closed';
export type WsTone = 'blue' | 'amber' | 'violet' | 'green' | 'red' | 'teal' | 'slate';

/** Tab “Hồ sơ cần chú ý” → các trạng thái. `all` = đang mở. Giá trị khớp ?filter= của sidebar (R29). */
export const WS_TABS: { id: WsTab; labelKey: string; statuses: DossierStatus[] }[] = [
  { id: 'all', labelKey: 'workspace.filterAll', statuses: ['new', 'received', 'processing', 'waiting-approval'] },
  { id: 'new', labelKey: 'workspace.filterNew', statuses: ['new', 'received'] },
  { id: 'processing', labelKey: 'workspace.filterProcessing', statuses: ['processing'] },
  { id: 'waiting-approval', labelKey: 'workspace.filterApproval', statuses: ['waiting-approval'] },
  { id: 'answered', labelKey: 'workspace.filterAnswered', statuses: ['answered'] },
  { id: 'closed', labelKey: 'workspace.filterClosed', statuses: ['published', 'rejected'] },
];

export const WS_OPEN_STATUSES: DossierStatus[] = WS_TABS[0].statuses;
export const WS_DONE_STATUSES: DossierStatus[] = ['answered', 'published'];

/** Ngưỡng “sắp quá hạn” (giờ). */
export const WS_NEAR_DUE_HOURS = 48;

export interface WsKpiDef {
  id: 'intake' | 'processing' | 'approval' | 'on-time';
  labelKey: string;
  hintKey: string;
  icon: string;
  tone: WsTone;
  /** Tab đích khi bấm mũi tên. */
  tab: WsTab;
}

export const WS_KPIS: WsKpiDef[] = [
  { id: 'intake', labelKey: 'workspace.metricNew', hintKey: 'workspace.kpiHintIntake', icon: 'folder', tone: 'blue', tab: 'new' },
  { id: 'processing', labelKey: 'workspace.metricProcessing', hintKey: 'workspace.kpiHintProcessing', icon: 'clock', tone: 'amber', tab: 'processing' },
  { id: 'approval', labelKey: 'workspace.metricApproval', hintKey: 'workspace.kpiHintApproval', icon: 'user-check', tone: 'violet', tab: 'waiting-approval' },
  { id: 'on-time', labelKey: 'workspace.metricOnTime', hintKey: 'workspace.kpiHintOnTime', icon: 'check-circle', tone: 'green', tab: 'all' },
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
 * Phạm vi hồ sơ theo vai trò: `all` = toàn bộ; `assigned` = hồ sơ được giao cho chính cán bộ (assignedTo = tên).
 * Tiếp nhận thấy toàn bộ (cần tiếp nhận/phân công); chuyên viên chỉ thấy hồ sơ của mình.
 */
export const WS_ROLE_SCOPE: Record<UserRole, 'all' | 'assigned' | 'none'> = {
  public: 'none',
  reception: 'all',
  specialist: 'assigned',
  leader: 'all',
  coordinator: 'all',
  'system-admin': 'all',
};

/** Vai trò được tạo hồ sơ nội bộ (nút ở đầu thẻ hàng đợi). */
export const WS_CAN_CREATE: UserRole[] = ['reception', 'coordinator', 'system-admin'];
