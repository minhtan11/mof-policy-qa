import { Injectable, computed, inject, signal } from '@angular/core';
import { AuthService } from '../auth/auth.service';
import { Dossier, PortalUser } from '../models/domain.models';
import { MockDbService } from './mock-db.service';
import { WS_NEAR_DUE_HOURS, WS_OPEN_STATUSES } from './workspace-overview-fixtures';
import { isOverdue } from './workspace-overview.repository';

const PIN_KEY = 'mof.ws.my-dossiers.pins';
const HOUR = 3_600_000;

export type MySlaTab = 'all' | 'on-time' | 'near' | 'overdue' | 'done';

export const MY_SLA_TABS: { id: MySlaTab; labelKey: string }[] = [
  { id: 'all', labelKey: 'myDossiers.tabAll' },
  { id: 'on-time', labelKey: 'myDossiers.tabOnTime' },
  { id: 'near', labelKey: 'myDossiers.tabNear' },
  { id: 'overdue', labelKey: 'myDossiers.tabOverdue' },
  { id: 'done', labelKey: 'myDossiers.tabDone' },
];

const norm = (s: string) =>
  s
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/đ/g, 'd')
    .replace(/Đ/g, 'D')
    .toLowerCase();

function loadPins(): Set<string> {
  try {
    const raw = localStorage.getItem(PIN_KEY);
    const arr = raw ? (JSON.parse(raw) as string[]) : [];
    return new Set(Array.isArray(arr) ? arr : []);
  } catch {
    return new Set();
  }
}

/** Hồ sơ được giao cho cán bộ đang đăng nhập (EXP-01). */
export function mineFor(list: Dossier[], user: PortalUser | null): Dossier[] {
  if (!user || user.role === 'public') return [];
  return list.filter((d) => d.assignedTo === user.name);
}

export function slaOf(d: Dossier, now: number): Exclude<MySlaTab, 'all'> {
  if (!WS_OPEN_STATUSES.includes(d.status)) return 'done';
  if (isOverdue(d, now)) return 'overdue';
  const h = (new Date(d.dueAt).getTime() - now) / HOUR;
  if (h >= 0 && h <= WS_NEAR_DUE_HOURS) return 'near';
  return 'on-time';
}

export function filterMine(
  list: Dossier[],
  opts: { tab: MySlaTab; q: string; now?: number },
): Dossier[] {
  const now = opts.now ?? Date.now();
  const q = norm(opts.q.trim());
  return list
    .filter((d) => opts.tab === 'all' || slaOf(d, now) === opts.tab)
    .filter((d) => !q || norm(`${d.code} ${d.question} ${d.organization}`).includes(q))
    .sort((a, b) => a.dueAt.localeCompare(b.dueAt) || a.code.localeCompare(b.code));
}

@Injectable({ providedIn: 'root' })
export class MyDossierRepository {
  private readonly db = inject(MockDbService);
  private readonly auth = inject(AuthService);
  private readonly pins = signal(loadPins());
  /** Set id hồ sơ đang ghim — đọc trong template để OnPush nhận đổi trạng thái icon. */
  readonly pinnedIds = this.pins.asReadonly();

  readonly mine = computed(() => mineFor(this.db.dossiers(), this.auth.user()));

  readonly counts = computed(() => {
    const now = Date.now();
    const list = this.mine();
    const c: Record<MySlaTab, number> = { all: list.length, 'on-time': 0, near: 0, overdue: 0, done: 0 };
    for (const d of list) c[slaOf(d, now)] += 1;
    return c;
  });

  list(tab: MySlaTab, q: string): Dossier[] {
    const pins = this.pinnedIds();
    return filterMine(this.mine(), { tab, q }).sort((a, b) => {
      const pa = pins.has(a.id) ? 0 : 1;
      const pb = pins.has(b.id) ? 0 : 1;
      return pa - pb || a.dueAt.localeCompare(b.dueAt);
    });
  }

  isPinned(id: string): boolean {
    return this.pinnedIds().has(id);
  }

  togglePin(id: string): void {
    const next = new Set(this.pinnedIds());
    if (next.has(id)) next.delete(id);
    else next.add(id);
    this.pins.set(next);
    localStorage.setItem(PIN_KEY, JSON.stringify([...next]));
  }
}
