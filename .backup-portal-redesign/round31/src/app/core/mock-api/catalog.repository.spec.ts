import { TestBed } from '@angular/core/testing';
import { CatalogRepository } from './catalog.repository';

/** UC-060..UC-074 */
describe('CatalogRepository', () => {
  let repo: CatalogRepository;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    repo = TestBed.inject(CatalogRepository);
  });

  it('toggles catalog active flag', () => {
    const id = repo.entries()[0].id;
    const before = repo.entries()[0].active;
    repo.toggle(id);
    expect(repo.entries().find((item) => item.id === id)?.active).toBe(!before);
  });

  it('adds a catalog entry and lists active by type', () => {
    repo.add({ type: 'tag', code: 'DEMO', label: 'Demo tag', active: true, sortOrder: 99 });
    expect(repo.activeByType('tag').some((item) => item.code === 'DEMO')).toBe(true);
  });
});
