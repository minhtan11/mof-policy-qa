import { Injectable, signal } from '@angular/core';
import { LEGAL_DOCUMENTS } from './domain-fixtures';
import { LegalDocument } from '../models/domain.models';

export type LegalDocStatus = LegalDocument['status'];

export interface LegalDocQuery {
  query?: string;
  status?: LegalDocStatus | null;
}

/** UC-75..UC-83 (nội bộ) + UC-162..UC-165 (cổng công khai) — kho văn bản pháp luật mock. */
@Injectable({ providedIn: 'root' })
export class LegalDocumentRepository {
  readonly documents = signal<LegalDocument[]>(structuredClone(LEGAL_DOCUMENTS));

  search(query: string): LegalDocument[] {
    return this.list({ query });
  }

  /** Lọc theo từ khóa (số hiệu/tên/cơ quan) và/hoặc trạng thái hiệu lực. */
  list({ query = '', status = null }: LegalDocQuery = {}): LegalDocument[] {
    const normalized = query.trim().toLocaleLowerCase();
    return this.documents().filter((document) => {
      if (status && document.status !== status) return false;
      if (!normalized) return true;
      return `${document.code} ${document.title} ${document.issuer}`.toLocaleLowerCase().includes(normalized);
    });
  }

  add(document: Omit<LegalDocument, 'id'>): LegalDocument {
    const value = { ...document, id: crypto.randomUUID() };
    this.documents.update((items) => [value, ...items]);
    return value;
  }

  updateStatus(id: string, status: LegalDocument['status']): void {
    this.documents.update((items) => items.map((item) => (item.id === id ? { ...item, status } : item)));
  }
}
