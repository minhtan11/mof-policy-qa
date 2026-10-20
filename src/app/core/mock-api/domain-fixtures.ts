import {
  AdminAccount,
  AiModelInfo,
  AiSuggestion,
  BackupSnapshot,
  CatalogEntry,
  LegalDocument,
  OpsJob,
  OrganizationUnit,
  ReportDefinition,
  RolePermissionRow,
  WorkflowDefinition,
} from '../models/domain.models';

export const ORGANIZATIONS: OrganizationUnit[] = [
  {
    id: 'org-mof',
    code: 'MOF',
    name: 'Bộ Tài chính',
    parentId: null,
    intakeTopicIds: [],
    active: true,
  },
  {
    id: 'org-vp',
    code: 'VP',
    name: 'Văn phòng Bộ',
    parentId: 'org-mof',
    intakeTopicIds: ['other'],
    active: true,
  },
  {
    id: 'org-tax',
    code: 'CST',
    name: 'Vụ Chính sách thuế',
    parentId: 'org-mof',
    intakeTopicIds: ['tax'],
    active: true,
  },
  {
    id: 'org-budget',
    code: 'NS',
    name: 'Vụ Ngân sách nhà nước',
    parentId: 'org-mof',
    intakeTopicIds: ['budget'],
    active: true,
  },
  {
    id: 'org-coord',
    code: 'TD',
    name: 'Tổ điều phối hỏi đáp',
    parentId: 'org-vp',
    intakeTopicIds: ['tax', 'budget', 'customs', 'finance', 'public-assets', 'other'],
    active: true,
  },
  {
    id: 'org-ict',
    code: 'CNTT',
    name: 'Trung tâm Công nghệ thông tin',
    parentId: 'org-mof',
    intakeTopicIds: [],
    active: true,
  },
];

export const ADMIN_ACCOUNTS: AdminAccount[] = [
  {
    id: 'u-reception',
    name: 'Trần Thu Hà',
    email: 'ha.tt@mof.gov.vn',
    organizationId: 'org-vp',
    role: 'reception',
    active: true,
    avatar: 'TH',
  },
  {
    id: 'u-specialist',
    name: 'Lê Quốc Hưng',
    email: 'hung.lq@mof.gov.vn',
    organizationId: 'org-tax',
    role: 'specialist',
    active: true,
    avatar: 'LH',
  },
  {
    id: 'u-leader',
    name: 'Phạm Đức Long',
    email: 'long.pd@mof.gov.vn',
    organizationId: 'org-tax',
    role: 'leader',
    active: true,
    avatar: 'PL',
  },
  {
    id: 'u-coordinator',
    name: 'Đỗ Bích Ngọc',
    email: 'ngoc.db@mof.gov.vn',
    organizationId: 'org-coord',
    role: 'coordinator',
    active: true,
    avatar: 'BN',
  },
  {
    id: 'u-admin',
    name: 'Quản trị hệ thống',
    email: 'admin@mof.gov.vn',
    organizationId: 'org-ict',
    role: 'system-admin',
    active: true,
    avatar: 'QT',
  },
];

export const ROLE_PERMISSIONS: RolePermissionRow[] = [
  {
    role: 'reception',
    permissions: ['dossier.view', 'dossier.receive', 'dossier.assign'],
    scope: 'unit',
  },
  {
    role: 'specialist',
    permissions: ['dossier.view', 'dossier.draft', 'dossier.submit'],
    scope: 'assigned',
  },
  {
    role: 'leader',
    permissions: ['dossier.view', 'dossier.approve', 'dossier.return', 'dossier.publish'],
    scope: 'unit',
  },
  {
    role: 'coordinator',
    permissions: ['dossier.view', 'dossier.receive', 'dossier.assign', 'dossier.publish', 'report.view'],
    scope: 'all',
  },
  {
    role: 'system-admin',
    permissions: ['admin.*', 'catalog.*', 'workflow.*', 'legal.*', 'report.*', 'user.*'],
    scope: 'all',
  },
];

