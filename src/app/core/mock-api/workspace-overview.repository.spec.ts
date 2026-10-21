import { TestBed } from '@angular/core/testing';
import { Dossier, PortalUser } from '../models/domain.models';
import { AuthService } from '../auth/auth.service';
import { DEMO_DEFAULT_PASSWORD } from './auth-credentials';
import { TOPICS, USERS } from './demo-data';
import {
  WorkspaceOverviewRepository,
  applySlice,
  attentionList,
  computeKpis,
  monthsOf,
  progressFor,
  scopeFor,
  tabCounts,
  topicStats,
  unitStats,
} from './workspace-overview.repository';

/** R31 — W-01 Tổng quan công việc: KPI, hàng đợi cần chú ý, tiến độ theo tháng, lĩnh vực, phạm vi vai trò. */
const NOW = new Date('2026-10-20T09:00:00').getTime();
let seq = 0;
const d = (p: Partial<Dossier>): Dossier => ({
  id: `t-${++seq}`,
  code: `CSTC-T-${seq}`,
  question: 'Câu hỏi về thuế',
  topicId: 'tax',
  sender: 'A',
  senderEmail: 'a@x.vn',
  organization: 'Org',
  receivedAt: '2026-10-10T08:00:00',
  dueAt: '2026-10-25T17:00:00',
  status: 'processing',
  priority: 'normal',
  legalBasis: [],
  attachments: [],
  timeline: [],
  isPublic: false,
  ...p,
});

const LIST: Dossier[] = [
  d({ status: 'new', dueAt: '2026-10-19T17:00:00', topicId: 'budget', question: 'Ngân sách xã' }), // quá hạn
  d({ status: 'received' }),
  d({ status: 'processing', dueAt: '2026-10-21T17:00:00', assignedTo: 'Lê Quốc Hưng', priority: 'urgent' }), // sắp hạn
  d({ status: 'processing', assignedTo: 'Lê Quốc Hưng' }),
  d({ status: 'waiting-approval', topicId: 'customs' }),
  d({ status: 'answered', receivedAt: '2026-09-02T08:00:00' }),
  d({ status: 'published', receivedAt: '2026-09-03T08:00:00' }),
  d({ status: 'rejected', topicId: 'other' }),
];

