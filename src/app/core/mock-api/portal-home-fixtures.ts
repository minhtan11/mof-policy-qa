/**
 * Seed nội dung trang chủ cổng công khai (PUB-home).
 * Dữ liệu mẫu, không phải số liệu ngân sách chính thức. Ảnh tin tức: Unsplash (giấy phép Unsplash, miễn phí).
 */
export interface LocalizedText {
  vi: string;
  en: string;
}

export interface PortalServiceCard {
  id: string;
  icon: string;
  titleKey: string;
  bodyKey: string;
  route: string;
  fragment?: string;
}

export interface PortalNewsItem {
  id: string;
  title: LocalizedText;
  summary: LocalizedText;
  publishedAt: string;
  image: string;
  featured?: boolean;
}

export interface PortalNotice {
  id: string;
  title: LocalizedText;
  publishedAt: string;
}

export type BudgetCategory = 'revenue' | 'expenditure' | 'balance';

export interface BudgetKpi {
  id: string;
  category: BudgetCategory;
  icon: string;
  tone: 'blue' | 'teal' | 'amber' | 'violet';
  labelKey: string;
  unitKey: string;
  value: number;
  /** % so với cùng kỳ; null nếu hiển thị chỉ số phụ (vd. % GDP). */
  delta: number | null;
  noteKey?: string;
  noteValue?: number;
}

export interface BudgetYear {
  year: number;
  kpis: BudgetKpi[];
  /** Quý I..IV, nghìn tỷ đồng. */
  quarterly: { revenue: number[]; expenditure: number[] };
}

export interface PortalQuickLink {
  id: string;
  icon: string;
  labelKey: string;
  route: string;
  fragment?: string;
}

const img = (id: string, w = 800): string => `https://images.unsplash.com/${id}?auto=format&fit=crop&w=${w}&q=70`;

export interface PortalHeroSlide {
  id: string;
  image: string;
  position: string;
  titleKey: string;
  subtitleKey: string;
}

/**
 * Ảnh hero (lưu cục bộ public/assets/hero/, nguồn & giấy phép xem docs/credits-anh.md):
 * - mof-hq.jpg: ảnh trụ sở Bộ Tài chính có sẵn trong dự án (public/assets/portal-hero-bg.png).
 * - national-assembly.jpg: Christophe95, Wikimedia Commons, CC BY-SA 4.0.
 * - presidential-palace.jpg: Gary Todd, Wikimedia Commons, CC0.
 */
export const PORTAL_HERO_SLIDES: PortalHeroSlide[] = [
  { id: 's1', image: 'assets/hero/mof-hq.jpg', position: '75% 40%', titleKey: 'portal.hero.title', subtitleKey: 'portal.hero.subtitle' },
  { id: 's2', image: 'assets/hero/national-assembly.jpg', position: '60% 30%', titleKey: 'portal.hero.title2', subtitleKey: 'portal.hero.subtitle2' },
  { id: 's3', image: 'assets/hero/presidential-palace.jpg', position: '50% 55%', titleKey: 'portal.hero.title3', subtitleKey: 'portal.hero.subtitle3' },
];

export const PORTAL_SERVICE_CARDS: PortalServiceCard[] = [
  { id: 'ask', icon: 'computer', titleKey: 'portal.card.askTitle', bodyKey: 'portal.card.askBody', route: '/portal/hoi-dap' },
  { id: 'lookup', icon: 'document', titleKey: 'portal.card.lookupTitle', bodyKey: 'portal.card.lookupBody', route: '/portal/tra-cuu' },
  { id: 'budget', icon: 'chart-histogram', titleKey: 'portal.card.budgetTitle', bodyKey: 'portal.card.budgetBody', route: '/portal', fragment: 'ngan-sach' },
  { id: 'mine', icon: 'comments', titleKey: 'portal.card.mineTitle', bodyKey: 'portal.card.mineBody', route: '/portal/cau-hoi-cua-toi' },
];

