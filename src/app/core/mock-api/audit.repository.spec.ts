import { TestBed } from '@angular/core/testing';
import { AuditRepository } from './audit.repository';
import { MockDbService } from './mock-db.service';

/** UC-176..UC-187 — admin audit tab */
describe('AuditRepository', () => {
  beforeEach(() => {
    localStorage.clear();
    TestBed.configureTestingModule({});
  });

  it('merges fixtures with dossier timeline and filters by action type', () => {
    const repo = TestBed.inject(AuditRepository);
    TestBed.inject(MockDbService);
    const all = repo.entries();
    expect(all.length).toBeGreaterThan(9);
    expect(all.some((e) => e.actionType === 'timeline')).toBe(true);
    expect(all.some((e) => e.dossierCode)).toBe(true);

    repo.setActionFilter('publish');
    expect(repo.entries().every((e) => e.actionType === 'publish')).toBe(true);
    expect(repo.entries().length).toBeGreaterThan(0);

    repo.setActionFilter('all');
    expect(repo.entries().length).toBe(all.length);
  });
});
