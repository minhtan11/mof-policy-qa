import { TestBed } from '@angular/core/testing';
import { AuthService } from '../auth/auth.service';
import { MockDbService } from './mock-db.service';
import { InternalDossierRepository } from './internal-dossier.repository';

describe('InternalDossierRepository (UC-142..)', () => {
  beforeEach(() => {
    localStorage.clear();
    TestBed.configureTestingModule({});
  });

  it('leader thấy toàn bộ phạm vi; specialist chỉ assigned', () => {
    const auth = TestBed.inject(AuthService);
    const repo = TestBed.inject(InternalDossierRepository);

    auth.loginAs('leader');
    const db = TestBed.inject(MockDbService);
    expect(repo.scoped().length).toBeGreaterThan(0);
    expect(repo.scoped().length).toBeLessThan(db.dossiers().length);
    expect(repo.scoped().every((d) => d.handlingUnitId === 'org-tax')).toBe(true);
    expect(repo.kpi().all).toBe(repo.scoped().length);
    expect(repo.kpi().open).toBe(repo.counts().all);
    expect(repo.kpi().processing).toBe(repo.counts().processing);

    auth.loginAs('specialist');
    expect(repo.scoped().every((d) => d.assignedTo === 'Lê Quốc Hưng')).toBe(true);
    expect(repo.list('processing', '').every((d) => ['processing', 'awaiting-clarification', 'awaiting-collaboration', 'returned'].includes(d.status))).toBe(true);
  });
});