export const LEGAL_DOCUMENTS: LegalDocument[] = [
  { id: 'law-001', code: '38/2019/QH14', title: 'Luật Quản lý thuế', issuer: 'Quốc hội', issuedAt: '2019-06-13', effectiveFrom: '2020-07-01', status: 'effective', version: 1, chapters: 10, source: 'synced' },
  { id: 'law-002', code: '126/2020/NĐ-CP', title: 'Quy định chi tiết một số điều của Luật Quản lý thuế', issuer: 'Chính phủ', issuedAt: '2020-10-19', effectiveFrom: '2020-12-05', status: 'effective', version: 2, chapters: 8, source: 'synced' },
  { id: 'law-003', code: '80/2021/TT-BTC', title: 'Hướng dẫn thi hành một số điều của Luật Quản lý thuế', issuer: 'Bộ Tài chính', issuedAt: '2021-09-29', effectiveFrom: '2022-01-01', status: 'effective', version: 1, chapters: 12, source: 'manual' },
  { id: 'law-004', code: '98/2025/TT-BTC', title: 'Thông tư sửa đổi, bổ sung quy định về hoàn thuế', issuer: 'Bộ Tài chính', issuedAt: '2025-12-20', effectiveFrom: '2026-02-15', status: 'draft', version: 1, chapters: 5, source: 'manual' },
];

export const WORKFLOWS: WorkflowDefinition[] = [{ id: 'wf-standard', name: 'Quy trình hỏi đáp chính sách chuẩn', version: 3, status: 'active', slaDays: 7, updatedAt: '2026-10-18', steps: [{ id: 'receive', name: 'Tiếp nhận', role: 'reception', required: true }, { id: 'process', name: 'Xử lý chuyên môn', role: 'specialist', required: true }, { id: 'approve', name: 'Phê duyệt', role: 'leader', required: true }, { id: 'publish', name: 'Phát hành', role: 'coordinator', required: true }] }];

export const AI_SUGGESTIONS: AiSuggestion[] = [{ id: 'ai-001', dossierId: 'd-001', kind: 'classification', value: 'Thuế', confidence: .94, status: 'suggested', model: 'mof-classifier-v1' }, { id: 'ai-002', dossierId: 'd-001', kind: 'legal-basis', value: 'Luật Quản lý thuế số 38/2019/QH14', confidence: .89, status: 'suggested', model: 'mof-legal-v1' }];

/** 16 báo cáo bắt buộc P2 — UC-188..UC-203 */
export const REPORTS: ReportDefinition[] = [
  { id: 'r-01', code: 'RPT-01', name: 'Tổng hợp tiếp nhận và xử lý', description: 'Số lượng hồ sơ theo trạng thái, đơn vị và thời gian.', category: 'operations' },
  { id: 'r-02', code: 'RPT-02', name: 'Tỷ lệ đúng hạn/quá hạn', description: 'Theo dõi SLA và cảnh báo hồ sơ quá hạn.', category: 'sla' },
  { id: 'r-03', code: 'RPT-03', name: 'Phân loại theo lĩnh vực', description: 'Phân bổ câu hỏi theo chính sách tài chính.', category: 'quality' },
  { id: 'r-04', code: 'RPT-04', name: 'Câu hỏi đã trả lời và công khai', description: 'Sản lượng phát hành câu trả lời theo kỳ.', category: 'public' },
  { id: 'r-05', code: 'RPT-05', name: 'Hiệu suất theo đơn vị', description: 'Khối lượng và thời gian xử lý trung bình theo đơn vị.', category: 'operations' },
  { id: 'r-06', code: 'RPT-06', name: 'Hồ sơ trả sửa', description: 'Số lần lãnh đạo trả sửa và lý do phổ biến.', category: 'quality' },
  { id: 'r-07', code: 'RPT-07', name: 'Đánh giá người hỏi', description: 'Điểm trung bình và phân bố sao sau công khai.', category: 'public' },
  { id: 'r-08', code: 'RPT-08', name: 'Yêu cầu làm rõ', description: 'Số yêu cầu làm rõ mở / đã trả lời.', category: 'quality' },
  { id: 'r-09', code: 'RPT-09', name: 'Phối hợp liên đơn vị', description: 'Yêu cầu phối hợp theo trạng thái và hạn.', category: 'operations' },
  { id: 'r-10', code: 'RPT-10', name: 'SLA tiếp nhận / phân công', description: 'Thời gian từ tiếp nhận đến phân công.', category: 'sla' },
  { id: 'r-11', code: 'RPT-11', name: 'SLA soạn thảo', description: 'Thời gian từ phân công đến trình duyệt.', category: 'sla' },
  { id: 'r-12', code: 'RPT-12', name: 'SLA phê duyệt', description: 'Thời gian chờ lãnh đạo phê duyệt.', category: 'sla' },
  { id: 'r-13', code: 'RPT-13', name: 'Thu hồi công khai', description: 'Số lần thu hồi và lý do.', category: 'audit' },
  { id: 'r-14', code: 'RPT-14', name: 'Sử dụng gợi ý AI', description: 'Tỷ lệ chấp nhận / từ chối gợi ý.', category: 'quality' },
  { id: 'r-15', code: 'RPT-15', name: 'Audit thao tác nội bộ', description: 'Nhật ký bút phê và thao tác nhạy cảm.', category: 'audit' },
  { id: 'r-16', code: 'RPT-16', name: 'Tồn kho theo ưu tiên', description: 'Hồ sơ mở phân theo mức ưu tiên.', category: 'operations' },
];

