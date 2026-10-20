import { TestBed } from '@angular/core/testing';
import { PermissionRepository } from './permission.repository';

/** UC-031..UC-040 */
describe('PermissionRepository', () => {
  let repo: PermissionRepository;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    repo = TestBed.inject(PermissionRepository);
  });

  it('checks role action permissions including wildcards', () => {
    expect(repo.hasPermission('specialist', 'dossier.draft')).toBe(true);
    expect(repo.hasPermission('specialist', 'admin.users')).toBe(false);
    expect(repo.hasPermission('system-admin', 'admin.users')).toBe(true);
  });
});
