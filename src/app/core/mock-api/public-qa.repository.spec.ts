import { TestBed } from '@angular/core/testing';
import { PublicQaRepository } from './public-qa.repository';
import { QA_FIXTURE_NOW } from './public-qa-fixtures';

describe('PublicQaRepository', () => {
  const repo = () => TestBed.inject(PublicQaRepository);

  beforeEach(() => localStorage.clear());

  it('searches by code, title and answer text (case-insensitive)', () => {
    expect(repo().search({ q: 'cstc-2026-000140' }).map((r) => r.code)).toEqual(['CSTC-2026-000140']);
    expect(repo().search({ q: 'HÓA ĐƠN' }).length).toBeGreaterThan(1);
  });

  it('filters by topic, type, status and period', () => {
    expect(repo().search({ topic: 'tax' }).every((r) => r.topicId === 'tax')).toBe(true);
    expect(repo().search({ types: ['feedback'] }).every((r) => r.type === 'feedback')).toBe(true);
    expect(repo().search({ types: ['feedback'] }).length).toBeGreaterThan(0);
    expect(repo().search({ statuses: ['processing'] }).every((r) => r.status === 'processing')).toBe(true);
    expect(repo().search({ statuses: ['processing'] }).length).toBeGreaterThan(0);
    const now = new Date(QA_FIXTURE_NOW).getTime();
    const within = repo()
      .search({})
      .filter((r) => (now - new Date(r.postedAt).getTime()) / 86_400_000 <= 7).length;
    expect(repo().search({ period: '7d' }).length).toBe(within);
    expect(within).toBeGreaterThan(0);
    expect(within).toBeLessThan(repo().search({}).length);
  });

  it('sorts by views and oldest', () => {
    const v = repo().search({ sort: 'views' });
    expect(v[0].views).toBeGreaterThanOrEqual(v[1].views);
    const oldest = repo().search({ sort: 'oldest' });
    expect(oldest[0].postedAt <= oldest[oldest.length - 1].postedAt).toBe(true);
  });

  it('ranks popular topics and featured answered items', () => {
    expect(repo().popularTopics()[0].id).toBe('tax');
    expect(repo().featured().every((r) => r.status === 'answered')).toBe(true);
    const listed = repo().listings().filter((r) => r.topicId === 'tax').length;
    expect(repo().popularTopics()[0].count).toBe(listed);
  });
});
