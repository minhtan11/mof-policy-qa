import { Injectable, computed, inject } from '@angular/core';
import { AuthService } from '../auth/auth.service';
import { Dossier, PortalUser, Topic } from '../models/domain.models';
import { MockDbService } from './mock-db.service';
import {
  WS_DONE_STATUSES,
  WS_KPIS,
  WS_NEAR_DUE_HOURS,
  WS_OPEN_STATUSES,
  WS_ROLE_SCOPE,
  WS_TABS,
  WS_TOPIC_VISUALS,
  WsKpiDef,
  WsTab,
  WsTone,
} from './workspace-overview-fixtures';

export interface WsKpi extends WsKpiDef {
  value: number;
  /** Tham số cho hint (vd. số sắp đến hạn, %). */
  params: Record<string, number>;
}

export interface WsProgress {
  onTime: number;
  nearDue: number;
  overdue: number;
  done: number;
  total: number;
}

export interface WsTopicStat {
  id: string;
  name: string;
  icon: string;
  tone: WsTone;
  count: number;
  pct: number;
}

export interface WsQuery {
  tab: WsTab;
  q: string;
  priority: '' | Dossier['priority'];
  topic: string;
}

const HOUR = 3_600_000;
const isOpen = (d: Dossier) => WS_OPEN_STATUSES.includes(d.status);
const norm = (s: string) => s.normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/đ/g, 'd').replace(/Đ/g, 'D').toLowerCase();

/** Hồ sơ trong phạm vi của người dùng (WS_ROLE_SCOPE). */
export function scopeFor(list: Dossier[], user: PortalUser | null): Dossier[] {
  const scope = user ? WS_ROLE_SCOPE[user.role] : 'none';
  if (scope === 'all') return list;
  if (scope === 'assigned') return list.filter((d) => d.assignedTo === user!.name);
  return [];
}

export function isOverdue(d: Dossier, now: number): boolean {
  return isOpen(d) && new Date(d.dueAt).getTime() < now;
}

/** 4 KPI: chờ tiếp nhận, đang xử lý, chờ phê duyệt, đúng hạn (ước tính = đang mở & chưa quá hạn). */
export function computeKpis(list: Dossier[], now: number): WsKpi[] {
  const open = list.filter(isOpen);
  const count = (tab: WsTab) => list.filter((d) => WS_TABS.find((t) => t.id === tab)!.statuses.includes(d.status)).length;
  const processing = list.filter((d) => d.status === 'processing');
  const nearDue = processing.filter((d) => {
    const h = (new Date(d.dueAt).getTime() - now) / HOUR;
    return h >= 0 && h <= WS_NEAR_DUE_HOURS;
  }).length;
  const onTime = open.filter((d) => !isOverdue(d, now)).length;
  const values: Record<WsKpiDef['id'], [number, Record<string, number>]> = {
    intake: [count('new'), { n: list.filter((d) => d.status === 'new').length }],
    processing: [processing.length, { n: nearDue }],
    approval: [count('waiting-approval'), {}],
    'on-time': [onTime, { pct: open.length ? Math.round((onTime / open.length) * 100) : 100 }],
  };
  return WS_KPIS.map((k) => ({ ...k, value: values[k.id][0], params: values[k.id][1] }));
}

/** Danh sách “Hồ sơ cần chú ý”: lọc tab/từ khoá/ưu tiên/lĩnh vực, sắp: quá hạn → hạn gần nhất. */
export function attentionList(list: Dossier[], query: WsQuery): Dossier[] {
  const statuses = (WS_TABS.find((t) => t.id === query.tab) ?? WS_TABS[0]).statuses;
  const q = norm(query.q.trim());
  return list
    .filter((d) => statuses.includes(d.status))
    .filter((d) => !query.priority || d.priority === query.priority)
    .filter((d) => !query.topic || d.topicId === query.topic)
    .filter((d) => !q || norm(`${d.code} ${d.question} ${d.sender} ${d.organization}`).includes(q))
    .sort((a, b) => a.dueAt.localeCompare(b.dueAt) || a.code.localeCompare(b.code));
}

/** Đếm theo tab (badge số trên pill). */
export function tabCounts(list: Dossier[]): Record<WsTab, number> {
  return Object.fromEntries(WS_TABS.map((t) => [t.id, list.filter((d) => t.statuses.includes(d.status)).length])) as Record<WsTab, number>;
}

/** Các tháng có hồ sơ (yyyy-MM, mới nhất trước). */
export function monthsOf(list: Dossier[]): string[] {
  return [...new Set(list.map((d) => d.receivedAt.slice(0, 7)))].sort().reverse();
}

/** Tiến độ xử lý của hồ sơ tiếp nhận trong tháng (bỏ hồ sơ từ chối). */
export function progressFor(list: Dossier[], month: string, now: number): WsProgress {
  const p: WsProgress = { onTime: 0, nearDue: 0, overdue: 0, done: 0, total: 0 };
  for (const d of list) {
    if (d.status === 'rejected' || (month && !d.receivedAt.startsWith(month))) continue;
    p.total += 1;
    if (WS_DONE_STATUSES.includes(d.status)) {
      p.done += 1;
      continue;
    }
    const h = (new Date(d.dueAt).getTime() - now) / HOUR;
    if (h < 0) p.overdue += 1;
    else if (h <= WS_NEAR_DUE_HOURS) p.nearDue += 1;
    else p.onTime += 1;
  }
  return p;
}

/** Phân bổ lĩnh vực: % làm tròn trên tổng hồ sơ trong phạm vi; xếp giảm dần, bỏ lĩnh vực 0. */
export function topicStats(list: Dossier[], topics: Topic[]): WsTopicStat[] {
  const total = list.length;
  return topics
    .map((t) => {
      const count = list.filter((d) => d.topicId === t.id).length;
      const v = WS_TOPIC_VISUALS[t.id] ?? WS_TOPIC_VISUALS['other'];
      return { id: t.id, name: t.name, icon: v.icon, tone: v.tone, count, pct: total ? Math.round((count / total) * 100) : 0 };
    })
    .filter((t) => t.count > 0)
    .sort((a, b) => b.count - a.count);
}

/** Repository màn Tổng quan công việc — đọc MockDbService, áp phạm vi vai trò của người đăng nhập. */
@Injectable({ providedIn: 'root' })
export class WorkspaceOverviewRepository {
  private readonly db = inject(MockDbService);
  private readonly auth = inject(AuthService);

  readonly topics = this.db.topics;
  readonly scoped = computed(() => scopeFor(this.db.dossiers(), this.auth.user()));
  readonly months = computed(() => monthsOf(this.scoped()));
  readonly tabCounts = computed(() => tabCounts(this.scoped()));
  readonly topicStats = computed(() => topicStats(this.scoped(), this.topics));

  kpis(now = Date.now()): WsKpi[] {
    return computeKpis(this.scoped(), now);
  }

  attention(query: WsQuery): Dossier[] {
    return attentionList(this.scoped(), query);
  }

  progress(month: string, now = Date.now()): WsProgress {
    return progressFor(this.scoped(), month, now);
  }

  topicName(id: string): string {
    return this.topics.find((t) => t.id === id)?.name ?? '';
  }
}
