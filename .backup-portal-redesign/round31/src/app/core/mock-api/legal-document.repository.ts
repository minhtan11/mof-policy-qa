import { Injectable, signal } from '@angular/core';
import { LEGAL_DOCUMENTS } from './domain-fixtures';
import { LegalDocument } from '../models/domain.models';

@Injectable({ providedIn: 'root' })
export class LegalDocumentRepository {
  readonly documents = signal<LegalDocument[]>(structuredClone(LEGAL_DOCUMENTS));
  search(query: string): LegalDocument[] { const normalized = query.trim().toLocaleLowerCase(); return this.documents().filter((document) => !normalized || `${document.code} ${document.title} ${document.issuer}`.toLocaleLowerCase().includes(normalized)); }
  add(document: Omit<LegalDocument, 'id'>): LegalDocument { const value = { ...document, id: crypto.randomUUID() }; this.documents.update((items) => [value, ...items]); return value; }
  updateStatus(id: string, status: LegalDocument['status']): void { this.documents.update((items) => items.map((item) => item.id === id ? { ...item, status } : item)); }
}
