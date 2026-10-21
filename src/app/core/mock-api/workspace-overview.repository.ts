import { Injectable, computed, inject } from '@angular/core';
import { AuthService } from '../auth/auth.service';
import { Dossier, PortalUser, Topic } from '../models/domain.models';
import { MockDbService } from './mock-db.service';
import { ORGANIZATIONS } from './domain-fixtures';
import {
  WS_DONE_STATUSES,
  WS_KPIS,
  WS_NEAR_DUE_HOURS,
  WS_OPEN_STATUSES,
  WS_ROLE_SCOPE,
  WS_TABS,
  WS_TOPIC_VISUALS,
  WS_UNASSIGNED_UNIT,
  WsKpiDef,
  WsKpiId,
  WsSlice,
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
  month?: string;
  unit?: string;
  /** Rỗng = danh sách theo tab trạng thái. Có giá trị = đúng lát cắt của thẻ KPI. */
  kpi?: WsKpiId | '';
}

export interface WsUnitStat {
  id: string;
  name: string;
  count: number;
  pct: number;
}

const HOUR = 3_600_000;
const isOpen = (d: Dossier) => WS_OPEN_STATUSES.includes(d.status);
const norm = (s: string) => s.normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/đ/g, 'd').replace(/Đ/g, 'D').toLowerCase();

/** Hồ sơ trong phạm vi của người dùng (WS_ROLE_SCOPE ↔ ROLE_PERMISSIONS). */
export function scopeFor(list: Dossier[], user: PortalUser | null): Dossier[] {
  const scope = user ? WS_ROLE_SCOPE[user.role] : 'none';
  if (scope === 'all') return list;
  if (scope === 'assigned') return list.filter((d) => d.assignedTo === user!.name);
  if (scope === 'unit') {
    const unitId = user!.organizationId;
    if (!unitId) return [];
    return list.filter((d) => {
      if (user!.role === 'reception' && (d.status === 'new' || d.status === 'received' || d.status === 'rejected')) return true;
      return d.handlingUnitId === unitId;
    });
  }
  return [];
}

export function isOverdue(d: Dossier, now: number): boolean {
  return isOpen(d) && new Date(d.dueAt).getTime() < now;
}

/** Lát cắt hạn của hồ sơ đang mở: quá hạn / sắp hạn (≤ 48 giờ) / đúng hạn. Hồ sơ đã xong trả về null. */
export function slaBucket(d: Dossier, now: number): 'on-time' | 'near' | 'overdue' | null {
  if (!isOpen(d)) return null;
  const h = (new Date(d.dueAt).getTime() - now) / HOUR;
  if (h < 0) return 'overdue';
  if (h <= WS_NEAR_DUE_HOURS) return 'near';
  return 'on-time';
}

/** Lọc thời gian (receivedAt), đơn vị xử lý và lĩnh vực. Rỗng = không lọc tiêu chí đó. */
export function applySlice(list: Dossier[], slice: WsSlice): Dossier[] {
  return list.filter((d) => {
    if (slice.month && !d.receivedAt.startsWith(slice.month)) return false;
    if (slice.topic && d.topicId !== slice.topic) return false;
    if (slice.unit === WS_UNASSIGNED_UNIT) return !d.handlingUnitId;
    if (slice.unit && d.handlingUnitId !== slice.unit) return false;
    return true;
  });
}

/**
 * OPS-01: tiếp nhận (mọi hồ sơ trong lát cắt), chờ xử lý (đang mở),
 * đúng hạn / sắp hạn / quá hạn (ba lát này cộng lại bằng chờ xử lý).
 */
export function computeKpis(list: Dossier[], now: number): WsKpi[] {
  const buckets = { 'on-time': 0, near: 0, overdue: 0 };
  for (const d of list) {
    const b = slaBucket(d, now);
    if (b) buckets[b] += 1;
  }
  const pending = buckets['on-time'] + buckets.near + buckets.overdue;
  const values: Record<WsKpiId, [number, Record<string, number>]> = {
    intake: [list.length, { n: pending }],
    pending: [pending, { on: buckets['on-time'], near: buckets.near, late: buckets.overdue }],
    'on-time': [buckets['on-time'], {}],
    near: [buckets.near, {}],
    overdue: [buckets.overdue, {}],
  };
  return WS_KPIS.map((k) => ({ ...k, value: values[k.id][0], params: values[k.id][1] }));
}

