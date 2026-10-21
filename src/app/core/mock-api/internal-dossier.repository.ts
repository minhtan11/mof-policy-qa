import { Injectable, computed, inject } from '@angular/core';
import { AuthService } from '../auth/auth.service';
import { Dossier } from '../models/domain.models';
import { MockDbService } from './mock-db.service';
import { WS_TABS, WsTab } from './workspace-overview-fixtures';
import { attentionList, isOverdue, scopeFor, tabCounts } from './workspace-overview.repository';

export type InternalStatusTab = WsTab;

export const INTERNAL_STATUS_TABS = WS_TABS;

/** Danh sách hồ sơ nội bộ theo phạm vi vai trò (giống hàng đợi W-01). */
@Injectable({ providedIn: 'root' })
export class InternalDossierRepository {
  private readonly db = inject(MockDbService);
  private readonly auth = inject(AuthService);

  readonly scoped = computed(() => scopeFor(this.db.dossiers(), this.auth.user()));
  readonly counts = computed(() => tabCounts(this.scoped()));

  readonly kpi = computed(() => {
    const list = this.scoped();
    const now = Date.now();
    const counts = tabCounts(list);
    return {
      all: list.length,
      open: counts.all,
      overdue: list.filter((d) => isOverdue(d, now)).length,
      processing: counts.processing,
    };
  });

  list(tab: InternalStatusTab, q: string, priority: '' | Dossier['priority'] = '', topic = ''): Dossier[] {
    return attentionList(this.scoped(), { tab, q, priority, topic });
  }
}
