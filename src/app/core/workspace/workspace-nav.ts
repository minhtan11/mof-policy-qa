import { DossierStatus, UserRole } from '../models/domain.models';

/**
 * Menu workspace (sidebar + lối tắt tìm kiếm). Mục có màn thật trỏ route thật:
 * /workspace (+ ?filter=), /workspace/tra-cuu, /workspace/ho-so/:id, /admin (+ ?tab=), /portal, /portal/tra-cuu.
 * Mục mockup chưa có màn (`soon`) trỏ tới trang Sắp ra mắt riêng (WS_SOON_PAGES, sinh route trong app.routes).
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
  /** Chưa có màn hình — route tới trang Sắp ra mắt, gắn tag 'Sắp có'. */
  soon?: boolean;
}

export interface WsNavGroup {
  id: string;
  titleKey: string;
  icon: string;
  items: WsNavItem[];
}

/** Trang "Sắp ra mắt" của workspace — mỗi mục 1 path riêng, route data {titleKey, icon, bodyKey}. */
export interface WsSoonPage {
  id: string;
  /** Path không có dấu '/' đầu, vd. 'workspace/lich-lam-viec'. */
  path: string;
  titleKey: string;
  icon: string;
  bodyKey: string;
}

const soon = (id: string, slug: string, titleKey: string, icon: string): WsSoonPage => ({
  id,
  path: `workspace/${slug}`,
  titleKey,
  icon,
  bodyKey: `comingSoon.ws.${id}`,
});

export const WS_SOON_PAGES: WsSoonPage[] = [
  soon('my-dossiers', 'ho-so-cua-toi', 'wsNav.myDossiers', 'user'),
  soon('internal-dossiers', 'ho-so-noi-bo', 'wsNav.internalDossiers', 'folder-tree'),
  soon('coop-dossiers', 'ho-so-phoi-hop', 'wsNav.coopDossiers', 'users-alt'),
  soon('calendar', 'lich-lam-viec', 'wsNav.calendar', 'calendar'),
  soon('reports-soon', 'bao-cao-thong-ke', 'wsNav.reports', 'chart-histogram'),
  soon('incoming', 'van-ban-den', 'wsNav.incoming', 'inbox-in'),
  soon('outgoing', 'van-ban-di', 'wsNav.outgoing', 'paper-plane'),
  soon('internal-docs', 'tai-lieu-noi-bo', 'wsNav.internalDocs', 'document'),
  soon('data-store', 'kho-du-lieu', 'wsNav.dataStore', 'database'),
  soon('profile', 'ho-so-ca-nhan', 'wsNav.profile', 'user'),
];

const soonItem = (id: string): WsNavItem => {
  const p = WS_SOON_PAGES.find((x) => x.id === id)!;
  return { id, labelKey: p.titleKey, icon: p.icon, route: `/${p.path}`, soon: true };
};

/** Trang Sắp ra mắt cho "Hồ sơ cá nhân" (menu tài khoản). */
export const WS_PROFILE_ROUTE = `/${WS_SOON_PAGES.find((x) => x.id === 'profile')!.path}`;

// ---------------- Ma trận vai trò (1 nơi duy nhất) ----------------
const R: UserRole = 'reception';
const S: UserRole = 'specialist';
const L: UserRole = 'leader';
const C: UserRole = 'coordinator';
const A: UserRole = 'system-admin';
const INTERNAL: UserRole[] = [R, S, L, C, A];

/**
 * Mục nào hiển thị cho vai trò nào (theo id mục). Nhóm không còn mục nào thì ẩn.
 * Mục không có trong ma trận = mọi cán bộ nội bộ. Tài liệu: workspace-shell.mdc.
 */
export const WS_ROLE_MATRIX: Record<string, UserRole[]> = {
  'my-dossiers': INTERNAL,
  'internal-dossiers': [S, L, C, A],
  'coop-dossiers': [S, L, C],
  'queue-all': INTERNAL,
  'queue-new': [R, C, A],
  'queue-processing': [S, L, C, A],
  'queue-approval': [L, C, A],
  search: INTERNAL,
  calendar: INTERNAL,
  'reports-soon': [L, C],
  reports: [A],
  portal: INTERNAL,
  'portal-lookup': INTERNAL,
  incoming: INTERNAL,
  outgoing: INTERNAL,
  'internal-docs': INTERNAL,
  'data-store': [L, C, A],
  legal: [A],
  admin: [A],
  users: [A],
  roles: [A],
  catalog: [A],
  ai: [A],
  ops: [A],
  config: [A],
};

