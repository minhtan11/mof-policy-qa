import { Injectable, inject } from '@angular/core';
import { Dossier } from '../models/domain.models';
import { MockDbService } from './mock-db.service';

export type OutgoingTab = 'all' | 'answered' | 'published';

export interface OutgoingDocRow {
  id: string;
  code: string;
  title: string;
  status: 'answered' | 'published';
  issuedAt: string;
  topicId: string;
  assignedTo?: string;
}

/** Sổ văn bản đi — câu trả lời đã soạn / đã xuất bản từ MockDb. */
@Injectable({ providedIn: 'root' })
export class OutgoingDocsRepository {
  private readonly db = inject(MockDbService);

  list(tab: OutgoingTab = 'all', q = ''): OutgoingDocRow[] {
    const needle = q.trim().toLocaleLowerCase();
    return this.db
      .dossiers()
      .filter((d) => d.status === 'answered' || d.status === 'published')
      .filter((d) => (tab === 'all' ? true : d.status === tab))
      .map(toRow)
      .filter((row) => {
        if (!needle) return true;
        return `${row.code} ${row.title}`.toLocaleLowerCase().includes(needle);
      })
      .sort((a, b) => b.issuedAt.localeCompare(a.issuedAt));
  }

  counts(): Record<OutgoingTab, number> {
    const all = this.db.dossiers().filter((d) => d.status === 'answered' || d.status === 'published');
    return {
      all: all.length,
      answered: all.filter((d) => d.status === 'answered').length,
      published: all.filter((d) => d.status === 'published').length,
    };
  }
}

function toRow(d: Dossier): OutgoingDocRow {
  const issued =
    d.timeline.find((t) => /xuất bản|phát hành|publish/i.test(t.title))?.at ??
    d.timeline[d.timeline.length - 1]?.at ??
    d.receivedAt;
  return {
    id: d.id,
    code: d.code,
    title: d.question,
    status: d.status as 'answered' | 'published',
    issuedAt: issued,
    topicId: d.topicId,
    assignedTo: d.assignedTo,
  };
}
