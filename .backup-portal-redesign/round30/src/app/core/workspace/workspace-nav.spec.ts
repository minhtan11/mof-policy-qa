import { WS_HOME, WS_NAV_GROUPS, isItemActive, visibleGroups } from './workspace-nav';

describe('workspace nav model', () => {
  const item = (id: string) => WS_NAV_GROUPS.flatMap((g) => g.items).find((i) => i.id === id)!;

  it('filters groups/items by role and drops empty groups', () => {
    expect(visibleGroups('reception').map((g) => g.id)).toEqual(['dossiers', 'work', 'utilities']);
    expect(visibleGroups('system-admin').map((g) => g.id)).toEqual(['dossiers', 'work', 'utilities', 'docs', 'system']);
    expect(visibleGroups(null).some((g) => g.id === 'system')).toBe(false);
  });

  it('only links to routes that exist', () => {
    const routes = new Set(['/workspace', '/workspace/tra-cuu', '/admin', '/portal', '/portal/tra-cuu']);
    for (const i of [WS_HOME, ...WS_NAV_GROUPS.flatMap((g) => g.items)]) expect(routes.has(i.route)).toBe(true);
  });

  it('matches path + query (defaults, exclusions, prefixes)', () => {
    expect(isItemActive(WS_HOME, '/workspace', {})).toBe(true);
    expect(isItemActive(WS_HOME, '/workspace', { filter: 'new' })).toBe(false);
    expect(isItemActive(item('queue-new'), '/workspace', { filter: 'new' })).toBe(true);
    expect(isItemActive(item('queue-all'), '/workspace/ho-so/d-001', {})).toBe(true);
    expect(isItemActive(item('org'), '/admin', {})).toBe(true);
    expect(isItemActive(item('users'), '/admin', {})).toBe(false);
    expect(isItemActive(item('users'), '/admin', { tab: 'users' })).toBe(true);
  });
});
