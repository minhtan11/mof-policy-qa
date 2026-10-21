/**
 * Kho hỏi đáp công khai là phép chiếu từ bảng hồ sơ (`listedOnPortal` hoặc đã xuất bản).
 * Không có danh sách tiêu đề riêng.
 */
import { Dossier } from '../models/domain.models';
import { SEED_DOSSIERS } from './dossier-seed';

export type QaStatus = 'processing' | 'pending-approval' | 'answered';
export type QaType = 'policy' | 'procedure' | 'guidance' | 'feedback';

export interface PublicQa {
  id: string;
  code: string;
  title: string;
  topicId: string;
  type: QaType;
  status: QaStatus;
  postedAt: string;
  views: number;
  replies: number;
  /** Trích đoạn trả lời (khi đã trả lời). */
  answer?: string;
  /** Ghi chú trạng thái (đang xử lý / chờ phê duyệt). */
  note?: string;
}

export const QA_FIXTURE_NOW = '2026-10-20T12:00:00+07:00';
export const QA_TYPES: QaType[] = ['policy', 'procedure', 'guidance', 'feedback'];
export const QA_STATUSES: QaStatus[] = ['processing', 'answered', 'pending-approval'];

export function dossierToPublicQa(dossier: Dossier): PublicQa | null {
  if (!dossier.listedOnPortal && !dossier.isPublic) return null;
  const status: QaStatus =
    dossier.status === 'published' || dossier.status === 'answered' || dossier.status === 'closed'
      ? 'answered'
      : dossier.status === 'waiting-approval' || dossier.status === 'approved'
        ? 'pending-approval'
        : 'processing';
  const text = dossier.answer?.trim();
  return {
    id: dossier.id,
    code: dossier.code,
    title: dossier.question,
    topicId: dossier.topicId,
    type: dossier.portalType ?? 'policy',
    status,
    postedAt: dossier.receivedAt,
    views: dossier.portalViews ?? 0,
    replies: dossier.portalReplies ?? 0,
    ...(status === 'answered' ? { answer: text } : text ? { note: text } : {}),
  };
}

/** Ảnh chụp seed — màn hình đọc qua `PublicQaRepository` trên MockDb để thấy hồ sơ vừa xuất bản. */
export const PUBLIC_QA: PublicQa[] = SEED_DOSSIERS.map(dossierToPublicQa).filter((row): row is PublicQa => row !== null);
