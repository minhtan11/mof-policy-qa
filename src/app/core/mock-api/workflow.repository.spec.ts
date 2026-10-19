import { TestBed } from '@angular/core/testing';
import { WorkflowRepository } from './workflow.repository';

describe('WorkflowRepository', () => { let repo: WorkflowRepository; beforeEach(() => { TestBed.configureTestingModule({}); repo = TestBed.inject(WorkflowRepository); }); it('enforces the answer lifecycle transition rules', () => { expect(repo.canTransition('processing', 'waiting-approval')).toBe(true); expect(repo.canTransition('processing', 'published')).toBe(false); }); it('creates a draft workflow without changing active version', () => { const draft = repo.createDraft('Test workflow', 5); expect(draft.status).toBe('draft'); expect(repo.active().status).toBe('active'); }); });