export const OPS_JOBS: OpsJob[] = [
  { id: 'job-backup', name: 'Sao lưu mock DB', schedule: '0 2 * * *', lastRunAt: '2026-10-19T02:00:00', status: 'success' },
  { id: 'job-index', name: 'Tái chỉ mục tìm kiếm', schedule: '0 */6 * * *', lastRunAt: '2026-10-20T06:00:00', status: 'success' },
  { id: 'job-sla', name: 'Quét cảnh báo SLA', schedule: '*/30 * * * *', lastRunAt: '2026-10-20T10:30:00', status: 'idle' },
  { id: 'job-notify', name: 'Gửi thông báo mock', schedule: '*/15 * * * *', lastRunAt: '2026-10-20T10:15:00', status: 'idle' },
];

export const BACKUP_SNAPSHOTS: BackupSnapshot[] = [
  { id: 'bk-001', label: 'Seed ban đầu', createdAt: '2026-10-15T08:00:00', sizeLabel: '128 KB' },
  { id: 'bk-002', label: 'Trước demo G3', createdAt: '2026-10-19T18:00:00', sizeLabel: '146 KB' },
];

export const AI_MODELS: AiModelInfo[] = [
  { id: 'mdl-1', name: 'mof-classifier-v1', purpose: 'Phân loại lĩnh vực', version: '1.2.0', status: 'online' },
  { id: 'mdl-2', name: 'mof-legal-v1', purpose: 'Gợi ý căn cứ pháp lý', version: '1.0.4', status: 'online' },
  { id: 'mdl-3', name: 'mof-summary-v1', purpose: 'Tóm tắt hồ sơ', version: '0.9.1', status: 'degraded' },
  { id: 'mdl-4', name: 'mof-ocr-stub', purpose: 'OCR đính kèm (mock)', version: '0.1.0', status: 'offline' },
];

export const CATALOG_ENTRIES: CatalogEntry[] = [
  { id: 'cat-01', type: 'priority', code: 'NORMAL', label: 'Bình thường', active: true, sortOrder: 1 },
  { id: 'cat-02', type: 'priority', code: 'HIGH', label: 'Ưu tiên', active: true, sortOrder: 2 },
  { id: 'cat-03', type: 'priority', code: 'URGENT', label: 'Khẩn cấp', active: true, sortOrder: 3 },
  { id: 'cat-04', type: 'intake-method', code: 'VNEID', label: 'VNeID', active: true, sortOrder: 1 },
  { id: 'cat-05', type: 'intake-method', code: 'PORTAL', label: 'Cổng công khai', active: true, sortOrder: 2 },
];
