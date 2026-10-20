/**
 * Một mục breadcrumb dùng chung (portal / workspace / admin).
 * Trang cha truyền `items`; component tự khớp URL router để đánh dấu trang hiện tại
 * (kể cả sau F5), trừ khi mục có `current: true`.
 */
export interface MofBreadcrumbItem {
  /** Nhãn đã dịch — ưu tiên nếu có. */
  label?: string;
  /** Key i18n — dùng khi không truyền `label`. */
  labelKey?: string;
  /** Đường dẫn router (string hoặc commands). Không có = không click được. */
  link?: string | readonly (string | number)[];
  /** Query kèm link (vd. `{ filter: 'new' }`). */
  queryParams?: Record<string, string | number | boolean | null | undefined>;
  /**
   * Ép là trang hiện tại. Nếu không set, component tự khớp `link` (+ query nếu có)
   * với URL router sau NavigationEnd / lần load đầu.
   */
  current?: boolean;
}

/** Mục đã chuẩn hoá để render (luôn có nhãn không rỗng). */
export interface MofBreadcrumbViewItem {
  label: string;
  labelKey?: string;
  link?: string | readonly (string | number)[];
  queryParams?: Record<string, string | number | boolean | null | undefined>;
  current: boolean;
  clickable: boolean;
}

/** Bỏ query/hash, chuẩn hoá slash — dùng khớp URL sau refresh. */
export function normalizeBreadcrumbPath(url: string): string {
  const raw = (url ?? '').trim();
  if (!raw) return '/';
  const pathOnly = raw.split(/[?#]/)[0] || '/';
  const withSlash = pathOnly.startsWith('/') ? pathOnly : `/${pathOnly}`;
  if (withSlash.length > 1 && withSlash.endsWith('/')) {
    return withSlash.replace(/\/+$/, '') || '/';
  }
  return withSlash || '/';
}

/** Chuyển `link` (string | commands) thành path so khớp. */
export function breadcrumbLinkPath(link: string | readonly (string | number)[]): string {
  if (typeof link === 'string') {
    return normalizeBreadcrumbPath(link);
  }
  const parts = link
    .filter((p) => p !== null && p !== undefined && `${p}` !== '')
    .map((p) => `${p}`.replace(/^\/+|\/+$/g, ''))
    .filter(Boolean);
  return normalizeBreadcrumbPath('/' + parts.join('/'));
}

/** Parse query từ URL router thành map string. */
export function parseBreadcrumbQuery(url: string): Record<string, string> {
  const q = (url ?? '').split('?')[1]?.split('#')[0] ?? '';
  if (!q) return {};
  const out: Record<string, string> = {};
  for (const part of q.split('&')) {
    if (!part) continue;
    const [k, ...rest] = part.split('=');
    if (!k) continue;
    out[decodeURIComponent(k)] = decodeURIComponent(rest.join('=') || '');
  }
  return out;
}

function queryMatches(
  itemQuery: Record<string, string | number | boolean | null | undefined> | undefined,
  urlQuery: Record<string, string>,
): boolean {
  if (!itemQuery || !Object.keys(itemQuery).length) return true;
  return Object.entries(itemQuery).every(([k, v]) => {
    if (v === null || v === undefined) {
      return !(k in urlQuery) || urlQuery[k] === '';
    }
    return urlQuery[k] === String(v);
  });
}

/**
 * Chỉ số mục được coi là trang hiện tại.
 * Ưu tiên `current: true` (mục cuối cùng có flag); không có thì khớp link với URL
 * (mục khớp sâu nhất); vẫn không có thì lấy mục cuối.
 * Trả `-1` nếu danh sách rỗng.
 */
export function resolveBreadcrumbCurrentIndex(
  items: readonly MofBreadcrumbItem[],
  routerUrl: string,
): number {
  if (!items.length) return -1;

  let forced = -1;
  for (let i = 0; i < items.length; i++) {
    if (items[i].current === true) forced = i;
  }
  if (forced >= 0) return forced;

  const path = normalizeBreadcrumbPath(routerUrl);
  const urlQuery = parseBreadcrumbQuery(routerUrl);
  let matched = -1;
  for (let i = 0; i < items.length; i++) {
    const link = items[i].link;
    if (link === undefined || link === null || link === '') continue;
    if (breadcrumbLinkPath(link) === path && queryMatches(items[i].queryParams, urlQuery)) {
      matched = i;
    }
  }
  if (matched >= 0) return matched;
  return items.length - 1;
}

/** Lọc mục không có nhãn; gắn `current` / `clickable`. */
export function buildBreadcrumbView(
  items: readonly MofBreadcrumbItem[],
  routerUrl: string,
  translate: (key: string) => string,
): MofBreadcrumbViewItem[] {
  const sanitized = items
    .map((it) => {
      const label = (it.label ?? '').trim() || (it.labelKey ? translate(it.labelKey).trim() : '');
      return { ...it, label };
    })
    .filter((it) => !!it.label);

  const currentIdx = resolveBreadcrumbCurrentIndex(sanitized, routerUrl);
  return sanitized.map((it, i) => {
    const hasLink = it.link !== undefined && it.link !== null && `${it.link}` !== '';
    const current = i === currentIdx;
    return {
      label: it.label!,
      labelKey: it.labelKey,
      link: hasLink ? it.link : undefined,
      queryParams: it.queryParams,
      current,
      clickable: hasLink && !current,
    };
  });
}
