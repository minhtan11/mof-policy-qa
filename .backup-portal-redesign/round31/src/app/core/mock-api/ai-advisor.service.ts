import { Injectable, signal } from '@angular/core';
import { AI_SUGGESTIONS } from './domain-fixtures';
import { AiSuggestion } from '../models/domain.models';

@Injectable({ providedIn: 'root' })
export class AiAdvisorService {
  readonly suggestions = signal<AiSuggestion[]>(structuredClone(AI_SUGGESTIONS));
  suggestFor(dossierId: string, question: string): AiSuggestion[] { const existing = this.suggestions().filter((item) => item.dossierId === dossierId); if (existing.length) return existing; const suggestion: AiSuggestion = { id: crypto.randomUUID(), dossierId, kind: 'summary', value: question.slice(0, 120), confidence: .72, status: 'suggested', model: 'mof-advisor-mock-v1' }; this.suggestions.update((items) => [...items, suggestion]); return [suggestion]; }
  accept(id: string): void { this.suggestions.update((items) => items.map((item) => item.id === id ? { ...item, status: 'accepted' } : item)); }
  reject(id: string): void { this.suggestions.update((items) => items.map((item) => item.id === id ? { ...item, status: 'rejected' } : item)); }
}
