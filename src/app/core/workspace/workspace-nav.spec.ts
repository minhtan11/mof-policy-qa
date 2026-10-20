import { routes } from '../../app.routes';
import { UserRole } from '../models/domain.models';
import { WS_HOME, WS_NAV_GROUPS, WS_PROFILE_ROUTE, WS_ROLE_MATRIX, WS_SOON_PAGES, isItemActive, visibleGroups } from './workspace-nav';

/** R30 — mô hình menu workspace: ma trận vai trò + mục Sắp ra mắt có route riêng. */
describe('workspace nav model', () => {
  const all = WS_NAV_GROUPS.flatMap((g) => g.items);
  const item = (id: string) => all.find((i) => i.id === id)!;
  const ids = (role: UserRole | null) => visibleGroups(role).flatMap((g) => g.items.map((i) => i.id));

  it('applies the role matrix: Văn bản for internal roles, Hệ thống for admin only', () => {
    expect(visibleGroups('reception').map((g) => g.id)).toEqual(['dossiers', 'work', 'docs']);
    expect(visibleGroups('specialist').map((g) => g.id)).toEqual(['dossiers', 'work', 'docs']);
    expect(visibleGroups('system-admin').map((g) => g.id)).toEqual(['dossiers', 'work', 'docs', 'system']);
    expect(visibleGroups(null)).toEqual([]);
    expect(visibleGroups('public')).toEqual([]);
    expect(ids('reception')).not.toContain('internal-dossiers');
    expect(ids('specialist')).toContain('coop-dossiers');
    expect(ids('leader')).toEqual(expect.arrayContaining(['queue-approval', 'reports-soon', 'data-store']));
    expect(ids('leader')).not.toContain('reports');
    expect(ids('system-admin')).toEqual(expect.arrayContaining(['reports', 'legal', 'admin', 'config']));
    expect(ids('system-admin')).not.toContain('reports-soon');
  });

  it('every nav item is in the matrix and only links to admin routes for admins', () => {
    for (const i of all) expect(WS_ROLE_MATRIX[i.id]).toBeDefined();
    for (const role of ['reception', 'specialist', 'leader', 'coordinator'] as UserRole[]) {
      expect(visibleGroups(role).flatMap((g) => g.items).some((i) => i.route === '/admin')).toBe(false);
    }
  });

  it('every item points to an existing route; G5 soon list empty; real screens wired', () => {
    const paths = new Set(routes.map((r) => `/${r.path}`));
    for (const i of [WS_HOME, ...all]) expect(paths.has(i.route)).toBe(true);
    for (const p of WS_SOON_PAGES) {
      const r = routes.find((x) => x.path === p.path)!;
      expect(r.data).toEqual({ titleKey: p.titleKey, icon: p.icon, bodyKey: p.bodyKey, shell: 'workspace' });
      expect(r.canActivate?.length).toBe(1);
    }
    expect(WS_SOON_PAGES).toEqual([]);
    expect(item('calendar')).toMatchObject({ route: '/workspace/lich-lam-viec', labelKey: 'wsNav.calendar' });
    expect(item('calendar').soon).toBeFalsy();
    expect(item('incoming')).toMatchObject({ route: '/workspace/van-ban-den' });
    expect(item('outgoing')).toMatchObject({ route: '/workspace/van-ban-di' });
    expect(item('internal-docs')).toMatchObject({ route: '/workspace/tai-lieu-noi-bo' });
    expect(item('data-store')).toMatchObject({ route: '/workspace/kho-du-lieu' });
    expect(item('my-dossiers')).toMatchObject({ route: '/workspace/ho-so-cua-toi' });
    expect(item('internal-dossiers')).toMatchObject({ route: '/workspace/ho-so-noi-bo' });
    expect(item('coop-dossiers')).toMatchObject({ route: '/workspace/ho-so-phoi-hop' });
    expect(item('reports-soon')).toMatchObject({ route: '/workspace/bao-cao-thong-ke' });
    expect(item('my-dossiers').soon).toBeFalsy();
    expect(item('internal-dossiers').soon).toBeFalsy();
    expect(item('coop-dossiers').soon).toBeFalsy();
    expect(item('reports-soon').soon).toBeFalsy();
    expect(item('search').soon).toBeFalsy();
    expect(item('incoming').soon).toBeFalsy();
    expect(item('outgoing').soon).toBeFalsy();
    expect(item('internal-docs').soon).toBeFalsy();
    expect(item('data-store').soon).toBeFalsy();
    expect(WS_PROFILE_ROUTE).toBe('/workspace/ho-so-ca-nhan');
    expect(paths.has(WS_PROFILE_ROUTE)).toBe(true);
    expect(new Set(WS_SOON_PAGES.map((p) => p.path)).size).toBe(WS_SOON_PAGES.length);
  });

  it('matches path + query (defaults, exclusions, prefixes)', () => {
    expect(isItemActive(WS_HOME, '/workspace', {})).toBe(true);
    expect(isItemActive(WS_HOME, '/workspace', { filter: 'new' })).toBe(false);
    expect(isItemActive(item('queue-new'), '/workspace', { filter: 'new' })).toBe(true);
    expect(isItemActive(item('queue-all'), '/workspace/ho-so/d-001', {})).toBe(true);
    expect(isItemActive(item('admin'), '/admin', {})).toBe(true);
    expect(isItemActive(item('users'), '/admin', {})).toBe(false);
    expect(isItemActive(item('config'), '/admin', { tab: 'workflow' })).toBe(true);
    expect(isItemActive(item('calendar'), '/workspace/lich-lam-viec', {})).toBe(true);
  });
});
