import { TestBed } from '@angular/core/testing';
import { UseCaseRegistry } from './use-case-registry';

/** Traceability guard: registry luôn phải bao phủ đủ 203 UC và không được trùng mã. */
describe('UseCaseRegistry', () => {
  it('covers UC-001 through UC-203 exactly once', () => {
    TestBed.configureTestingModule({ providers: [UseCaseRegistry] });
    const registry = TestBed.inject(UseCaseRegistry);
    expect(registry.all).toHaveLength(203);
    expect(new Set(registry.all.map((item) => item.id)).size).toBe(203);
    expect(registry.all[0].id).toBe('UC-001');
    expect(registry.all[202].id).toBe('UC-203');
  });
});