describe('workspace overview repository', () => {
  const user = (username: string) => USERS.find((u) => u.username === username) as PortalUser;

  it('computes the 5 OPS-01 KPIs (intake, pending, and the SLA split that sums to pending)', () => {
    const k = computeKpis(LIST, NOW);
    expect(k.map((x) => [x.id, x.value])).toEqual([
      ['intake', 8],
      ['pending', 5],
      ['on-time', 3],
      ['near', 1],
      ['overdue', 1],
    ]);
    expect(k[0].params).toEqual({ n: 5 });
    expect(k[1].params).toEqual({ on: 3, near: 1, late: 1 });
    expect(k[2].value + k[3].value + k[4].value).toBe(k[1].value);
  });

  it('filters the shared slice by month, unit and topic, and a KPI drill matches the card', () => {
    const slice = { month: '2026-10', unit: '', topic: 'tax' };
    const sliced = applySlice(LIST, slice);
    expect(sliced).toHaveLength(3);
    expect(computeKpis(sliced, NOW).map((x) => x.value)).toEqual([3, 3, 2, 1, 0]);
    expect(unitStats(LIST, []).map((u) => [u.id, u.count])).toEqual([['', 8]]);
    const base = { q: '', priority: '' as const, topic: 'tax', month: '2026-10', unit: '', kpi: 'near' as const, tab: 'all' as const };
    expect(attentionList(LIST, base, NOW)).toHaveLength(1);
    expect(applySlice(LIST, { month: '', unit: '__none__', topic: '' }).every((d) => !d.handlingUnitId)).toBe(true);
  });

  it('filters the attention list by tab, accent-insensitive search, priority and topic; sorts by due date', () => {
    const base = { q: '', priority: '' as const, topic: '', month: '', unit: '', kpi: '' as const };
    expect(attentionList(LIST, { ...base, tab: 'all' }, NOW).length).toBe(5);
    expect(attentionList(LIST, { ...base, tab: 'all' })[0].status).toBe('new');
    expect(attentionList(LIST, { ...base, tab: 'new' }).length).toBe(2);
    expect(attentionList(LIST, { ...base, tab: 'answered' }).length).toBe(1);
    expect(attentionList(LIST, { ...base, tab: 'closed' }).map((x) => x.status)).toEqual(['published', 'rejected']);
    expect(attentionList(LIST, { ...base, tab: 'all', q: 'ngan sach' }).length).toBe(1);
    expect(attentionList(LIST, { ...base, tab: 'all', priority: 'urgent' }).length).toBe(1);
    expect(attentionList(LIST, { ...base, tab: 'all', topic: 'customs' }).length).toBe(1);
    expect(tabCounts(LIST)).toEqual({ all: 5, new: 2, processing: 2, 'waiting-approval': 1, answered: 1, closed: 2 });
  });

  it('builds donut progress for the selected month (rejected excluded)', () => {
    expect(monthsOf(LIST)).toEqual(['2026-10', '2026-09']);
    expect(progressFor(LIST, '2026-10', NOW)).toEqual({ onTime: 3, nearDue: 1, overdue: 1, done: 0, total: 5 });
    expect(progressFor(LIST, '2026-09', NOW)).toEqual({ onTime: 0, nearDue: 0, overdue: 0, done: 2, total: 2 });
  });

  it('computes topic percentages and counts, sorted, without empty topics', () => {
    const t = topicStats(LIST, TOPICS);
    expect(t.map((x) => [x.id, x.count, x.pct])).toEqual([
      ['tax', 5, 63],
      ['budget', 1, 13],
      ['customs', 1, 13],
      ['other', 1, 13],
    ]);
    expect(t[0]).toMatchObject({ icon: 'receipt', tone: 'blue' });
  });

  it('scopes dossiers by role: specialist assigned; reception/leader unit (+ intake); public none', () => {
    expect(scopeFor(LIST, user('hung.lq')).length).toBe(2);
    expect(scopeFor(LIST, user('ha.tt')).map((x) => x.status).sort()).toEqual(['new', 'received', 'rejected']);
    expect(scopeFor(LIST, user('long.pd'))).toEqual([]);
    expect(scopeFor(LIST, user('minhanh'))).toEqual([]);
    expect(scopeFor(LIST, null)).toEqual([]);
    const unitScoped = [
      d({ status: 'processing', handlingUnitId: 'org-tax', assignedTo: 'X' }),
      d({ status: 'processing', handlingUnitId: 'org-budget', assignedTo: 'Y' }),
      d({ status: 'new' }),
    ];
    expect(scopeFor(unitScoped, user('long.pd')).map((x) => x.handlingUnitId)).toEqual(['org-tax']);
    expect(scopeFor(unitScoped, user('ha.tt')).map((x) => x.status)).toEqual(['new']);
  });

  it('repository applies the signed-in user scope to the mock DB', () => {
    localStorage.clear();
    TestBed.configureTestingModule({});
    const auth = TestBed.inject(AuthService);
    const repo = TestBed.inject(WorkspaceOverviewRepository);
    auth.loginWithCredentials('ngoc.db', DEMO_DEFAULT_PASSWORD, false);
    const all = repo.scoped().length;
    auth.loginWithCredentials('hung.lq', DEMO_DEFAULT_PASSWORD, false);
    const mine = repo.scoped();
    expect(mine.length).toBeLessThanOrEqual(all);
    expect(mine.every((x) => x.assignedTo === 'Lê Quốc Hưng')).toBe(true);
    const mineKpis = repo.kpis(NOW);
    expect(mineKpis[2].value + mineKpis[3].value + mineKpis[4].value).toBe(mineKpis[1].value);
    auth.loginWithCredentials('long.pd', DEMO_DEFAULT_PASSWORD, false);
    expect(repo.scoped().every((x) => x.handlingUnitId === 'org-tax')).toBe(true);
    auth.loginWithCredentials('ha.tt', DEMO_DEFAULT_PASSWORD, false);
    const unit = repo.scoped();
    expect(unit.length).toBeLessThanOrEqual(all);
    localStorage.clear();
  });
});
