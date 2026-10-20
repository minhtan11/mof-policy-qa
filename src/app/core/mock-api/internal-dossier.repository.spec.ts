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
    expect(repo.scoped().length).toBe(TestBed.inject(MockDbService).dossiers().length);
    expect(repo.kpi().all).toBeGreaterThan(0);

    auth.loginAs('specialist');
    expect(repo.scoped().every((d) => d.assignedTo === 'Lê Quốc Hưng')).toBe(true);
    expect(repo.list('processing', '').every((d) => d.status === 'processing')).toBe(true);
  });
});
