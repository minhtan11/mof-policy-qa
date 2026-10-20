import { Injectable, computed, inject, signal } from '@angular/core';
import { AUDIT_LOG_FIXTURES } from './audit-fixtures';
import { MockDbService } from './mock-db.service';
import { AuditActionType, AuditLogEntry } from '../models/domain.models';

/** UC-176..UC-187 — nhật ký audit: fixture bất biến + flatten timeline hồ sơ */
@Injectable({ providedIn: 'root' })
export class AuditRepository {
  private readonly db = inject(MockDbService);
  private readonly actionFilter = signal<AuditActionType | 'all'>('all');

  readonly filter = this.actionFilter.asReadonly();

  readonly actionTypes: Array<AuditActionType | 'all'> = [
    'all',
    'login',
    'status-change',
    'assign',
    'approve',
    'publish',
    'recall',
    'config',
    'integration',
    'note',
    'timeline',
  ];

  /** Danh sách bất biến từ fixture + timeline; không cho ghi đè. */
  readonly entries = computed(() => {
    const fromTimeline: AuditLogEntry[] = this.db.dossiers().flatMap((dossier) =>
      dossier.timeline.map((event, index) => ({
        id: `tl-${dossier.id}-${index}`,
        actionType: 'timeline' as const,
        actor: event.actor,
        at: this.normalizeAt(event.at),
        dossierCode: dossier.code,
        summaryKey: 'admin.audit.summary.timeline',
      })),
    );
    const merged = [...AUDIT_LOG_FIXTURES, ...fromTimeline].sort(
      (a, b) => new Date(b.at).getTime() - new Date(a.at).getTime(),
    );
    const filter = this.actionFilter();
    return filter === 'all' ? merged : merged.filter((item) => item.actionType === filter);
  });

  setActionFilter(type: AuditActionType | 'all'): void {
    this.actionFilter.set(type);
  }

  private normalizeAt(at: string): string {
    // Timeline demo dùng "dd/MM/yyyy HH:mm" — chuyển ISO gần đúng để sort.
    const match = /^(\d{2})\/(\d{2})\/(\d{4})\s+(\d{2}):(\d{2})$/.exec(at.trim());
    if (!match) {
      return at;
    }
    const [, dd, mm, yyyy, hh, min] = match;
    return `${yyyy}-${mm}-${dd}T${hh}:${min}:00`;
  }
}