/** Hồ sơ đúng một thẻ KPI (đã nằm trong lát cắt thời gian/đơn vị/lĩnh vực). */
export function kpiDossiers(list: Dossier[], id: WsKpiId, now: number): Dossier[] {
  if (id === 'intake') return list;
  return list.filter((d) => {
    const b = slaBucket(d, now);
    return id === 'pending' ? b !== null : b === id;
  });
}

/** Danh sách “Hồ sơ cần chú ý”. Có `kpi` thì bỏ qua tab trạng thái để số dòng khớp thẻ. */
export function attentionList(list: Dossier[], query: WsQuery, now = Date.now()): Dossier[] {
  const sliced = applySlice(list, { month: query.month ?? '', unit: query.unit ?? '', topic: query.topic });
  const statuses = (WS_TABS.find((t) => t.id === query.tab) ?? WS_TABS[0]).statuses;
  const base = query.kpi ? kpiDossiers(sliced, query.kpi, now) : sliced.filter((d) => statuses.includes(d.status));
  const q = norm(query.q.trim());
  return base
    .filter((d) => !query.priority || d.priority === query.priority)
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

/** Phân bổ đơn vị xử lý. Hồ sơ chưa gán đơn vị có `id` rỗng. */
export function unitStats(list: Dossier[], orgs: { id: string; name: string }[]): WsUnitStat[] {
  const total = list.length;
  const ids = new Set(list.map((d) => d.handlingUnitId ?? ''));
  return [...ids]
    .map((id) => {
      const count = list.filter((d) => (d.handlingUnitId ?? '') === id).length;
      return {
        id,
        name: id ? (orgs.find((o) => o.id === id)?.name ?? id) : '',
        count,
        pct: total ? Math.round((count / total) * 100) : 0,
      };
    })
    .filter((u) => u.count > 0)
    .sort((a, b) => b.count - a.count || a.name.localeCompare(b.name, 'vi'));
}

/** Repository màn Tổng quan công việc — đọc MockDbService, áp phạm vi vai trò của người đăng nhập. */
@Injectable({ providedIn: 'root' })
export class WorkspaceOverviewRepository {
  private readonly db = inject(MockDbService);
  private readonly auth = inject(AuthService);

  readonly topics = this.db.topics;
  readonly orgs = ORGANIZATIONS;
  readonly scoped = computed(() => scopeFor(this.db.dossiers(), this.auth.user()));
  readonly months = computed(() => monthsOf(this.scoped()));
  readonly tabCounts = computed(() => tabCounts(this.scoped()));
  readonly topicStats = computed(() => topicStats(this.scoped(), this.topics));

  kpis(now = Date.now()): WsKpi[] {
    return computeKpis(this.scoped(), now);
  }

  /** KPI trên lát cắt thời gian / đơn vị / lĩnh vực (OPS-01, DASH-01). */
  kpisFor(slice: WsSlice, now = Date.now()): WsKpi[] {
    return computeKpis(applySlice(this.scoped(), slice), now);
  }

  countsFor(slice: WsSlice): Record<WsTab, number> {
    return tabCounts(applySlice(this.scoped(), slice));
  }

  /** Biểu đồ lĩnh vực bỏ qua lọc lĩnh vực để vẫn bấm sang lĩnh vực khác. */
  topicsFor(slice: WsSlice): WsTopicStat[] {
    return topicStats(applySlice(this.scoped(), { ...slice, topic: '' }), this.topics);
  }

  /** Biểu đồ đơn vị bỏ qua lọc đơn vị để vẫn bấm sang đơn vị khác. */
  unitsFor(slice: WsSlice): WsUnitStat[] {
    return unitStats(applySlice(this.scoped(), { ...slice, unit: '' }), this.orgs);
  }

  attention(query: WsQuery, now = Date.now()): Dossier[] {
    return attentionList(this.scoped(), query, now);
  }

  progress(month: string, now = Date.now()): WsProgress {
    return progressFor(this.scoped(), month, now);
  }

  /** Donut theo tháng, vẫn tôn trọng đơn vị và lĩnh vực đang lọc. */
  progressForSlice(slice: WsSlice, now = Date.now()): WsProgress {
    return progressFor(applySlice(this.scoped(), { ...slice, month: '' }), slice.month, now);
  }

  topicName(id: string): string {
    return this.topics.find((t) => t.id === id)?.name ?? '';
  }
}
