import { Injectable, inject } from '@angular/core';
import { Dossier } from '../models/domain.models';
import { MockDbService } from './mock-db.service';

/** SLA calendar — hồ sơ theo tháng hạn xử lý (dueAt). */
@Injectable({ providedIn: 'root' })
export class CalendarRepository {
  private readonly db = inject(MockDbService);

  /** Các tháng yyyy-MM có ít nhất một hồ sơ đến hạn. */
  months(): string[] {
    const set = new Set<string>();
    for (const d of this.db.dossiers()) {
      const key = monthKey(d.dueAt);
      if (key) set.add(key);
    }
    return [...set].sort().reverse();
  }

  listByMonth(month: string): Dossier[] {
    return this.db
      .dossiers()
      .filter((d) => monthKey(d.dueAt) === month)
      .sort((a, b) => a.dueAt.localeCompare(b.dueAt));
  }

  counts(month: string): { all: number; overdue: number; dueSoon: number } {
    const rows = this.listByMonth(month);
    const now = Date.now();
    let overdue = 0;
    let dueSoon = 0;
    for (const d of rows) {
      if (d.status === 'answered' || d.status === 'published' || d.status === 'rejected') continue;
      const due = new Date(d.dueAt).getTime();
      if (due < now) overdue += 1;
      else if (due - now < 2 * 86_400_000) dueSoon += 1;
    }
    return { all: rows.length, overdue, dueSoon };
  }
}

export function monthKey(iso: string): string | null {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return null;
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
}

export function shiftMonth(month: string, delta: number): string {
  const [y, m] = month.split('-').map(Number);
  const d = new Date(y, m - 1 + delta, 1);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
}
