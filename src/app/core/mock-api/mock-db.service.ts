import { Injectable, signal } from '@angular/core';
import { TOPICS, USERS } from './demo-data';
import { SEED_DOSSIERS } from './dossier-seed';
import {
  Dossier,
  DossierAuditNote,
  DossierClarification,
  DossierCollaboration,
  DossierRating,
  DossierStatus,
} from '../models/domain.models';

export { SEED_DOSSIERS };

const STORAGE_KEY = 'mof-policy-qa.dossiers.v3';
/** Bản seed cũ. Khi nâng cấp chỉ giữ hồ sơ người dùng tự gửi (id không thuộc seed mới). */
const LEGACY_STORAGE_KEYS = ['mof-policy-qa.dossiers.v2', 'mof-policy-qa.dossiers.v1'];
const LAST_EMAIL_KEY = 'mof-policy-qa.last-sender-email.v1';

export interface InternalSearchFilter {
  query?: string;
  status?: DossierStatus | 'all';
  topicId?: string | 'all';
  sla?: 'all' | 'on-time' | 'near' | 'overdue';
}

@Injectable({ providedIn: 'root' })
export class MockDbService {
  readonly dossiers = signal<Dossier[]>(this.load());
  readonly topics = TOPICS;

  createDossier(
    input: Pick<Dossier, 'question' | 'topicId' | 'sender' | 'senderEmail' | 'organization' | 'attachments'> & {
      priority?: Dossier['priority'];
    },
  ): Dossier {
    const now = new Date();
    const dossier: Dossier = {
      id: crypto.randomUUID(),
      code: `CSTC-${now.getFullYear()}-${String(this.dossiers().length + 1285).padStart(6, '0')}`,
      question: input.question,
      topicId: input.topicId,
      sender: input.sender,
      senderEmail: input.senderEmail,
      organization: input.organization,
      attachments: input.attachments,
      receivedAt: now.toISOString(),
      dueAt: new Date(now.getTime() + 7 * 86_400_000).toISOString(),
      status: 'new',
      priority: input.priority ?? 'normal',
      intakeChannel: 'portal',
      listedOnPortal: false,
      legalBasis: [],
      isPublic: false,
      answer: '',
      ratings: [],
      clarifications: [],
      timeline: [
        {
          at: now.toLocaleString('vi-VN'),
          title: 'Tiếp nhận câu hỏi',
          description: 'Hệ thống đã ghi nhận hồ sơ của bạn.',
          actor: 'Hệ thống',
          state: 'current',
        },
      ],
    };
    this.commit([dossier, ...this.dossiers()]);
    localStorage.setItem(LAST_EMAIL_KEY, input.senderEmail.trim().toLowerCase());
    return dossier;
  }

  findSimilar(question: string, topicId: string, limit = 3): Dossier[] {
    const tokens = question
      .toLocaleLowerCase()
      .split(/\s+/)
      .map((token) => token.trim())
      .filter((token) => token.length >= 3);
    return this.dossiers()
      .filter((item) => item.isPublic && item.answer)
      .map((item) => {
        const hay = `${item.question} ${item.answer}`.toLocaleLowerCase();
        const score =
          (item.topicId === topicId ? 2 : 0) + tokens.reduce((sum, token) => sum + (hay.includes(token) ? 1 : 0), 0);
        return { item, score };
      })
      .filter((row) => row.score > 0)
      .sort((a, b) => b.score - a.score)
      .slice(0, limit)
      .map((row) => row.item);
  }

  dossiersByEmail(email: string): Dossier[] {
    const key = email.trim().toLowerCase();
    if (!key) {
      return [];
    }
    return this.dossiers().filter((item) => item.senderEmail.toLowerCase() === key);
  }

  findByCode(code: string): Dossier | undefined {
    const key = code.trim().toUpperCase();
    return this.dossiers().find((item) => item.code.toUpperCase() === key);
  }

  lastSenderEmail(): string {
    return localStorage.getItem(LAST_EMAIL_KEY) ?? '';
  }

  addRating(dossierId: string, stars: number, comment: string): DossierRating | null {
    const rating: DossierRating = {
      id: crypto.randomUUID(),
      stars: Math.min(5, Math.max(1, Math.round(stars))),
      comment: comment.trim(),
      at: new Date().toISOString(),
    };
    let saved: DossierRating | null = null;
    this.commit(
      this.dossiers().map((item) => {
        if (item.id !== dossierId || !item.isPublic) {
          return item;
        }
        saved = rating;
        return { ...item, ratings: [...(item.ratings ?? []), rating] };
      }),
    );
    return saved;
  }

