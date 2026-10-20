import { TestBed } from '@angular/core/testing';
import { PortalHomeRepository } from './portal-home.repository';

/** UC-162..UC-165 — acceptance PUB-home: tin nổi bật, thông báo mới nhất, lọc KPI ngân sách theo tab/năm. */
describe('PortalHomeRepository', () => {
  let repo: PortalHomeRepository;

  beforeEach(() => {
    repo = TestBed.inject(PortalHomeRepository);
  });

  it('returns a featured news item and up to three others', () => {
    const { featured, others } = repo.news();
    expect(featured?.featured).toBe(true);
    expect(others.length).toBeLessThanOrEqual(3);
    expect(others).not.toContain(featured);
  });

  it('sorts notices newest first', () => {
    const items = repo.notices();
    for (let i = 1; i < items.length; i++) {
      expect(items[i - 1].publishedAt >= items[i].publishedAt).toBe(true);
    }
  });

  it('filters KPIs by tab and year', () => {
    const year = repo.budgetYears()[0];
    expect(repo.kpis(year, 'overview').length).toBe(4);
    expect(repo.kpis(year, 'revenue').every((k) => k.category === 'revenue')).toBe(true);
    expect(repo.kpis(1900, 'overview')).toEqual([]);
  });

  it('provides at least one hero slide with i18n keys', () => {
    expect(repo.heroSlides.length).toBeGreaterThan(0);
    expect(repo.heroSlides.every((s) => s.titleKey.startsWith('portal.hero.'))).toBe(true);
  });

  it('provides four quarters for both series', () => {
    const data = repo.budget(repo.budgetYears()[0]);
    expect(data?.quarterly.revenue.length).toBe(4);
    expect(data?.quarterly.expenditure.length).toBe(4);
  });
});
