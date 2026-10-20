import { Injectable, signal } from '@angular/core';
import { IncomingDocRef, IncomingDocStatus, INCOMING_DOC_FIXTURES } from './workspace-register-fixtures';

/** Sổ văn bản đến — mock register liên kết hồ sơ tùy chọn. */
@Injectable({ providedIn: 'root' })
export class IncomingDocsRepository {
  readonly docs = signal<IncomingDocRef[]>(structuredClone(INCOMING_DOC_FIXTURES));

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
