import { AiSuggestion, CatalogEntry, LegalDocument, ReportDefinition, WorkflowDefinition } from '../models/domain.models';

export const LEGAL_DOCUMENTS: LegalDocument[] = [
  { id: 'law-001', code: '38/2019/QH14', title: 'Luật Quản lý thuế', issuer: 'Quốc hội', issuedAt: '2019-06-13', effectiveFrom: '2020-07-01', status: 'effective', version: 1, chapters: 10, source: 'synced' },
  { id: 'law-002', code: '126/2020/NĐ-CP', title: 'Quy định chi tiết một số điều của Luật Quản lý thuế', issuer: 'Chính phủ', issuedAt: '2020-10-19', effectiveFrom: '2020-12-05', status: 'effective', version: 2, chapters: 8, source: 'synced' },
  { id: 'law-003', code: '80/2021/TT-BTC', title: 'Hướng dẫn thi hành một số điều của Luật Quản lý thuế', issuer: 'Bộ Tài chính', issuedAt: '2021-09-29', effectiveFrom: '2022-01-01', status: 'effective', version: 1, chapters: 12, source: 'manual' },
  { id: 'law-004', code: '98/2025/TT-BTC', title: 'Thông tư sửa đổi, bổ sung quy định về hoàn thuế', issuer: 'Bộ Tài chính', issuedAt: '2025-12-20', effectiveFrom: '2026-02-15', status: 'draft', version: 1, chapters: 5, source: 'manual' },
];

export const WORKFLOWS: WorkflowDefinition[] = [{ id: 'wf-standard', name: 'Quy trình hỏi đáp chính sách chuẩn', version: 3, status: 'active', slaDays: 7, updatedAt: '2026-10-18', steps: [{ id: 'receive', name: 'Tiếp nhận', role: 'reception', required: true }, { id: 'process', name: 'Xử lý chuyên môn', role: 'specialist', required: true }, { id: 'approve', name: 'Phê duyệt', role: 'leader', required: true }, { id: 'publish', name: 'Phát hành', role: 'coordinator', required: true }] }];

export const AI_SUGGESTIONS: AiSuggestion[] = [{ id: 'ai-001', dossierId: 'd-001', kind: 'classification', value: 'Thuế', confidence: .94, status: 'suggested', model: 'mof-classifier-v1' }, { id: 'ai-002', dossierId: 'd-001', kind: 'legal-basis', value: 'Luật Quản lý thuế số 38/2019/QH14', confidence: .89, status: 'suggested', model: 'mof-legal-v1' }];

export const REPORTS: ReportDefinition[] = [
  { id: 'r-01', code: 'RPT-01', name: 'Tổng hợp tiếp nhận và xử lý', description: 'Số lượng hồ sơ theo trạng thái, đơn vị và thời gian.', category: 'operations' },
  { id: 'r-02', code: 'RPT-02', name: 'Tỷ lệ đúng hạn/quá hạn', description: 'Theo dõi SLA và cảnh báo hồ sơ quá hạn.', category: 'sla' },
  { id: 'r-03', code: 'RPT-03', name: 'Phân loại theo lĩnh vực', description: 'Phân bổ câu hỏi theo chính sách tài chính.', category: 'quality' },
  { id: 'r-04', code: 'RPT-04', name: 'Câu hỏi đã trả lời và công khai', description: 'Sản lượng phát hành câu trả lời theo kỳ.', category: 'public' },
];

export const CATALOG_ENTRIES: CatalogEntry[] = [
  { id: 'cat-01', type: 'priority', code: 'NORMAL', label: 'Bình thường', active: true, sortOrder: 1 },
  { id: 'cat-02', type: 'priority', code: 'HIGH', label: 'Ưu tiên', active: true, sortOrder: 2 },
  { id: 'cat-03', type: 'priority', code: 'URGENT', label: 'Khẩn cấp', active: true, sortOrder: 3 },
  { id: 'cat-04', type: 'intake-method', code: 'VNEID', label: 'VNeID', active: true, sortOrder: 1 },
  { id: 'cat-05', type: 'intake-method', code: 'PORTAL', label: 'Cổng công khai', active: true, sortOrder: 2 },
];
