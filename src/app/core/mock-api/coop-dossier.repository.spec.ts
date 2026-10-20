import { TestBed } from '@angular/core/testing';
import { AuthService } from '../auth/auth.service';
import { MockDbService } from './mock-db.service';
import { CoopDossierRepository } from './coop-dossier.repository';

describe('CoopDossierRepository (UC-150)', () => {
  beforeEach(() => {
    localStorage.clear();
    TestBed.configureTestingModule({});
  });

  it('seed có ≥1 yêu cầu phối hợp mở và list lọc theo tab', () => {
    const db = TestBed.inject(MockDbService);
    expect(db.listCollaborations('open').length).toBeGreaterThanOrEqual(1);

    const auth = TestBed.inject(AuthService);
    auth.loginAs('specialist');
    const repo = TestBed.inject(CoopDossierRepository);
    expect(repo.counts().open).toBeGreaterThanOrEqual(1);
    expect(repo.list('open', '').every((r) => r.collaboration.status === 'open')).toBe(true);
    expect(repo.list('open', 'ngan sach').length).toBeGreaterThan(0);
  });
});
