/**
 * Kiểu sổ văn bản đến và mẫu trả lời nội bộ.
 * Dòng sổ đến được ghép từ `INCOMING_LINKS` + bảng hồ sơ trong `IncomingDocsRepository`.
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
