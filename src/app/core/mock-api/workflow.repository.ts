import { Injectable, signal } from '@angular/core';
import { WORKFLOWS } from './domain-fixtures';
import { DossierStatus, WorkflowDefinition } from '../models/domain.models';

@Injectable({ providedIn: 'root' })
export class WorkflowRepository {
  readonly workflows = signal<WorkflowDefinition[]>(structuredClone(WORKFLOWS));
  active(): WorkflowDefinition { return this.workflows().find((workflow) => workflow.status === 'active') ?? this.workflows()[0]; }
  canTransition(from: DossierStatus, to: DossierStatus): boolean { const allowed: Record<DossierStatus, DossierStatus[]> = { new: ['received', 'processing'], received: ['processing'], processing: ['waiting-approval'], 'waiting-approval': ['processing', 'answered', 'published'], answered: ['published'], published: [] }; return allowed[from]?.includes(to) ?? false; }
  createDraft(name: string, slaDays: number): WorkflowDefinition { const draft: WorkflowDefinition = { id: crypto.randomUUID(), name, version: 1, status: 'draft', slaDays, updatedAt: new Date().toISOString(), steps: [] }; this.workflows.update((items) => [draft, ...items]); return draft; }
  activate(id: string): void { this.workflows.update((items) => items.map((item) => ({ ...item, status: item.id === id ? 'active' : item.status === 'active' ? 'archived' : item.status }))); }
}