const adminTab = (id: string, labelKey: string, icon: string, tab: string): WsNavItem => ({
  id,
  labelKey,
  icon,
  route: '/admin',
  query: { tab },
  queryDefaults: { tab: 'org' },
});

export const WS_HOME: WsNavItem = { id: 'overview', labelKey: 'workspace.navOverview', icon: 'apps', route: '/workspace', excludeQuery: ['filter'] };

export const WS_NAV_GROUPS: WsNavGroup[] = [
  {
    id: 'dossiers',
    titleKey: 'wsNav.group.dossiers',
    icon: 'folder-open',
    items: [
      soonItem('my-dossiers'),
      soonItem('internal-dossiers'),
      soonItem('coop-dossiers'),
      { id: 'queue-all', labelKey: 'wsNav.queue', icon: 'folder', route: '/workspace', query: { filter: 'all' }, badge: 'all', activePrefixes: ['/workspace/ho-so'] },
      { id: 'queue-new', labelKey: 'wsNav.queueNew', icon: 'inbox-in', route: '/workspace', query: { filter: 'new' }, badge: 'new' },
      { id: 'queue-processing', labelKey: 'wsNav.queueProcessing', icon: 'hourglass-end', route: '/workspace', query: { filter: 'processing' }, badge: 'processing' },
      { id: 'queue-approval', labelKey: 'wsNav.queueApproval', icon: 'shield-check', route: '/workspace', query: { filter: 'waiting-approval' }, badge: 'waiting-approval' },
    ],
  },
  {
    id: 'work',
    titleKey: 'wsNav.group.work',
    icon: 'search-alt',
    items: [
      { id: 'search', labelKey: 'wsNav.search', icon: 'search-alt', route: '/workspace/tra-cuu' },
      soonItem('calendar'),
      soonItem('reports-soon'),
      adminTab('reports', 'wsNav.reports', 'chart-histogram', 'reports'),
      { id: 'portal', labelKey: 'wsNav.portal', icon: 'globe', route: '/portal' },
      { id: 'portal-lookup', labelKey: 'wsNav.portalLookup', icon: 'book-alt', route: '/portal/tra-cuu' },
    ],
  },
  {
    id: 'docs',
    titleKey: 'wsNav.group.docs',
    icon: 'document-signed',
    items: [
      soonItem('incoming'),
      soonItem('outgoing'),
      soonItem('internal-docs'),
      soonItem('data-store'),
      adminTab('legal', 'wsNav.legal', 'document-signed', 'legal'),
    ],
  },
  {
    id: 'system',
    titleKey: 'wsNav.group.system',
    icon: 'settings',
    items: [
      adminTab('admin', 'wsNav.admin', 'sitemap', 'org'),
      adminTab('users', 'wsNav.users', 'users-alt', 'users'),
      adminTab('roles', 'wsNav.roles', 'lock', 'roles'),
      adminTab('catalog', 'wsNav.catalog', 'list-check', 'catalog'),
      adminTab('config', 'wsNav.config', 'settings-sliders', 'workflow'),
      adminTab('ai', 'wsNav.ai', 'sparkles', 'ai'),
      adminTab('ops', 'wsNav.ops', 'gears', 'ops'),
    ],
  },
];

export const WS_SUPPORT_PHONE = '024.2220.2828';

const allowed = (roles: UserRole[] | undefined, role: UserRole | null) => !!role && (roles ?? INTERNAL).includes(role);

/** Nhóm + mục hiển thị theo vai trò qua WS_ROLE_MATRIX (nhóm rỗng bị ẩn). */
export function visibleGroups(role: UserRole | null, groups: WsNavGroup[] = WS_NAV_GROUPS, matrix = WS_ROLE_MATRIX): WsNavGroup[] {
  return groups
    .map((g) => ({ ...g, items: g.items.filter((i) => allowed(matrix[i.id], role)) }))
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
