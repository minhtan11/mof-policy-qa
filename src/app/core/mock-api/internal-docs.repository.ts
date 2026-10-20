import { Injectable, inject } from '@angular/core';
import { CatalogRepository } from './catalog.repository';
import { ANSWER_TEMPLATE_FIXTURES, AnswerTemplateRef } from './workspace-register-fixtures';

/** Thư viện mẫu trả lời — ưu tiên catalog `answer-template`, fallback fixture. */
@Injectable({ providedIn: 'root' })
export class InternalDocsRepository {
  private readonly catalog = inject(CatalogRepository);

  list(q = ''): AnswerTemplateRef[] {
    const needle = q.trim().toLocaleLowerCase();
    return this.templates()
      .filter((t) => {
        if (!needle) return true;
        return `${t.code} ${t.title} ${t.body}`.toLocaleLowerCase().includes(needle);
      })
      .sort((a, b) => b.usageCount - a.usageCount);
  }

  counts(): { all: number; active: number } {
    const all = this.templates();
    return { all: all.length, active: all.filter((t) => t.active).length };
  }

  private templates(): AnswerTemplateRef[] {
    const fromCatalog = this.catalog.byType('answer-template').map((e) => ({
      id: e.id,
      code: e.code,
      title: e.label,
      body: e.label,
      topicId: 'other',
      usageCount: Math.max(1, 40 - e.sortOrder * 5),
      active: e.active,
    }));
    return fromCatalog.length > 0 ? fromCatalog : structuredClone(ANSWER_TEMPLATE_FIXTURES);
  }
}
