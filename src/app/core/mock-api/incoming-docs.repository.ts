import { Injectable, computed, inject } from '@angular/core';
import { IncomingDocRef, IncomingDocStatus } from './workspace-register-fixtures';
import { INCOMING_LINKS } from './dossier-seed';
import { MockDbService } from './mock-db.service';

/** Sổ văn bản đến — mã sổ gắn hồ sơ; tiêu đề và người gửi lấy từ bảng hồ sơ. */
@Injectable({ providedIn: 'root' })
export class IncomingDocsRepository {
  private readonly db = inject(MockDbService);

  readonly docs = computed<IncomingDocRef[]>(() => {
    const byId = new Map(this.db.dossiers().map((dossier) => [dossier.id, dossier]));
    return INCOMING_LINKS.flatMap((link) => {
      const dossier = byId.get(link.dossierId);
      if (!dossier) return [];
      return [
        {
          id: link.id,
          code: link.code,
          title: dossier.question,
          sender: dossier.sender,
          receivedAt: dossier.receivedAt,
          status: link.status,
          dossierId: dossier.id,
          dossierCode: dossier.code,
        },
      ];
    });
  });

  list(status: IncomingDocStatus | 'all' = 'all', q = ''): IncomingDocRef[] {
    const needle = q.trim().toLocaleLowerCase();
    return this.docs()
      .filter((d) => (status === 'all' ? true : d.status === status))
      .filter((d) => {
        if (!needle) return true;
        return `${d.code} ${d.title} ${d.sender} ${d.dossierCode ?? ''}`.toLocaleLowerCase().includes(needle);
      })
      .sort((a, b) => b.receivedAt.localeCompare(a.receivedAt));
  }

  counts(): Record<IncomingDocStatus | 'all', number> {
    const all = this.docs();
    return {
      all: all.length,
      new: all.filter((d) => d.status === 'new').length,
      distributed: all.filter((d) => d.status === 'distributed').length,
      processing: all.filter((d) => d.status === 'processing').length,
      done: all.filter((d) => d.status === 'done').length,
    };
  }
}
