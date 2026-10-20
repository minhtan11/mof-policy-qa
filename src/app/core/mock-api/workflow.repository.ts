import { Injectable, signal } from '@angular/core';
import { WORKFLOWS } from './domain-fixtures';
import { DossierStatus, WorkflowDefinition } from '../models/domain.models';

/** Bảng chuyển trạng thái G5 — dac-ta §4.3 / UC-142..UC-161. */
export const DOSSIER_TRANSITIONS: Record<DossierStatus, DossierStatus[]> = {
  new: ['received', 'processing', 'rejected'],
  received: ['processing', 'rejected'],
  processing: ['waiting-approval', 'awaiting-clarification', 'awaiting-collaboration', 'rejected'],
  'awaiting-clarification': ['processing', 'rejected'],
  'awaiting-collaboration': ['processing'],
  'waiting-approval': ['returned', 'approved', 'published', 'answered'],
  returned: ['processing', 'waiting-approval'],
  approved: ['published', 'answered'],
  answered: ['published', 'closed'],
  published: ['answered', 'closed'],
  closed: [],
  rejected: [],
};

@Injectable({ providedIn: 'root' })
export class WorkflowRepository {
  readonly workflows = signal<WorkflowDefinition[]>(structuredClone(WORKFLOWS));

  active(): WorkflowDefinition {
    return this.workflows().find((workflow) => workflow.status === 'active') ?? this.workflows()[0];
  }

  /** UC-142..UC-161 — bảng chuyển trạng thái G5. */
  canTransition(from: DossierStatus, to: DossierStatus): boolean {
    return DOSSIER_TRANSITIONS[from]?.includes(to) ?? false;
  }

  createDraft(name: string, slaDays: number): WorkflowDefinition {
    const draft: WorkflowDefinition = {
      id: crypto.randomUUID(),
      name,
      version: 1,
      status: 'draft',
      slaDays,
      updatedAt: new Date().toISOString(),
      steps: [],
    };
    this.workflows.update((items) => [draft, ...items]);
    return draft;
  }

  activate(id: string): void {
    this.workflows.update((items) =>
      items.map((item) => ({
        ...item,
        status: item.id === id ? 'active' : item.status === 'active' ? 'archived' : item.status,
        updatedAt: item.id === id ? new Date().toISOString() : item.updatedAt,
      })),
    );
  }

  /** UC-041..UC-051 — cập nhật SLA ngày cho bản nháp hoặc active. */
  updateSla(id: string, slaDays: number): boolean {
    if (!Number.isFinite(slaDays) || slaDays < 1) {
      return false;
    }
    const target = this.workflows().find((item) => item.id === id);
    if (!target || target.status === 'archived') {
      return false;
    }
    this.workflows.update((items) =>
      items.map((item) =>
        item.id === id ? { ...item, slaDays: Math.round(slaDays), updatedAt: new Date().toISOString() } : item,
      ),
    );
    return true;
  }
}
