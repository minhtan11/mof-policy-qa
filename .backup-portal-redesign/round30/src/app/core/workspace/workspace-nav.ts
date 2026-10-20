import { DossierStatus, UserRole } from '../models/domain.models';

/**
 * Menu workspace (sidebar + lối tắt tìm kiếm). CHỈ gồm route có thật:
 * /workspace (+ ?filter= hàng đợi), /workspace/tra-cuu, /workspace/ho-so/:id (con của Hồ sơ),
 * /admin (+ ?tab=), /portal, /portal/tra-cuu. Mục mockup không có route bị bỏ.
 */
export type WsQueueBadge = DossierStatus | 'all';

export interface WsNavItem {
  id: string;
  labelKey: string;
  /** Flaticon UIcons (rr) slug. */
  icon: string;
  route: string;
  query?: Record<string, string>;
  /** Giá trị mặc định của query khi URL không có (vd. admin tab = org). */
  queryDefaults?: Record<string, string>;
  /** Mục chỉ sáng khi URL KHÔNG có các query này (Tổng quan ≠ hàng đợi có filter). */
  excludeQuery?: string[];
  /** Tiền tố đường dẫn khác cũng tính là mục này (vd. chi tiết hồ sơ). */
  activePrefixes?: string[];
  /** Đếm từ MockDbService.activeQueue(status). */
  badge?: WsQueueBadge;
  roles?: UserRole[];
}

export interface WsNavGroup {
  id: string;
  titleKey: string;
  icon: string;
  roles?: UserRole[];
  items: WsNavItem[];
}

const ADMIN: UserRole[] = ['system-admin'];

export const WS_HOME: WsNavItem = { id: 'overview', labelKey: 'workspace.navOverview', icon: 'apps', route: '/workspace', excludeQuery: ['filter'] };

export const WS_NAV_GROUPS: WsNavGroup[] = [
  {
    id: 'dossiers',
    titleKey: 'wsNav.group.dossiers',
    icon: 'folder-open',
    items: [
      { id: 'queue-all', labelKey: 'wsNav.queueAll', icon: 'folder', route: '/workspace', query: { filter: 'all' }, badge: 'all', activePrefixes: ['/workspace/ho-so'] },
      { id: 'queue-new', labelKey: 'wsNav.queueNew', icon: 'inbox-in', route: '/workspace', query: { filter: 'new' }, badge: 'new' },
      { id: 'queue-processing', labelKey: 'wsNav.queueProcessing', icon: 'hourglass-end', route: '/workspace', query: { filter: 'processing' }, badge: 'processing' },
      { id: 'queue-approval', labelKey: 'wsNav.queueApproval', icon: 'shield-check', route: '/workspace', query: { filter: 'waiting-approval' }, badge: 'waiting-approval' },
    ],
  },
  {
    id: 'work',
    titleKey: 'wsNav.group.work',
    icon: 'search-alt',
    items: [{ id: 'search', labelKey: 'search.title', icon: 'search-alt', route: '/workspace/tra-cuu' }],
  },
  {
    id: 'utilities',
    titleKey: 'wsNav.group.utilities',
    icon: 'apps-sort',
    items: [
      { id: 'portal', labelKey: 'wsNav.portal', icon: 'globe', route: '/portal' },
      { id: 'portal-lookup', labelKey: 'wsNav.portalLookup', icon: 'book-alt', route: '/portal/tra-cuu' },
    ],
  },
  {
    id: 'docs',
    titleKey: 'wsNav.group.docs',
    icon: 'document-signed',
    roles: ADMIN,
    items: [
      { id: 'legal', labelKey: 'wsNav.legal', icon: 'document-signed', route: '/admin', query: { tab: 'legal' }, queryDefaults: { tab: 'org' } },
      { id: 'reports', labelKey: 'wsNav.reports', icon: 'chart-histogram', route: '/admin', query: { tab: 'reports' }, queryDefaults: { tab: 'org' } },
    ],
  },
  {
    id: 'system',
    titleKey: 'wsNav.group.system',
    icon: 'settings',
    roles: ADMIN,
    items: [
      { id: 'org', labelKey: 'wsNav.org', icon: 'sitemap', route: '/admin', query: { tab: 'org' }, queryDefaults: { tab: 'org' } },
      { id: 'users', labelKey: 'wsNav.users', icon: 'users-alt', route: '/admin', query: { tab: 'users' }, queryDefaults: { tab: 'org' } },
      { id: 'roles', labelKey: 'wsNav.roles', icon: 'lock', route: '/admin', query: { tab: 'roles' }, queryDefaults: { tab: 'org' } },
      { id: 'catalog', labelKey: 'wsNav.catalog', icon: 'list-check', route: '/admin', query: { tab: 'catalog' }, queryDefaults: { tab: 'org' } },
      { id: 'workflow', labelKey: 'wsNav.workflow', icon: 'workflow', route: '/admin', query: { tab: 'workflow' }, queryDefaults: { tab: 'org' } },
      { id: 'ai', labelKey: 'wsNav.ai', icon: 'sparkles', route: '/admin', query: { tab: 'ai' }, queryDefaults: { tab: 'org' } },
      { id: 'ops', labelKey: 'wsNav.ops', icon: 'gears', route: '/admin', query: { tab: 'ops' }, queryDefaults: { tab: 'org' } },
    ],
  },
];

export const WS_SUPPORT_PHONE = '024.2220.2828';

const allowed = (roles: UserRole[] | undefined, role: UserRole | null) => !roles || (!!role && roles.includes(role));

/** Nhóm + mục hiển thị theo vai trò (nhóm rỗng bị ẩn). */
export function visibleGroups(role: UserRole | null, groups: WsNavGroup[] = WS_NAV_GROUPS): WsNavGroup[] {
  return groups
    .filter((g) => allowed(g.roles, role))
    .map((g) => ({ ...g, items: g.items.filter((i) => allowed(i.roles, role)) }))
    .filter((g) => g.items.length > 0);
}

/** Mục sáng theo path + query hiện tại. */
export function isItemActive(item: WsNavItem, path: string, query: Record<string, string>): boolean {
  if (item.activePrefixes?.some((p) => path === p || path.startsWith(`${p}/`))) {
    return true;
  }
  if (path !== item.route) {
    return false;
  }
  if (item.excludeQuery?.some((k) => query[k] != null && query[k] !== '')) {
    return false;
  }
  return Object.entries(item.query ?? {}).every(([k, v]) => (query[k] ?? item.queryDefaults?.[k]) === v);
}
