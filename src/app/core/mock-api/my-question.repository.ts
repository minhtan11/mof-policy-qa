import { Injectable, inject } from '@angular/core';
import { Dossier, DossierStatus } from '../models/domain.models';
import { MockDbService } from './mock-db.service';

/** Nhóm trạng thái người dân thấy (gộp trạng thái nội bộ). */
export type MineStatus = 'processing' | 'waiting' | 'answered' | 'rejected';
export const MINE_STATUSES: MineStatus[] = ['processing', 'waiting', 'answered', 'rejected'];
export type MineSort = 'newest' | 'oldest' | 'due';
export const MINE_SORTS: MineSort[] = ['newest', 'oldest', 'due'];
/** Tình trạng hạn: done = đã xong (hiện “-”), overdue = quá hạn, near = còn ≤ 48 giờ, ok = còn hạn. */
export type MineDue = 'done' | 'overdue' | 'near' | 'ok';

export interface MineRow {
  id: string;
  code: string;
  question: string;
  topicId: string;
  topicName: string;
  status: MineStatus;
  rawStatus: DossierStatus;
  receivedAt: string;
  dueAt: string;
  due: MineDue;
}

export interface MineQuery {
  status: MineStatus | null;
  topic: string | null;
  sort: MineSort;
}

const NEAR_MS = 48 * 3_600_000;

export function mineStatus(s: DossierStatus): MineStatus {
  if (s === 'waiting-approval' || s === 'approved') return 'waiting';
  if (s === 'answered' || s === 'published' || s === 'closed') return 'answered';
  if (s === 'rejected') return 'rejected';
  return 'processing';
}

export function dueState(status: MineStatus, dueAt: string, now: number): MineDue {
  if (status === 'answered' || status === 'rejected') return 'done';
  const left = new Date(dueAt).getTime() - now;
  return left < 0 ? 'overdue' : left <= NEAR_MS ? 'near' : 'ok';
}

/** Lọc + sắp xếp thuần (không I/O) — dùng chung component + spec. */
export function queryMine(rows: MineRow[], q: MineQuery): MineRow[] {
  const out = rows.filter((r) => (!q.status || r.status === q.status) && (!q.topic || r.topicId === q.topic));
  const t = (iso: string) => new Date(iso).getTime();
  if (q.sort === 'oldest') return out.sort((a, b) => t(a.receivedAt) - t(b.receivedAt));
  if (q.sort === 'due') {
    // Hồ sơ còn mở theo hạn gần nhất trước; hồ sơ đã xong xuống cuối (mới nhất trước).
    return out.sort((a, b) => {
      const da = a.due === 'done', db = b.due === 'done';
      if (da !== db) return da ? 1 : -1;
      return da ? t(b.receivedAt) - t(a.receivedAt) : t(a.dueAt) - t(b.dueAt);
    });
  }
  return out.sort((a, b) => t(b.receivedAt) - t(a.receivedAt));
}

/**
 * Repository “Câu hỏi của tôi” (PUB-03, UC-110/UC-122) — đọc MockDbService (signal) nên hồ sơ vừa gửi
 * qua “Gửi câu hỏi” hiện ngay. Phạm vi: chỉ đúng senderEmail.
 */
@Injectable({ providedIn: 'root' })
export class MyQuestionRepository {
  private readonly db = inject(MockDbService);
  readonly topics = this.db.topics;
  /** Đồng hồ (ghi đè trong spec). */
  now: () => number = () => Date.now();

  rows(email: string): MineRow[] {
    const now = this.now();
    return this.db.dossiersByEmail(email).map((d: Dossier) => {
      const status = mineStatus(d.status);
      return {
        id: d.id,
        code: d.code,
        question: d.question,
        topicId: d.topicId,
        topicName: this.topicName(d.topicId),
        status,
        rawStatus: d.status,
        receivedAt: d.receivedAt,
        dueAt: d.dueAt,
        due: dueState(status, d.dueAt, now),
      };
    });
  }

  topicName(id: string): string {
    return this.topics.find((t) => t.id === id)?.name ?? '';
  }

  lastSenderEmail(): string {
    return this.db.lastSenderEmail();
  }
}
