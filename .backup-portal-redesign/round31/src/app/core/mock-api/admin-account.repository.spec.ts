import { TestBed } from '@angular/core/testing';
import { AdminAccountRepository } from './admin-account.repository';

/** UC-018..UC-030 */
describe('AdminAccountRepository', () => {
  let repo: AdminAccountRepository;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    repo = TestBed.inject(AdminAccountRepository);
  });

  it('masks email for UI display', () => {
    expect(repo.maskEmail('hung.lq@mof.gov.vn')).toBe('hu***@mof.gov.vn');
  });

  it('toggles account active status', () => {
    const id = repo.accounts()[0].id;
    const before = repo.accounts()[0].active;
    expect(repo.toggleActive(id)).toBe(true);
    expect(repo.accounts().find((item) => item.id === id)?.active).toBe(!before);
  });
});