  addClarification(dossierId: string, text: string): DossierClarification | null {
    const clarification: DossierClarification = {
      id: crypto.randomUUID(),
      text: text.trim(),
      at: new Date().toISOString(),
      status: 'open',
    };
    if (!clarification.text) {
      return null;
    }
    let saved: DossierClarification | null = null;
    this.commit(
      this.dossiers().map((item) => {
        if (item.id !== dossierId) {
          return item;
        }
        saved = clarification;
        return {
          ...item,
          clarifications: [...(item.clarifications ?? []), clarification],
          timeline: [
            ...item.timeline.map((event) => ({
              ...event,
              state: event.state === 'current' ? ('done' as const) : event.state,
            })),
            {
              at: new Date().toLocaleString('vi-VN'),
              title: 'Yêu cầu làm rõ',
              description: 'Người hỏi đã gửi yêu cầu làm rõ nội dung trả lời.',
              actor: 'Người hỏi',
              state: 'current' as const,
            },
          ],
        };
      }),
    );
    return saved;
  }

  updateStatus(id: string, status: DossierStatus, actor: string, title: string, description: string): void {
    this.commit(
      this.dossiers().map((item) =>
        item.id === id
          ? {
              ...item,
              status,
              isPublic: status === 'published' ? true : status === 'answered' && item.status === 'published' ? false : item.isPublic,
              timeline: [
                ...item.timeline.map((event) => ({
                  ...event,
                  state: event.state === 'current' ? ('done' as const) : event.state,
                })),
                { at: new Date().toLocaleString('vi-VN'), title, description, actor, state: 'current' as const },
              ],
            }
          : item,
      ),
    );
  }

  /** Thu hồi công khai — ẩn cổng, giữ timeline / ratings. */
  recall(id: string, actor: string, reason: string): boolean {
    const target = this.dossiers().find((item) => item.id === id);
    if (!target || target.status !== 'published' || !target.isPublic) {
      return false;
    }
    this.updateStatus(
      id,
      'answered',
      actor,
      'Thu hồi công khai',
      reason.trim() || 'Đã thu hồi hiển thị công khai, giữ lịch sử nội bộ.',
    );
    return true;
  }

  requestCollaboration(
    id: string,
    input: { unitId: string; unitName: string; note: string; dueAt: string; requestedBy: string },
  ): DossierCollaboration | null {
    const target = this.dossiers().find((item) => item.id === id);
    if (!target || target.status !== 'processing' || !input.unitId || !input.note.trim()) {
      return null;
    }
    const collab: DossierCollaboration = {
      id: crypto.randomUUID(),
      unitId: input.unitId,
      unitName: input.unitName,
      note: input.note.trim(),
      dueAt: input.dueAt,
      status: 'open',
      requestedBy: input.requestedBy,
      at: new Date().toISOString(),
    };
    this.commit(
      this.dossiers().map((item) =>
        item.id === id
          ? {
              ...item,
              status: 'awaiting-collaboration' as const,
              handlingUnitId: input.unitId,
              collaborations: [...(item.collaborations ?? []), collab],
              timeline: [
                ...item.timeline.map((event) => ({
                  ...event,
                  state: event.state === 'current' ? ('done' as const) : event.state,
                })),
                {
                  at: new Date().toLocaleString('vi-VN'),
                  title: 'Yêu cầu phối hợp',
                  description: `Gửi ${input.unitName}: ${collab.note}`,
                  actor: input.requestedBy,
                  state: 'current' as const,
                },
              ],
            }
          : item,
      ),
    );
    return collab;
  }

  addAuditNote(id: string, text: string, actor: string): DossierAuditNote | null {
    const noteText = text.trim();
    if (!noteText || !this.dossiers().some((item) => item.id === id)) {
      return null;
    }
    const note: DossierAuditNote = {
      id: crypto.randomUUID(),
      text: noteText,
      actor,
      at: new Date().toISOString(),
    };
    this.commit(
      this.dossiers().map((item) =>
        item.id === id ? { ...item, auditNotes: [...(item.auditNotes ?? []), note] } : item,
      ),
    );
    return note;
  }

  searchInternal(filter: InternalSearchFilter = {}): Dossier[] {
    const query = (filter.query ?? '').trim().toLocaleLowerCase();
    const now = Date.now();
    return this.dossiers().filter((item) => {
      if (filter.status && filter.status !== 'all' && item.status !== filter.status) {
        return false;
      }
      if (filter.topicId && filter.topicId !== 'all' && item.topicId !== filter.topicId) {
        return false;
      }
      if (query) {
        const hay = `${item.code} ${item.question} ${item.organization} ${item.assignedTo ?? ''}`.toLocaleLowerCase();
        if (!hay.includes(query)) {
          return false;
        }
      }
      if (filter.sla && filter.sla !== 'all') {
        const hours = (new Date(item.dueAt).getTime() - now) / 3_600_000;
        if (filter.sla === 'overdue' && !(hours < 0 && item.status !== 'published')) {
          return false;
        }
        if (filter.sla === 'near' && !(hours >= 0 && hours <= 48 && item.status !== 'published')) {
          return false;
        }
        if (filter.sla === 'on-time' && !(hours > 48 || item.status === 'published')) {
          return false;
        }
      }
      return true;
    });
  }

