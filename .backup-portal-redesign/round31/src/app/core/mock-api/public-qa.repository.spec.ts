import { TestBed } from '@angular/core/testing';
import { PublicQaRepository } from './public-qa.repository';
import { PUBLIC_QA } from './public-qa-fixtures';

describe('PublicQaRepository', () => {
  const repo = () => TestBed.inject(PublicQaRepository);

  it('searches by code, title and answer text (case-insensitive)', () => {
    expect(repo().search({ q: 'cstc-2026-000140' }).map((r) => r.id)).toEqual(['qa-1']);
    expect(repo().search({ q: 'HÓA ĐƠN' }).length).toBeGreaterThan(1);
  });

  it('filters by topic, type, status and period', () => {
    expect(repo().search({ topic: 'tax' }).every((r) => r.topicId === 'tax')).toBe(true);
    expect(repo().search({ types: ['feedback'] }).every((r) => r.type === 'feedback')).toBe(true);
    expect(repo().search({ statuses: ['processing'] }).every((r) => r.status === 'processing')).toBe(true);
    expect(repo().search({ period: '7d' }).length).toBe(PUBLIC_QA.filter((_, i) => i < 7).length);
  });

  it('sorts by views and oldest', () => {
    const v = repo().search({ sort: 'views' });
    expect(v[0].views).toBeGreaterThanOrEqual(v[1].views);
    expect(repo().search({ sort: 'oldest' })[0].id).toBe('qa-24');
  });

  it('ranks popular topics and featured answered items', () => {
    expect(repo().popularTopics()[0].id).toBe('tax');
    expect(repo().featured().every((r) => r.status === 'answered')).toBe(true);
  });
});
