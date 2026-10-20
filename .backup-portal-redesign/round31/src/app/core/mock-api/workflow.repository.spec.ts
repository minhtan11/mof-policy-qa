import { TestBed } from '@angular/core/testing';
import { WorkflowRepository } from './workflow.repository';

/** UC-142..UC-161 — state machine G2 */
describe('WorkflowRepository', () => {
  let repo: WorkflowRepository;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    repo = TestBed.inject(WorkflowRepository);
  });

  it('enforces the answer lifecycle transition rules', () => {
    expect(repo.canTransition('new', 'received')).toBe(true);
    expect(repo.canTransition('new', 'processing')).toBe(true);
    expect(repo.canTransition('received', 'processing')).toBe(true);
    expect(repo.canTransition('processing', 'waiting-approval')).toBe(true);
    expect(repo.canTransition('processing', 'published')).toBe(false);
    expect(repo.canTransition('waiting-approval', 'processing')).toBe(true);
    expect(repo.canTransition('waiting-approval', 'answered')).toBe(true);
    expect(repo.canTransition('waiting-approval', 'published')).toBe(true);
    expect(repo.canTransition('answered', 'published')).toBe(true);
    expect(repo.canTransition('published', 'answered')).toBe(true);
    expect(repo.canTransition('published', 'processing')).toBe(false);
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