export const PORTAL_NEWS: PortalNewsItem[] = [
  {
    id: 'n-001',
    featured: true,
    publishedAt: '2026-01-20',
    image: img('photo-1540575467063-178a50c2df87', 1200),
    title: {
      vi: 'Bộ Tài chính triển khai nhiệm vụ tài chính – ngân sách năm 2026, thúc đẩy tăng trưởng kinh tế bền vững',
      en: 'Ministry of Finance rolls out 2026 finance and budget tasks to drive sustainable growth',
    },
    summary: {
      vi: 'Hội nghị triển khai nhiệm vụ tài chính – ngân sách nhà nước năm 2026 đặt mục tiêu tăng cường kỷ luật tài khóa, đẩy mạnh chuyển đổi số và phục vụ người dân, doanh nghiệp.',
      en: 'The 2026 state budget conference targets stronger fiscal discipline, faster digital transformation and better service for citizens and businesses.',
    },
  },
  {
    id: 'n-002',
    publishedAt: '2026-01-18',
    image: img('photo-1460925895917-afdab827c52f'),
    title: { vi: 'Bộ Tài chính công bố báo cáo thực hiện ngân sách nhà nước năm 2025', en: 'Ministry publishes the 2025 state budget execution report' },
    summary: { vi: 'Báo cáo công khai số liệu thu, chi ngân sách theo quý.', en: 'Quarterly revenue and expenditure figures made public.' },
  },
  {
    id: 'n-003',
    publishedAt: '2026-01-16',
    image: img('photo-1494412574643-ff11b0a5c1c3'),
    title: { vi: 'Tăng cường quản lý thu ngân sách, tạo nguồn lực cho phát triển bền vững', en: 'Strengthening revenue management to fund sustainable development' },
    summary: { vi: 'Tập trung chống thất thu, mở rộng cơ sở thuế.', en: 'Focus on preventing revenue loss and broadening the tax base.' },
  },
  {
    id: 'n-004',
    publishedAt: '2026-01-15',
    image: img('photo-1521737604893-d14cc237f11d'),
    title: { vi: 'Hội nghị hợp tác tài chính Việt Nam – các đối tác quốc tế năm 2026', en: 'Vietnam – international partners finance cooperation conference 2026' },
    summary: { vi: 'Trao đổi kinh nghiệm quản lý tài chính công.', en: 'Sharing public financial management experience.' },
  },
];

export const PORTAL_NOTICES: PortalNotice[] = [
  { id: 'tb-001', publishedAt: '2026-01-17', title: { vi: 'Về việc công bố công khai dự toán ngân sách nhà nước năm 2026', en: 'Publication of the 2026 state budget estimate' } },
  { id: 'tb-002', publishedAt: '2026-01-14', title: { vi: 'Thông báo lịch tiếp công dân định kỳ tháng 01/2026', en: 'Citizen reception schedule for January 2026' } },
  { id: 'tb-003', publishedAt: '2026-01-12', title: { vi: 'Lấy ý kiến dự thảo Thông tư hướng dẫn quản lý, sử dụng tài sản công', en: 'Consultation on the draft circular on public asset management' } },
  { id: 'tb-004', publishedAt: '2026-01-10', title: { vi: 'Công bố danh mục thủ tục hành chính được sửa đổi, bổ sung', en: 'Updated list of amended administrative procedures' } },
  { id: 'tb-005', publishedAt: '2026-01-09', title: { vi: 'Thông báo về việc nâng cấp hệ thống hỏi đáp chính sách trực tuyến', en: 'Notice on the upgrade of the online policy Q&A system' } },
];

const kpis = (rev: number, revD: number, exp: number, expD: number, def: number, gdp: number, disb: number, disbD: number): BudgetKpi[] => [
  { id: 'revenue', category: 'revenue', icon: 'wallet', tone: 'teal', labelKey: 'portal.budget.kpiRevenue', unitKey: 'portal.budget.unitTrillion', value: rev, delta: revD },
  { id: 'expenditure', category: 'expenditure', icon: 'coins', tone: 'blue', labelKey: 'portal.budget.kpiExpenditure', unitKey: 'portal.budget.unitTrillion', value: exp, delta: expD },
  { id: 'deficit', category: 'balance', icon: 'chart-pie', tone: 'amber', labelKey: 'portal.budget.kpiDeficit', unitKey: 'portal.budget.unitTrillion', value: def, delta: null, noteKey: 'portal.budget.gdpShare', noteValue: gdp },
  { id: 'disbursement', category: 'expenditure', icon: 'percentage', tone: 'violet', labelKey: 'portal.budget.kpiDisbursement', unitKey: 'portal.budget.unitPlan', value: disb, delta: disbD },
];

export const PORTAL_BUDGET_YEARS: BudgetYear[] = [
  { year: 2025, kpis: kpis(2025.4, 8.6, 1830.8, 7.2, 194.6, 3.4, 78.1, 12.4), quarterly: { revenue: [412, 518, 546, 549], expenditure: [368, 480, 498, 485] } },
  { year: 2024, kpis: kpis(1865.1, 6.1, 1708.3, 5.4, 156.8, 3.1, 69.5, 4.8), quarterly: { revenue: [389, 462, 497, 517], expenditure: [341, 436, 462, 469] } },
];

export const PORTAL_QUICK_LINKS: PortalQuickLink[] = [
  { id: 'lookup', icon: 'search', labelKey: 'portal.quick.lookup', route: '/portal/tra-cuu' },
  { id: 'ask', icon: 'paper-plane', labelKey: 'portal.quick.ask', route: '/portal/hoi-dap' },
  { id: 'mine', icon: 'list', labelKey: 'portal.quick.mine', route: '/portal/cau-hoi-cua-toi' },
  { id: 'vneid', icon: 'id-badge', labelKey: 'portal.quick.vneid', route: '/portal/login/vneid' },
  { id: 'login', icon: 'user', labelKey: 'portal.quick.login', route: '/portal/login' },
  { id: 'budget', icon: 'chart-histogram', labelKey: 'portal.quick.budget', route: '/portal', fragment: 'ngan-sach' },
  { id: 'contact', icon: 'phone-call', labelKey: 'portal.quick.contact', route: '/portal', fragment: 'lien-he' },
];
