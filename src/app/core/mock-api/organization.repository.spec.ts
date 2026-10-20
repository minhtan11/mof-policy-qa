import { TestBed } from '@angular/core/testing';
import { OrganizationRepository } from './organization.repository';

/** UC-009..UC-017 */
describe('OrganizationRepository', () => {
  let repo: OrganizationRepository;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    repo = TestBed.inject(OrganizationRepository);
  });

  it('exposes a ministry root and child units', () => {
    expect(repo.roots().length).toBeGreaterThan(0);
    expect(repo.children(repo.roots()[0].id).length).toBeGreaterThan(0);
  });

  it('adds and toggles organization units', () => {
    const created = repo.add({
      code: 'TEST',
      name: 'Đơn vị kiểm thử',
      parentId: repo.roots()[0].id,
      intakeTopicIds: ['tax'],
      active: true,
    });
    expect(repo.find(created.id)?.name).toBe('Đơn vị kiểm thử');
    repo.toggle(created.id);
    expect(repo.find(created.id)?.active).toBe(false);
  });
});
