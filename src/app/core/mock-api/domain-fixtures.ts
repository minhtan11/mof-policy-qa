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

/** 16 báo cáo bắt buộc — khớp dac-ta §XVII / UC-188..UC-203 */
export const REPORTS: ReportDefinition[] = [
  { id: 'r-01', code: 'RPT-01', name: 'Tổng hợp tình hình tiếp nhận và xử lý', description: 'Số lượng hồ sơ tiếp nhận và xử lý theo trạng thái trong kỳ.', category: 'operations' },
  { id: 'r-02', code: 'RPT-02', name: 'Tiến độ theo đơn vị', description: 'Khối lượng và tiến độ xử lý theo từng đơn vị chuyên môn.', category: 'operations' },
  { id: 'r-03', code: 'RPT-03', name: 'Tỷ lệ đúng hạn/quá hạn', description: 'Theo dõi tỷ lệ hồ sơ đúng hạn và quá hạn theo SLA.', category: 'sla' },
  { id: 'r-04', code: 'RPT-04', name: 'Phân loại theo lĩnh vực chính sách', description: 'Phân bổ câu hỏi theo lĩnh vực chính sách tài chính.', category: 'quality' },
  { id: 'r-05', code: 'RPT-05', name: 'Danh sách chưa trả lời', description: 'Hồ sơ còn mở, chưa có câu trả lời chính thức.', category: 'operations' },
  { id: 'r-06', code: 'RPT-06', name: 'Câu hỏi quá hạn', description: 'Danh sách và thống kê hồ sơ đã vượt hạn trả lời.', category: 'sla' },
  { id: 'r-07', code: 'RPT-07', name: 'Lịch sử luân chuyển', description: 'Số lần và bước luân chuyển hồ sơ trong quy trình.', category: 'audit' },
  { id: 'r-08', code: 'RPT-08', name: 'Câu hỏi bị trả lại/yêu cầu chỉnh sửa', description: 'Hồ sơ bị lãnh đạo trả sửa hoặc yêu cầu chỉnh sửa.', category: 'quality' },
  { id: 'r-09', code: 'RPT-09', name: 'Câu hỏi phức tạp và gia hạn', description: 'Hồ sơ phức tạp, phối hợp liên đơn vị và gia hạn SLA.', category: 'sla' },
  { id: 'r-10', code: 'RPT-10', name: 'Câu hỏi đã trả lời và xuất bản', description: 'Sản lượng câu trả lời đã trả lời / đã xuất bản công khai.', category: 'public' },
  { id: 'r-11', code: 'RPT-11', name: 'Chất lượng câu trả lời', description: 'Đánh giá sao và phản hồi chất lượng sau công khai.', category: 'quality' },
  { id: 'r-12', code: 'RPT-12', name: 'Tra cứu hỏi–đáp theo từ khóa', description: 'Lượt tra cứu và kết quả hỏi–đáp theo từ khóa mock.', category: 'public' },
  { id: 'r-13', code: 'RPT-13', name: 'Nguồn/kênh tiếp nhận', description: 'Phân bổ hồ sơ theo kênh tiếp nhận (cổng, email, giấy…).', category: 'operations' },
  { id: 'r-14', code: 'RPT-14', name: 'Người dùng gửi câu hỏi nhiều lần', description: 'Người gửi / email gửi lặp trong kỳ.', category: 'quality' },
  { id: 'r-15', code: 'RPT-15', name: 'Thống kê chuyên viên trả lời', description: 'Khối lượng hồ sơ theo chuyên viên được phân công.', category: 'operations' },
  { id: 'r-16', code: 'RPT-16', name: 'Thanh toán nhuận bút', description: 'Ước tính nhuận bút theo câu trả lời đã xuất bản (mock).', category: 'audit' },
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
  { id: 'cat-tpl-01', type: 'answer-template', code: 'TPL-TAX-01', label: 'Mẫu trả lời hoàn thuế GTGT', active: true, sortOrder: 1 },
  { id: 'cat-tpl-02', type: 'answer-template', code: 'TPL-BUD-01', label: 'Mẫu trả lời ngân sách nhà nước', active: true, sortOrder: 2 },
  { id: 'cat-tpl-03', type: 'answer-template', code: 'TPL-CUS-01', label: 'Mẫu trả lời thủ tục hải quan', active: true, sortOrder: 3 },
];
