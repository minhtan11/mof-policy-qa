import { Injectable, computed, inject } from '@angular/core';
import { AuthService } from '../auth/auth.service';
import { Dossier, DossierCollaboration } from '../models/domain.models';
import { MockDbService } from './mock-db.service';
import { scopeFor } from './workspace-overview.repository';

export type CoopCollabTab = 'all' | 'open' | 'done';

export const COOP_COLLAB_TABS: { id: CoopCollabTab; labelKey: string }[] = [
  { id: 'all', labelKey: 'coopDossiers.tabAll' },
  { id: 'open', labelKey: 'coopDossiers.tabOpen' },
  { id: 'done', labelKey: 'coopDossiers.tabDone' },
];

export interface CoopRow {
  dossier: Dossier;
  collaboration: DossierCollaboration;
}

const norm = (s: string) =>
  s
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/đ/g, 'd')
    .replace(/Đ/g, 'D')
    .toLowerCase();

/** Hộp phối hợp — hồ sơ có yêu cầu phối hợp trong phạm vi vai trò. */
@Injectable({ providedIn: 'root' })
export class CoopDossierRepository {
  private readonly db = inject(MockDbService);
  private readonly auth = inject(AuthService);

  readonly scopedIds = computed(() => new Set(scopeFor(this.db.dossiers(), this.auth.user()).map((d) => d.id)));

  readonly allRows = computed(() =>
    this.db.listCollaborations('all').filter((r) => this.scopedIds().has(r.dossier.id)),
  );

  readonly counts = computed(() => {
    const rows = this.allRows();
    return {
      all: rows.length,
      open: rows.filter((r) => r.collaboration.status === 'open').length,
      done: rows.filter((r) => r.collaboration.status === 'done').length,
    };
  });

  list(tab: CoopCollabTab, q: string): CoopRow[] {
    const needle = norm(q.trim());
    return this.allRows()
      .filter((r) => tab === 'all' || r.collaboration.status === tab)
      .filter((r) => {
        if (!needle) return true;
        const hay = `${r.dossier.code} ${r.dossier.question} ${r.collaboration.unitName} ${r.collaboration.note}`;
        return norm(hay).includes(needle);
      });
  }
}
