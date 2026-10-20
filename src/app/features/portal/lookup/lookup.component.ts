import { ChangeDetectionStrategy, Component, DestroyRef, ElementRef, computed, effect, inject, signal, untracked, viewChild } from '@angular/core';
import { ActivatedRoute, ParamMap, Router } from '@angular/router';
import { toSignal } from '@angular/core/rxjs-interop';
import { DatePipe, DecimalPipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TranslatePipe } from '../../../core/i18n/translate.pipe';
import { I18nService } from '../../../core/i18n/i18n.service';
import { PublicQaRepository, QaPeriod, QaSort } from '../../../core/mock-api/public-qa.repository';
import { QA_STATUSES, QA_TYPES, QaStatus, QaType } from '../../../core/mock-api/public-qa-fixtures';
import { PortalHeaderComponent } from '../../../shared/ui/portal-header/portal-header.component';
import { PortalFooterComponent } from '../../../shared/ui/portal-footer/portal-footer.component';
import { PageBackdropComponent } from '../../../shared/ui/page-backdrop/page-backdrop.component';
import { MofButtonComponent } from '../../../shared/ui/mof-button/mof-button.component';
import { MofSelectComponent } from '../../../shared/ui/mof-select/mof-select.component';
import { MofCheckboxComponent } from '../../../shared/ui/mof-checkbox/mof-checkbox.component';
import { MofFiIconComponent } from '../../../shared/ui/mof-fi-icon/mof-fi-icon.component';
import { MofIconButtonComponent } from '../../../shared/ui/mof-icon-button/mof-icon-button.component';
import { MofPaginationComponent } from '../../../shared/ui/mof-pagination/mof-pagination.component';

export type LookupView = 'list' | 'grid';

export interface LookupState {
  q: string;
  topic: string | null;
  types: QaType[];
  statuses: QaStatus[];
  period: QaPeriod;
  sort: QaSort;
  view: LookupView;
  page: number;
  size: number;
}

export const LOOKUP_PAGE_SIZES = [6, 12, 24];
export const LOOKUP_PAGE_SIZE = 6;
const PERIODS: QaPeriod[] = ['all', '7d', '30d', '90d', '365d'];
const SORTS: QaSort[] = ['newest', 'oldest', 'views', 'replies'];

/** Đọc trạng thái tra cứu từ query params (nguồn sự thật duy nhất — URL chia sẻ/back được). */
export function parseLookup(p: ParamMap): LookupState {
  const list = <T extends string>(key: string, allowed: readonly T[]) =>
    (p.get(key) ?? '').split(',').filter((x): x is T => (allowed as readonly string[]).includes(x));
  const one = <T extends string>(key: string, allowed: readonly T[], def: T) => {
    const v = p.get(key) as T | null;
    return v && allowed.includes(v) ? v : def;
  };
  return {
    q: p.get('q') ?? '',
    topic: p.get('topic'),
    types: list('type', QA_TYPES),
    statuses: list('status', QA_STATUSES),
    period: one('period', PERIODS, 'all'),
    sort: one('sort', SORTS, 'newest'),
    view: one<LookupView>('view', ['list', 'grid'], 'list'),
    page: Math.max(1, Number(p.get('page')) || 1),
    size: LOOKUP_PAGE_SIZES.includes(Number(p.get('size'))) ? Number(p.get('size')) : LOOKUP_PAGE_SIZE,
  };
}

/** Ghi trạng thái ra query params, bỏ giá trị mặc định cho URL gọn. */
export function toParams(s: LookupState): Record<string, string | null> {
  return {
    q: s.q.trim() || null,
    topic: s.topic || null,
    type: s.types.length ? s.types.join(',') : null,
    status: s.statuses.length ? s.statuses.join(',') : null,
    period: s.period === 'all' ? null : s.period,
    sort: s.sort === 'newest' ? null : s.sort,
    view: s.view === 'list' ? null : s.view,
    page: s.page > 1 ? String(s.page) : null,
    size: s.size === LOOKUP_PAGE_SIZE ? null : String(s.size),
  };
}

