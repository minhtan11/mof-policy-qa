/**
 * Fixture sổ văn bản đến / mẫu trả lời nội bộ — dùng cho màn workspace G5
 * (van-ban-den, tai-lieu-noi-bo). Liên kết hồ sơ tùy chọn qua dossierId.
 */

export type IncomingDocStatus = 'new' | 'distributed' | 'processing' | 'done';

export interface IncomingDocRef {
  id: string;
  code: string;
  title: string;
  sender: string;
  receivedAt: string;
  status: IncomingDocStatus;
  /** Liên kết hồ sơ hỏi–đáp nếu có. */
  dossierId?: string;
  dossierCode?: string;
}

export interface AnswerTemplateRef {
  id: string;
  code: string;
  title: string;
  body: string;
  topicId: string;
  usageCount: number;
  active: boolean;
}

export const INCOMING_DOC_FIXTURES: IncomingDocRef[] = [
  {
    id: 'in-001',
    code: 'VBĐ-2026-0142',
    title: 'Công văn hỏi về hoàn thuế GTGT quý III/2026',
    sender: 'Công ty TNHH Minh Anh',
    receivedAt: '2026-10-12T09:20:00',
    status: 'distributed',
    dossierId: 'd-001',
    dossierCode: 'CSTC-2026-001284',
  },
  {
    id: 'in-002',
    code: 'VBĐ-2026-0158',
    title: 'Đề nghị hướng dẫn chính sách ưu đãi thuế thu nhập DN',
    sender: 'Sở Tài chính Hà Nội',
    receivedAt: '2026-10-15T14:05:00',
    status: 'processing',
    dossierId: 'd-002',
    dossierCode: 'CSTC-2026-001279',
  },
  {
    id: 'in-003',
    code: 'VBĐ-2026-0166',
    title: 'Văn bản chuyển tiếp câu hỏi về phí, lệ phí',
    sender: 'Văn phòng Chính phủ',
    receivedAt: '2026-10-18T08:40:00',
    status: 'new',
  },
  {
    id: 'in-004',
    code: 'VBĐ-2026-0171',
    title: 'Phản hồi bổ sung hồ sơ hỏi đáp chính sách hải quan',
    sender: 'Chi cục Hải quan cửa khẩu',
    receivedAt: '2026-10-19T11:15:00',
    status: 'done',
    dossierId: 'd-003',
    dossierCode: 'CSTC-2026-001261',
  },
];

/** Fallback khi catalog chưa có type answer-template. */
export const ANSWER_TEMPLATE_FIXTURES: AnswerTemplateRef[] = [
  {
    id: 'tpl-001',
    code: 'TPL-TAX-01',
    title: 'Mẫu trả lời hoàn thuế GTGT',
    body: 'Căn cứ Luật Quản lý thuế và các văn bản hướng dẫn…',
    topicId: 'tax',
    usageCount: 42,
    active: true,
  },
  {
    id: 'tpl-002',
    code: 'TPL-BUD-01',
    title: 'Mẫu trả lời ngân sách nhà nước',
    body: 'Theo quy định về quản lý ngân sách nhà nước…',
    topicId: 'budget',
    usageCount: 18,
    active: true,
  },
  {
    id: 'tpl-003',
    code: 'TPL-CUS-01',
    title: 'Mẫu trả lời thủ tục hải quan',
    body: 'Căn cứ Luật Hải quan và thông tư hướng dẫn…',
    topicId: 'customs',
    usageCount: 27,
    active: true,
  },
];
