import { TestBed } from '@angular/core/testing';
import { GuideRepository } from './guide.repository';
import { GUIDE_FAQS, GUIDE_SECTIONS } from './guide-fixtures';

/** UC-162..UC-165 — repository hướng dẫn cổng. */
describe('GuideRepository', () => {
  let repo: GuideRepository;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    repo = TestBed.inject(GuideRepository);
  });

  it('returns the three journey sections (ask, track, evaluate)', () => {
    const sections = repo.sections();
    expect(sections.map((s) => s.id)).toEqual(['ask', 'track', 'evaluate']);
    expect(sections).toBe(GUIDE_SECTIONS);
    expect(sections.every((s) => s.steps.length >= 3)).toBe(true);
  });

  it('returns FAQs from fixtures (no inline mock data)', () => {
    expect(repo.faqs()).toEqual(GUIDE_FAQS);
    expect(repo.faqs().length).toBeGreaterThanOrEqual(5);
  });
});