/**
 * Screen PUB-lookup | Người dân/doanh nghiệp | Tra cứu kho hỏi đáp công khai: tìm kiếm, bộ lọc (lĩnh vực, loại,
 * trạng thái, thời gian), sắp xếp, dạng danh sách/lưới, xem thêm. Mọi trạng thái đồng bộ query params.
 * Dữ liệu: PublicQaRepository (fixture). UC-162..UC-165 | Permission: public.
 */
@Component({
  imports: [
    DatePipe,
    DecimalPipe,
    FormsModule,
    TranslatePipe,
    PortalHeaderComponent,
    PortalFooterComponent,
    PageBackdropComponent,
    MofButtonComponent,
    MofSelectComponent,
    MofCheckboxComponent,
    MofFiIconComponent,
    MofIconButtonComponent,
    MofPaginationComponent,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './lookup.component.html',
  styleUrl: './lookup.component.scss',
  host: { '(document:keydown.escape)': 'closeSheet()' },
})
export class LookupComponent {
  readonly repo = inject(PublicQaRepository);
  private readonly i18n = inject(I18nService);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);

  private readonly params = toSignal(this.route.queryParamMap, { initialValue: this.route.snapshot.queryParamMap });
  readonly state = computed(() => parseLookup(this.params()));
  readonly results = computed(() => this.repo.search(this.state()));
  readonly pages = computed(() => Math.max(1, Math.ceil(this.results().length / this.state().size)));
  /** Trang hiện tại đã kẹp trong [1, pages] (URL có thể cũ/sai). */
  readonly page = computed(() => Math.min(this.state().page, this.pages()));
  readonly visible = computed(() => {
    const { size } = this.state();
    return this.results().slice((this.page() - 1) * size, this.page() * size);
  });
  readonly pageSizes = LOOKUP_PAGE_SIZES;

  readonly types = QA_TYPES;
  readonly typeCounts = this.repo.typeCounts();
  readonly statusList: QaStatus[] = ['processing', 'answered', 'pending-approval'];
  readonly popular = this.repo.popularTopics(5);
  readonly featured = this.repo.featured(3);

  // Nháp bộ lọc (chỉ áp dụng khi bấm "Áp dụng bộ lọc")
  readonly keyword = signal('');
  readonly draftTopic = signal<string | null>(null);
  readonly draftTypes = signal<QaType[]>([]);
  readonly draftStatuses = signal<QaStatus[]>([]);
  readonly draftPeriod = signal<QaPeriod>('all');
  readonly draftSort = signal<QaSort>('newest');

  /** Giữ chiều cao danh sách trong lúc đổi trang để không co giật. */
  readonly holdHeight = signal<number | null>(null);
  private readonly listEl = viewChild<ElementRef<HTMLElement>>('list');
  private readonly toolbarEl = viewChild<ElementRef<HTMLElement>>('toolbar');
  readonly sheetOpen = signal(false);
  readonly expanded = signal<Set<string>>(new Set());

  readonly topicOptions = computed(() => {
    this.i18n.locale();
    return [{ label: this.i18n.t('lookup.allTopics'), value: '' }, ...this.repo.topics.map((t) => ({ label: t.name, value: t.id }))];
  });
  readonly periodOptions = computed(() => {
    this.i18n.locale();
    return PERIODS.map((p) => ({ label: this.i18n.t('lookup.period.' + p), value: p }));
  });
  readonly sortOptions = computed(() => {
    this.i18n.locale();
    return SORTS.map((s) => ({ label: this.i18n.t('lookup.sort.' + s), value: s }));
  });

  constructor() {
    // Đồng bộ nháp CHỈ khi phần lọc/từ khoá đổi (computed chuỗi → đổi trang/kiểu xem không ghi đè nháp đang sửa).
    const filterKey = computed(() => {
      const s = this.state();
      return JSON.stringify([s.q, s.topic, s.types, s.statuses, s.period, s.sort]);
    });
    effect(() => {
      filterKey();
      const s = untracked(() => this.state());
      untracked(() => {
        this.keyword.set(s.q);
        this.draftTopic.set(s.topic);
        this.draftTypes.set(s.types);
        this.draftStatuses.set(s.statuses);
        this.draftPeriod.set(s.period);
        this.draftSort.set(s.sort);
      });
    });
    inject(DestroyRef).onDestroy(() => {
      document.documentElement.classList.remove('mof-scroll-lock');
    });
  }

  /**
   * Ghi trạng thái ra URL (replaceUrl, không cuộn — xem App). Không skeleton: dữ liệu client trả ngay.
   * `fade`: crossfade bằng View Transitions khi trình duyệt hỗ trợ và không reduced-motion.
   */
  private go(patch: Partial<LookupState>, fade = false): Promise<boolean> {
    const nav = () =>
      this.router.navigate([], {
      relativeTo: this.route,
        queryParams: toParams({ ...this.state(), ...patch }),
        replaceUrl: true,
      });
    const doc = document as Document & { startViewTransition?: (cb: () => Promise<unknown>) => { finished: Promise<void> } };
    const reduce = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
    if (fade && doc.startViewTransition && !reduce) {
      return new Promise<boolean>((resolve) =>
        doc.startViewTransition!(() => {
          const p = nav();
          void p.then(resolve);
          return p;
        }),
      );
    }
    return nav();
  }

  search(e?: Event): void {
    e?.preventDefault();
    this.go({ q: this.keyword(), page: 1 });
  }

  applyFilters(): void {
    this.go({
      topic: this.draftTopic() || null,
      types: this.draftTypes(),
      statuses: this.draftStatuses(),
      period: this.draftPeriod(),
      sort: this.draftSort(),
      page: 1,
    });
    this.closeSheet();
  }

  reset(): void {
    this.go({ topic: null, types: [], statuses: [], period: 'all', sort: 'newest', page: 1 });
  }

  setSort(sort: QaSort): void {
    this.go({ sort, page: 1 });
  }

  /** Chỉ đổi class trên container (cùng DOM, track theo id) + crossfade — không tạo lại thẻ. */
  setView(view: LookupView): void {
    if (view !== this.state().view) {
      void this.go({ view }, true);
    }
  }

  /** Đổi trang: giữ chiều cao, crossfade, cuộn mượt tới thanh công cụ CHỈ khi nó ngoài tầm nhìn. */
  goPage(page: number): void {
    const list = this.listEl()?.nativeElement;
    this.holdHeight.set(list?.offsetHeight ?? null);
    void this.go({ page }, true).then(() => {
      requestAnimationFrame(() => this.holdHeight.set(null));
      const bar = this.toolbarEl()?.nativeElement;
      if (bar && typeof bar.getBoundingClientRect === 'function') {
        const top = bar.getBoundingClientRect().top;
        const headerH = parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--mof-header-h')) * 16 || 68;
        if (top < headerH || top > window.innerHeight) {
          bar.scrollIntoView?.({ behavior: window.matchMedia?.('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth', block: 'start' });
        }
      }
    });
  }

  setSize(size: number): void {
    void this.go({ size, page: 1 }, true);
  }

  pickTopic(id: string): void {
    this.go({ topic: id, page: 1 });
  }

  toggleType(t: QaType, on: boolean): void {
    this.draftTypes.update((l) => (on ? [...new Set([...l, t])] : l.filter((x) => x !== t)));
  }

  toggleStatus(s: QaStatus | 'all', on: boolean): void {
    if (s === 'all') {
      if (on) {
        this.draftStatuses.set([]);
      }
      return;
    }
    this.draftStatuses.update((l) => (on ? [...new Set([...l, s])] : l.filter((x) => x !== s)));
  }

  toggleExpand(id: string): void {
    this.expanded.update((set) => {
      const next = new Set(set);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  }

  openSheet(): void {
    this.sheetOpen.set(true);
    document.documentElement.classList.add('mof-scroll-lock');
  }

  closeSheet(): void {
    if (this.sheetOpen()) {
      this.sheetOpen.set(false);
      document.documentElement.classList.remove('mof-scroll-lock');
    }
  }

  activeFilterCount(): number {
    const s = this.state();
    return (s.topic ? 1 : 0) + s.types.length + s.statuses.length + (s.period !== 'all' ? 1 : 0);
  }

  statusIcon(s: QaStatus): string {
    return s === 'answered' ? 'check' : s === 'processing' ? 'time-past' : 'hourglass-end';
  }

  goAsk(): void {
    void this.router.navigateByUrl('/portal/hoi-dap');
  }
}