  /** Reset seed demo — xóa persistence hồ sơ về dữ liệu gốc. */
  resetSeed(): void {
    localStorage.removeItem(STORAGE_KEY);
    for (const key of LEGACY_STORAGE_KEYS) localStorage.removeItem(key);
    localStorage.removeItem(LAST_EMAIL_KEY);
    this.dossiers.set(structuredClone(SEED_DOSSIERS));
  }

  /** Tiếp nhận / phân công chuyên viên — chuyển sang processing và ghi assignee + đơn vị. */
  assign(id: string, assigneeName: string, actor: string, handlingUnitId?: string): boolean {
    const target = this.dossiers().find((item) => item.id === id);
    if (!target || !['new', 'received'].includes(target.status) || !assigneeName.trim()) {
      return false;
    }
    const name = assigneeName.trim();
    const officer = USERS.find((user) => user.name === name);
    this.commit(
      this.dossiers().map((item) =>
        item.id === id
          ? {
              ...item,
              status: 'processing' as const,
              assignedTo: name,
              assigneeId: officer?.id ?? item.assigneeId,
              handlingUnitId: handlingUnitId ?? officer?.organizationId ?? item.handlingUnitId,
              timeline: [
                ...item.timeline.map((event) => ({
                  ...event,
                  state: event.state === 'current' ? ('done' as const) : event.state,
                })),
                {
                  at: new Date().toLocaleString('vi-VN'),
                  title: 'Phân công xử lý',
                  description: `Đã giao hồ sơ cho ${name}.`,
                  actor,
                  state: 'current' as const,
                },
              ],
            }
          : item,
      ),
    );
    return true;
  }

  /** Cán bộ yêu cầu người hỏi bổ sung thông tin — UC chờ bổ sung. */
  requestClarification(id: string, text: string, actor: string): DossierClarification | null {
    const target = this.dossiers().find((item) => item.id === id);
    if (!target || target.status !== 'processing' || !text.trim()) {
      return null;
    }
    const clarification: DossierClarification = {
      id: crypto.randomUUID(),
      text: text.trim(),
      at: new Date().toISOString(),
      status: 'open',
    };
    this.commit(
      this.dossiers().map((item) =>
        item.id === id
          ? {
              ...item,
              status: 'awaiting-clarification' as const,
              clarifications: [...(item.clarifications ?? []), clarification],
              timeline: [
                ...item.timeline.map((event) => ({
                  ...event,
                  state: event.state === 'current' ? ('done' as const) : event.state,
                })),
                {
                  at: new Date().toLocaleString('vi-VN'),
                  title: 'Yêu cầu bổ sung thông tin',
                  description: clarification.text,
                  actor,
                  state: 'current' as const,
                },
              ],
            }
          : item,
      ),
    );
    return clarification;
  }

  updateAnswer(id: string, answer: string, legalBasis: string[]): void {
    this.commit(this.dossiers().map((item) => (item.id === id ? { ...item, answer, legalBasis } : item)));
  }

  activeQueue(filter: DossierStatus | 'all' = 'all'): Dossier[] {
    const items = this.dossiers().filter((item) => item.status !== 'published');
    if (filter === 'all') {
      return items;
    }
    return items.filter((item) => item.status === filter);
  }

  /** Hộp phối hợp: mọi yêu cầu còn mở (hoặc lọc theo trạng thái collab). */
  listCollaborations(status: 'all' | 'open' | 'done' = 'open'): Array<{
    dossier: Dossier;
    collaboration: DossierCollaboration;
  }> {
    const rows: Array<{ dossier: Dossier; collaboration: DossierCollaboration }> = [];
    for (const dossier of this.dossiers()) {
      for (const collaboration of dossier.collaborations ?? []) {
        if (status !== 'all' && collaboration.status !== status) continue;
        rows.push({ dossier, collaboration });
      }
    }
    return rows.sort(
      (a, b) =>
        a.collaboration.dueAt.localeCompare(b.collaboration.dueAt) ||
        a.dossier.code.localeCompare(b.dossier.code),
    );
  }

  private load(): Dossier[] {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      return JSON.parse(saved) as Dossier[];
    }
    const seed = structuredClone(SEED_DOSSIERS);
    const seedIds = new Set(seed.map((d) => d.id));
    for (const key of LEGACY_STORAGE_KEYS) {
      const legacy = localStorage.getItem(key);
      if (!legacy) continue;
      const old = JSON.parse(legacy) as Dossier[];
      return [...old.filter((d) => !seedIds.has(d.id)), ...seed];
    }
    return seed;
  }

  private commit(value: Dossier[]): void {
    this.dossiers.set(value);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(value));
  }
}
