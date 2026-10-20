import { TestBed } from '@angular/core/testing';
import { WorkflowRepository } from './workflow.repository';

/** UC-142..UC-161 — state machine G5 */
describe('WorkflowRepository', () => {
  let repo: WorkflowRepository;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    repo = TestBed.inject(WorkflowRepository);
  });

  it('enforces the G5 answer lifecycle transition rules', () => {
    expect(repo.canTransition('new', 'received')).toBe(true);
    expect(repo.canTransition('new', 'processing')).toBe(true);
    expect(repo.canTransition('new', 'rejected')).toBe(true);
    expect(repo.canTransition('received', 'processing')).toBe(true);
    expect(repo.canTransition('processing', 'waiting-approval')).toBe(true);
    expect(repo.canTransition('processing', 'awaiting-clarification')).toBe(true);
    expect(repo.canTransition('processing', 'awaiting-collaboration')).toBe(true);
    expect(repo.canTransition('processing', 'published')).toBe(false);
    expect(repo.canTransition('awaiting-clarification', 'processing')).toBe(true);
    expect(repo.canTransition('awaiting-collaboration', 'processing')).toBe(true);
    expect(repo.canTransition('waiting-approval', 'returned')).toBe(true);
    expect(repo.canTransition('waiting-approval', 'approved')).toBe(true);
    expect(repo.canTransition('waiting-approval', 'processing')).toBe(false);
    expect(repo.canTransition('waiting-approval', 'answered')).toBe(true);
    expect(repo.canTransition('waiting-approval', 'published')).toBe(true);
    expect(repo.canTransition('returned', 'processing')).toBe(true);
    expect(repo.canTransition('returned', 'waiting-approval')).toBe(true);
    expect(repo.canTransition('approved', 'published')).toBe(true);
    expect(repo.canTransition('answered', 'published')).toBe(true);
    expect(repo.canTransition('answered', 'closed')).toBe(true);
    expect(repo.canTransition('published', 'answered')).toBe(true);
    expect(repo.canTransition('published', 'closed')).toBe(true);
    expect(repo.canTransition('published', 'processing')).toBe(false);
    expect(repo.canTransition('closed', 'processing')).toBe(false);
    expect(repo.canTransition('rejected', 'processing')).toBe(false);
  });

  it('creates a draft workflow without changing active version', () => {
    const draft = repo.createDraft('Test workflow', 5);
    expect(draft.status).toBe('draft');
    expect(repo.active().status).toBe('active');
  });

  it('updates SLA for non-archived workflows', () => {
    const draft = repo.createDraft('SLA workflow', 5);
    expect(repo.updateSla(draft.id, 10)).toBe(true);
    expect(repo.workflows().find((item) => item.id === draft.id)?.slaDays).toBe(10);
    expect(repo.updateSla(draft.id, 0)).toBe(false);
  });
});
