import { Injectable } from '@angular/core';
import { TOPICS } from './demo-data';
import { PUBLIC_QA, PublicQa, QA_FIXTURE_NOW, QA_TYPES, QaStatus, QaType } from './public-qa-fixtures';

export type QaPeriod = 'all' | '7d' | '30d' | '90d' | '365d';
export type QaSort = 'newest' | 'oldest' | 'views' | 'replies';

export interface QaQuery {
  q?: string;
  topic?: string | null;
  types?: QaType[];
  statuses?: QaStatus[];
  period?: QaPeriod;
  sort?: QaSort;
}

const PERIOD_DAYS: Record<QaPeriod, number> = { all: Infinity, '7d': 7, '30d': 30, '90d': 90, '365d': 365 };

/** Kho hỏi đáp công khai (mock, client-side): tìm kiếm, lọc, sắp xếp, chủ đề phổ biến, câu hỏi nổi bật. */
@Injectable({ providedIn: 'root' })
export class PublicQaRepository {
  readonly topics = TOPICS;

  search(query: QaQuery, now = QA_FIXTURE_NOW): PublicQa[] {
    const q = (query.q ?? '').trim().toLocaleLowerCase('vi');
    const limit = PERIOD_DAYS[query.period ?? 'all'];
    const t0 = new Date(now).getTime();
    const items = PUBLIC_QA.filter(
      (r) =>
        (!q || [r.code, r.title, r.answer ?? '', r.note ?? ''].join(' ').toLocaleLowerCase('vi').includes(q)) &&
        (!query.topic || r.topicId === query.topic) &&
        (!query.types?.length || query.types.includes(r.type)) &&
        (!query.statuses?.length || query.statuses.includes(r.status)) &&
        (t0 - new Date(r.postedAt).getTime()) / 86_400_000 <= limit,
    );
    const sort = query.sort ?? 'newest';
    const by: Record<QaSort, (a: PublicQa, b: PublicQa) => number> = {
      newest: (a, b) => b.postedAt.localeCompare(a.postedAt),
      oldest: (a, b) => a.postedAt.localeCompare(b.postedAt),
      views: (a, b) => b.views - a.views,
      replies: (a, b) => b.replies - a.replies,
    };
    return [...items].sort(by[sort]);
  }

  /** Số câu hỏi theo loại (toàn kho) — hiển thị cạnh checkbox. */
  typeCounts(): Record<QaType, number> {
    return Object.fromEntries(QA_TYPES.map((t) => [t, PUBLIC_QA.filter((r) => r.type === t).length])) as Record<QaType, number>;
  }

  /** Chủ đề phổ biến: xếp hạng theo số câu hỏi (fixture TOPICS). */
  popularTopics(limit = 5): { id: string; name: string; count: number }[] {
    return [...TOPICS].sort((a, b) => b.count - a.count).slice(0, limit).map((t) => ({ id: t.id, name: t.name, count: t.count }));
  }

  /** Câu hỏi nổi bật: đã trả lời, nhiều lượt xem nhất. */
  featured(limit = 3): PublicQa[] {
    return PUBLIC_QA.filter((r) => r.status === 'answered').sort((a, b) => b.views - a.views).slice(0, limit);
  }

  topicName(id: string): string {
    return TOPICS.find((t) => t.id === id)?.name ?? id;
  }
}
