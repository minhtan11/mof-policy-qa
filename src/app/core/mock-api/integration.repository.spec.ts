import { TestBed } from '@angular/core/testing';
import { IntegrationRepository } from './integration.repository';

/** UC-052..UC-059 */
describe('IntegrationRepository', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({});
  });

  it('exposes six mock channels and toggles enabled', () => {
    const repo = TestBed.inject(IntegrationRepository);
    expect(repo.channels().length).toBe(6);
    const id = repo.channels()[0].id;
    const before = repo.channels()[0].enabled;
    expect(repo.toggle(id)).toBe(true);
    expect(repo.channels().find((c) => c.id === id)?.enabled).toBe(!before);
  });

  it('tests connection locally without changing channel count', () => {
    const repo = TestBed.inject(IntegrationRepository);
    const email = repo.channels().find((c) => c.kind === 'email')!;
    const result = repo.testConnection(email.id);
    expect(result?.ok).toBe(true);
    expect(result?.status).toBe('connected');
    expect(repo.channels().find((c) => c.id === email.id)?.lastCheckedAt).toBe(result!.checkedAt);
  });
});
