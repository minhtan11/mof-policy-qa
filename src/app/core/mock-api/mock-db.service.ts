import { Injectable, signal } from '@angular/core';
import { DOSSIERS, TOPICS } from './demo-data';
import { Dossier, DossierStatus } from '../models/domain.models';

const STORAGE_KEY = 'mof-policy-qa.dossiers.v1';

@Injectable({ providedIn: 'root' })
export class MockDbService {
  readonly dossiers = signal<Dossier[]>(this.load());
  readonly topics = TOPICS;

  createDossier(input: Pick<Dossier, 'question' | 'topicId' | 'sender' | 'senderEmail' | 'organization' | 'attachments'>): Dossier {
    const now = new Date();
    const dossier: Dossier = {
      id: crypto.randomUUID(),
      code: `CSTC-${now.getFullYear()}-${String(this.dossiers().length + 1285).padStart(6, '0')}`,
      ...input,
      receivedAt: now.toISOString(), dueAt: new Date(now.getTime() + 7 * 86_400_000).toISOString(),
      status: 'new', priority: 'normal', legalBasis: [], isPublic: false, answer: '',
      timeline: [{ at: now.toLocaleString('vi-VN'), title: 'Tiếp nhận câu hỏi', description: 'Hệ thống đã ghi nhận hồ sơ của bạn.', actor: 'Hệ thống', state: 'current' }],
    };
    this.commit([dossier, ...this.dossiers()]);
    return dossier;
  }

  updateStatus(id: string, status: DossierStatus, actor: string, title: string, description: string): void {
    this.commit(this.dossiers().map((item) => item.id === id ? {
      ...item, status,
      timeline: [...item.timeline.map((event) => ({ ...event, state: event.state === 'current' ? 'done' as const : event.state })), { at: new Date().toLocaleString('vi-VN'), title, description, actor, state: 'current' as const }],
    } : item));
  }

  updateAnswer(id: string, answer: string, legalBasis: string[]): void {
    this.commit(this.dossiers().map((item) => item.id === id ? { ...item, answer, legalBasis } : item));
  }

  private load(): Dossier[] {
    const saved = localStorage.getItem(STORAGE_KEY);
    return saved ? JSON.parse(saved) as Dossier[] : structuredClone(DOSSIERS);
  }

  private commit(value: Dossier[]): void {
    this.dossiers.set(value);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(value));
  }
}
