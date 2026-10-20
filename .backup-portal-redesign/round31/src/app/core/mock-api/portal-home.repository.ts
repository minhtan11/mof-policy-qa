import { Injectable } from '@angular/core';
import {
  BudgetCategory,
  BudgetKpi,
  BudgetYear,
  PORTAL_BUDGET_YEARS,
  PORTAL_HERO_SLIDES,
  PORTAL_NEWS,
  PORTAL_NOTICES,
  PORTAL_QUICK_LINKS,
  PORTAL_SERVICE_CARDS,
  PortalNewsItem,
  PortalNotice,
} from './portal-home-fixtures';

export type BudgetTab = 'overview' | BudgetCategory;

/** UC-162..UC-165 — nội dung trang chủ cổng công khai; adapter sau này thay bằng API CMS/báo cáo ngân sách. */
@Injectable({ providedIn: 'root' })
export class PortalHomeRepository {
  readonly heroSlides = PORTAL_HERO_SLIDES;
  readonly serviceCards = PORTAL_SERVICE_CARDS;
  readonly quickLinks = PORTAL_QUICK_LINKS;
  readonly budgetTabs: BudgetTab[] = ['overview', 'revenue', 'expenditure', 'balance'];

  /** Tin mới nhất trước; tin nổi bật tách riêng để hiển thị khối lớn. */
  news(): { featured: PortalNewsItem | null; others: PortalNewsItem[] } {
    const sorted = [...PORTAL_NEWS].sort((a, b) => b.publishedAt.localeCompare(a.publishedAt));
    const featured = sorted.find((item) => item.featured) ?? sorted[0] ?? null;
    return { featured, others: sorted.filter((item) => item !== featured).slice(0, 3) };
  }

  notices(limit = 5): PortalNotice[] {
    return [...PORTAL_NOTICES].sort((a, b) => b.publishedAt.localeCompare(a.publishedAt)).slice(0, limit);
  }

  budgetYears(): number[] {
    return PORTAL_BUDGET_YEARS.map((item) => item.year).sort((a, b) => b - a);
  }

  budget(year: number): BudgetYear | null {
    return PORTAL_BUDGET_YEARS.find((item) => item.year === year) ?? null;
  }

  kpis(year: number, tab: BudgetTab): BudgetKpi[] {
    const all = this.budget(year)?.kpis ?? [];
    return tab === 'overview' ? all : all.filter((item) => item.category === tab);
  }
}
