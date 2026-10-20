import { TestBed } from '@angular/core/testing';
import { AuthService } from '../auth/auth.service';
import { Dossier } from '../models/domain.models';
import { MockDbService } from './mock-db.service';
import { filterMine, mineFor, MyDossierRepository, slaOf } from './my-dossier.repository';

const base = (over: Partial<Dossier> = {}): Dossier =>
  ({
    id: 'x',
    code: 'CSTC-1',
    question: 'Q',
    topicId: 'tax',
    sender: 'A',
    senderEmail: 'a@e.vn',
    organization: 'Org',
    receivedAt: '2026-10-15T08:00:00',
    dueAt: '2026-10-22T17:00:00',
    status: 'processing',
    priority: 'normal',
    assignedTo: 'Lê Quốc Hưng',
    answer: '',
    legalBasis: [],
    attachments: [],
    isPublic: false,
    timeline: [],
    ...over,
  }) as Dossier;

describe('MyDossierRepository (EXP-01 UC-142..)', () => {
  beforeEach(() => localStorage.clear());

  it('mineFor chỉ lấy hồ sơ assignedTo = tên cán bộ', () => {
    const list = [base(), base({ id: 'y', assignedTo: 'Khác' })];
    const user = { id: 'u', name: 'Lê Quốc Hưng', email: 'e', role: 'specialist' as const, avatar: 'LH' };
    expect(mineFor(list, user).map((d) => d.id)).toEqual(['x']);
    expect(mineFor(list, null)).toEqual([]);
  });

  it('slaOf phân đúng hạn / sắp hạn / quá hạn / xong', () => {
    const now = Date.parse('2026-10-20T12:00:00');
    expect(slaOf(base({ dueAt: '2026-10-25T17:00:00' }), now)).toBe('on-time');
    expect(slaOf(base({ dueAt: '2026-10-21T12:00:00' }), now)).toBe('near');
    expect(slaOf(base({ dueAt: '2026-10-18T17:00:00' }), now)).toBe('overdue');
    expect(slaOf(base({ status: 'published' }), now)).toBe('done');
  });

  it('filterMine lọc tab + từ khoá không dấu', () => {
    const now = Date.parse('2026-10-20T12:00:00');
    const list = [
      base({ id: 'a', code: 'CSTC-A', question: 'Hoàn thuế GTGT', dueAt: '2026-10-18T17:00:00' }),
      base({ id: 'b', code: 'CSTC-B', question: 'Ngân sách', dueAt: '2026-10-25T17:00:00' }),
    ];
    expect(filterMine(list, { tab: 'overdue', q: '', now }).map((d) => d.id)).toEqual(['a']);
    expect(filterMine(list, { tab: 'all', q: 'hoan thue', now }).map((d) => d.id)).toEqual(['a']);
  });

  it('togglePin lưu localStorage và ưu tiên ghim', () => {
    TestBed.configureTestingModule({});
    const auth = TestBed.inject(AuthService);
    auth.loginAs('specialist');
    const repo = TestBed.inject(MyDossierRepository);
    const db = TestBed.inject(MockDbService);
    const first = db.dossiers().find((d) => d.assignedTo === 'Lê Quốc Hưng');
    expect(first).toBeTruthy();
    repo.togglePin(first!.id);
    expect(repo.isPinned(first!.id)).toBe(true);
    expect(JSON.parse(localStorage.getItem('mof.ws.my-dossiers.pins')!)).toContain(first!.id);
  });
});
