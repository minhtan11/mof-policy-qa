import { TestBed } from '@angular/core/testing';
import { MyQuestionRepository, dueState, mineStatus, queryMine } from './my-question.repository';
import { MockDbService } from './mock-db.service';
import { MY_QUESTIONS_DEMO_EMAIL, MY_QUESTIONS_FIXTURE_NOW } from './my-questions-fixtures';

/** UC-110, UC-122 — repository “Câu hỏi của tôi”: phạm vi email, gộp trạng thái, hạn, lọc/sắp xếp. */
describe('MyQuestionRepository', () => {
  let repo: MyQuestionRepository;
  beforeEach(() => {
    localStorage.clear();
    repo = TestBed.inject(MyQuestionRepository);
    repo.now = () => MY_QUESTIONS_FIXTURE_NOW;
  });

  it('maps internal statuses to the 4 citizen groups and due states', () => {
    expect(mineStatus('new')).toBe('processing');
    expect(mineStatus('waiting-approval')).toBe('waiting');
    expect(mineStatus('published')).toBe('answered');
    expect(mineStatus('rejected')).toBe('rejected');
    const now = MY_QUESTIONS_FIXTURE_NOW;
    expect(dueState('answered', '2020-01-01', now)).toBe('done');
    expect(dueState('processing', new Date(now - 1).toISOString(), now)).toBe('overdue');
    expect(dueState('processing', new Date(now + 3_600_000).toISOString(), now)).toBe('near');
    expect(dueState('processing', new Date(now + 5 * 86_400_000).toISOString(), now)).toBe('ok');
  });

  it('returns only rows for the email (case-insensitive) incl. fresh submissions', () => {
    const rows = repo.rows(MY_QUESTIONS_DEMO_EMAIL.toUpperCase());
    expect(rows.length).toBe(24);
    expect(new Set(rows.map((r) => r.status))).toEqual(new Set(['processing', 'waiting', 'answered', 'rejected']));
    expect(rows.some((r) => r.due === 'overdue')).toBe(true);
    expect(rows.some((r) => r.due === 'near')).toBe(true);
    TestBed.inject(MockDbService).createDossier({
      question: 'Câu hỏi mới gửi từ form.', topicId: 'tax', sender: 'A', senderEmail: MY_QUESTIONS_DEMO_EMAIL, organization: '', attachments: [],
    });
    expect(repo.rows(MY_QUESTIONS_DEMO_EMAIL).length).toBe(25);
    expect(repo.rows('khac@example.vn').length).toBe(0);
  });

  it('filters and sorts (newest / oldest / due with closed last)', () => {
    const rows = repo.rows(MY_QUESTIONS_DEMO_EMAIL);
    const t = (s: string) => new Date(s).getTime();
    const newest = queryMine(rows, { status: null, topic: null, sort: 'newest' });
    expect(t(newest[0].receivedAt)).toBeGreaterThanOrEqual(t(newest[1].receivedAt));
    const oldest = queryMine(rows, { status: null, topic: null, sort: 'oldest' });
    expect(oldest[0].id).toBe(newest[newest.length - 1].id);
    const due = queryMine(rows, { status: null, topic: null, sort: 'due' });
    const firstDone = due.findIndex((r) => r.due === 'done');
    expect(due.slice(firstDone).every((r) => r.due === 'done')).toBe(true);
    expect(t(due[0].dueAt)).toBeLessThanOrEqual(t(due[1].dueAt));
    const rej = queryMine(rows, { status: 'rejected', topic: 'tax', sort: 'newest' });
    expect(rej.length).toBeGreaterThan(0);
    expect(rej.every((r) => r.status === 'rejected' && r.topicId === 'tax')).toBe(true);
  });
});
