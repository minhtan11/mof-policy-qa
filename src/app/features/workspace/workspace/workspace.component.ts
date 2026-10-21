/**
 * Screen W-01 / DASH-01 “Tổng quan công việc” | Tiếp nhận, chuyên viên, lãnh đạo, điều phối, quản trị
 * OPS-01 / DASH-01 / EXP-01: 5 KPI (tiếp nhận, chờ xử lý, đúng hạn, sắp hạn, quá hạn) trên phạm vi vai trò;
 * lọc chung thời gian, đơn vị, lĩnh vực; bấm KPI ra đúng số hồ sơ. Sidebar dùng cùng phạm vi và cùng nhóm tab.
 * URL: ?filter= (tab, khớp sidebar) &kpi= &q= &priority= &topic= &unit= &page= &size= &month=
 * UC liên quan: UC-142..UC-149, UC-188..UC-191 | Permission: cán bộ nội bộ (internalGuard)
 */
import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  ElementRef,
  Injector,
  afterNextRender,
  computed,
  effect,
  inject,
  signal,
  untracked,
  viewChild,
} from '@angular/core';
import { ActivatedRoute, Params, Router, RouterLink } from '@angular/router';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApexOptions } from 'apexcharts';
import { WorkspaceShellComponent } from '../../../shared/ui/workspace-shell/workspace-shell.component';
import { StatusBadgeComponent } from '../../../shared/ui/status-badge/status-badge.component';
import { TranslatePipe } from '../../../core/i18n/translate.pipe';
import { I18nService } from '../../../core/i18n/i18n.service';
import { ThemeService } from '../../../core/theme/theme.service';
import { MofButtonComponent } from '../../../shared/ui/mof-button/mof-button.component';
import { MofChartComponent } from '../../../shared/ui/mof-chart/mof-chart.component';
import { MofFiIconComponent } from '../../../shared/ui/mof-fi-icon/mof-fi-icon.component';
import { MofPaginationComponent } from '../../../shared/ui/mof-pagination/mof-pagination.component';
import { MofDataTableComponent } from '../../../shared/ui/mof-data-table/mof-data-table.component';
import { MofSelectComponent, MofSelectOption } from '../../../shared/ui/mof-select/mof-select.component';
import { anchorFloating, AnchoredHandle } from '../../../core/overlay/floating';
import { WorkspaceOverviewRepository, WsQuery, isOverdue } from '../../../core/mock-api/workspace-overview.repository';
import {
  WS_KPI_IDS,
  WS_TABS,
  WS_TOPIC_VISUALS,
  WS_UNASSIGNED_UNIT,
  WsKpiId,
  WsSlice,
  WsTab,
} from '../../../core/mock-api/workspace-overview-fixtures';
import { Dossier } from '../../../core/models/domain.models';
import { MofTooltipDirective } from '../../../shared/ui/mof-tooltip/mof-tooltip.directive';

export const WS_PAGE_SIZES = [10, 20, 50];
const PRIORITIES: Dossier['priority'][] = ['normal', 'high', 'urgent'];
const TAB_IDS = WS_TABS.map((t) => t.id);
const COUNT_UP_MS = 700;

const reducedMotion = () =>
  typeof window.matchMedia !== 'function' || window.matchMedia('(prefers-reduced-motion: reduce)').matches;

@Component({
  imports: [MofTooltipDirective, 
    WorkspaceShellComponent,
    RouterLink,
    DatePipe,
    FormsModule,
    StatusBadgeComponent,
    TranslatePipe,
    MofButtonComponent,
    MofChartComponent,
    MofFiIconComponent,
    MofPaginationComponent,
    MofDataTableComponent,
    MofSelectComponent,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './workspace.component.html',
  styleUrl: './workspace.component.scss',
  host: { '(document:pointerdown)': 'onDocPointer($event)' },
})
export class WorkspaceComponent {
  readonly repo = inject(WorkspaceOverviewRepository);
  readonly i18n = inject(I18nService);
  private readonly theme = inject(ThemeService);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly destroyRef = inject(DestroyRef);
  private readonly injector = inject(Injector);

  readonly tabs = WS_TABS;
  readonly pageSizes = WS_PAGE_SIZES;
  readonly now = signal(Date.now());

  // ---------- Trạng thái đồng bộ URL ----------
  readonly tab = signal<WsTab>('all');
  readonly q = signal('');
  readonly priority = signal<WsQuery['priority']>('');
  readonly topic = signal('');
  readonly unit = signal('');
  readonly kpi = signal<WsKpiId | ''>('');
  readonly page = signal(1);
  readonly size = signal(WS_PAGE_SIZES[0]);
  /** yyyy-MM hoặc rỗng = mọi thời gian. Rỗng để lần mở trang khớp số sidebar. */
  readonly month = signal('');
  /** Ô tìm kiếm (gõ ngay, URL cập nhật sau debounce). */
  readonly qInput = signal('');
  private qTimer: ReturnType<typeof setTimeout> | undefined;

  constructor() {
    this.route.queryParamMap.pipe(takeUntilDestroyed()).subscribe((p) => {
      const tab = p.get('filter') as WsTab | null;
      this.tab.set(tab && TAB_IDS.includes(tab) ? tab : 'all');
      const q = p.get('q') ?? '';
      this.q.set(q);
      if (this.qTimer === undefined) this.qInput.set(q);
      const pr = p.get('priority') as Dossier['priority'] | null;
      this.priority.set(pr && PRIORITIES.includes(pr) ? pr : '');
      const tp = p.get('topic') ?? '';
      this.topic.set(this.repo.topics.some((t) => t.id === tp) ? tp : '');
      const unit = p.get('unit') ?? '';
      this.unit.set(unit === WS_UNASSIGNED_UNIT || this.repo.orgs.some((o) => o.id === unit) ? unit : '');
      const kpi = p.get('kpi') as WsKpiId | null;
      this.kpi.set(kpi && WS_KPI_IDS.includes(kpi) ? kpi : '');
      const size = Number(p.get('size'));
      this.size.set(WS_PAGE_SIZES.includes(size) ? size : WS_PAGE_SIZES[0]);
      const page = Number(p.get('page'));
      this.page.set(Number.isInteger(page) && page > 0 ? page : 1);
      const m = p.get('month') ?? '';
      this.month.set(/^\d{4}-\d{2}$/.test(m) ? m : '');
    });
    // Count-up KPI (tắt khi reduced-motion).
    effect(() => {
      const target = this.kpis().map((k) => k.value);
      untracked(() => this.countUp(target));
    });
    this.destroyRef.onDestroy(() => {
      cancelAnimationFrame(this.raf);
      clearTimeout(this.qTimer);
      this.filterHandle?.destroy();
    });
  }

  // ---------- Đầu trang ----------
  readonly todayLabel = computed(() => {
    const loc = this.i18n.locale() === 'en' ? 'en-GB' : 'vi-VN';
    const s = new Intl.DateTimeFormat(loc, { weekday: 'long', day: '2-digit', month: '2-digit', year: 'numeric' }).format(this.now());
    return s.charAt(0).toUpperCase() + s.slice(1);
  });

  // ---------- KPI + bộ lọc chung (thời gian, đơn vị, lĩnh vực) ----------
  readonly slice = computed<WsSlice>(() => ({ month: this.month(), unit: this.unit(), topic: this.topic() }));
  readonly kpis = computed(() => this.repo.kpisFor(this.slice(), this.now()));
  readonly tabCounts = computed(() => this.repo.countsFor(this.slice()));
  readonly kpiShown = signal<number[]>([]);
  private raf = 0;

  private countUp(target: number[]): void {
    cancelAnimationFrame(this.raf);
    const from = this.kpiShown();
    if (reducedMotion() || typeof requestAnimationFrame !== 'function') {
      this.kpiShown.set(target);
      return;
    }
    const t0 = performance.now();
    const step = (t: number) => {
      const k = Math.min(1, (t - t0) / COUNT_UP_MS);
      const e = 1 - Math.pow(1 - k, 3);
      this.kpiShown.set(target.map((v, i) => Math.round((from[i] ?? 0) + (v - (from[i] ?? 0)) * e)));
      if (k < 1) this.raf = requestAnimationFrame(step);
    };
    this.raf = requestAnimationFrame(step);
  }

  // ---------- Hồ sơ cần chú ý ----------
  readonly query = computed<WsQuery>(() => ({
    tab: this.tab(),
    q: this.q(),
    priority: this.priority(),
    topic: this.topic(),
    month: this.month(),
    unit: this.unit(),
    kpi: this.kpi(),
  }));
  readonly rows = computed(() => this.repo.attention(this.query(), this.now()));
  readonly pages = computed(() => Math.max(1, Math.ceil(this.rows().length / this.size())));
  readonly currentPage = computed(() => Math.min(this.page(), this.pages()));
  readonly pageRows = computed(() => {
    const start = (this.currentPage() - 1) * this.size();
    return this.rows().slice(start, start + this.size());
  });
  readonly activeFilters = computed(() => (this.priority() ? 1 : 0));

  readonly priorityOptions = computed<MofSelectOption[]>(() => {
    this.i18n.locale();
    return [{ value: '', label: this.i18n.t('workspace.anyPriority') }, ...PRIORITIES.map((p) => ({ value: p, label: this.i18n.t(`priority.${p}`) }))];
  });
  readonly topicOptions = computed<MofSelectOption[]>(() => {
    this.i18n.locale();
    return [{ value: '', label: this.i18n.t('workspace.anyTopic') }, ...this.repo.topics.map((t) => ({ value: t.id, label: t.name }))];
  });

  overdue(d: Dossier): boolean {
    return isOverdue(d, this.now());
  }

  topicTone(d: Dossier): string {
    return (WS_TOPIC_VISUALS[d.topicId] ?? WS_TOPIC_VISUALS['other']).tone;
  }

  /** Cập nhật URL (replaceUrl, giữ tham số khác). Giá trị mặc định bị bỏ khỏi URL. */
  private patch(params: Params): void {
    void this.router.navigate([], { relativeTo: this.route, queryParams: params, queryParamsHandling: 'merge', replaceUrl: true });
  }

  setTab(t: WsTab): void {
    if (t === this.tab() && !this.kpi()) return;
    this.tab.set(t);
    this.kpi.set('');
    this.page.set(1);
    this.patch({ filter: t === 'all' ? null : t, kpi: null, page: null });
  }

  kpiLens(): string {
    this.i18n.locale();
    const key = this.kpis().find((k) => k.id === this.kpi())?.labelKey ?? '';
    return this.i18n.t('workspace.kpiLens', { name: key ? this.i18n.t(key) : '' });
  }

  /** Bấm thẻ KPI: danh sách đúng số trên thẻ. Bấm lại thì trở về tab trạng thái. */
  openKpi(event: Event, id: WsKpiId): void {
    event.preventDefault();
    const on = this.kpi() === id;
    this.kpi.set(on ? '' : id);
    this.tab.set('all');
    this.q.set('');
    this.qInput.set('');
    this.priority.set('');
    this.page.set(1);
    this.patch({ kpi: on ? null : id, filter: null, q: null, priority: null, page: null });
  }

  onTabKey(e: KeyboardEvent, i: number): void {
    const d = e.key === 'ArrowRight' ? 1 : e.key === 'ArrowLeft' ? -1 : 0;
    if (!d) return;
    e.preventDefault();
    const next = this.tabs[(i + d + this.tabs.length) % this.tabs.length];
    this.setTab(next.id);
    const host = (e.currentTarget as HTMLElement).parentElement;
    (host?.querySelector(`[data-tab="${next.id}"]`) as HTMLElement | null)?.focus();
  }

  onSearch(value: string): void {
    this.qInput.set(value);
    clearTimeout(this.qTimer);
    this.qTimer = setTimeout(() => {
      this.qTimer = undefined;
      this.applySearch();
    }, 250);
  }

  applySearch(): void {
    clearTimeout(this.qTimer);
    this.qTimer = undefined;
    const v = this.qInput().trim();
    if (v === this.q()) return;
    this.q.set(v);
    this.page.set(1);
    this.patch({ q: v || null, page: null });
  }

  clearSearch(): void {
    this.qInput.set('');
    this.applySearch();
  }

  setPriority(v: string): void {
    this.priority.set(v as WsQuery['priority']);
    this.page.set(1);
    this.patch({ priority: v || null, page: null });
  }

  setTopic(v: string): void {
    if (v === this.topic()) return;
    this.topic.set(v);
    this.page.set(1);
    this.patch({ topic: v || null, page: null });
  }

  setUnit(v: string): void {
    if (v === this.unit()) return;
    this.unit.set(v);
    this.page.set(1);
    this.patch({ unit: v || null, page: null });
  }

  resetFilters(): void {
    this.priority.set('');
    this.topic.set('');
    this.unit.set('');
    this.month.set('');
    this.kpi.set('');
    this.page.set(1);
    this.patch({ priority: null, topic: null, unit: null, month: null, kpi: null, page: null });
  }

  setPage(p: number): void {
    this.page.set(p);
    this.patch({ page: p > 1 ? p : null });
  }

  setSize(n: number): void {
    this.size.set(n);
    this.page.set(1);
    this.patch({ size: n === WS_PAGE_SIZES[0] ? null : n, page: null });
  }

  // ---------- Popover bộ lọc (core overlay) ----------
  readonly filterOpen = signal(false);
  private readonly filterBtn = viewChild<ElementRef<HTMLElement>>('filterBtn');
  private readonly filterPop = viewChild<ElementRef<HTMLElement>>('filterPop');
  private filterHandle?: AnchoredHandle;

  toggleFilters(): void {
    if (this.filterOpen()) {
      this.closeFilters();
      return;
    }
    this.filterOpen.set(true);
    afterNextRender(() => {
      const ref = this.filterBtn()?.nativeElement;
      const pop = this.filterPop()?.nativeElement;
      if (!ref || !pop) return;
      this.filterHandle = anchorFloating(ref, pop, { strategy: 'portal', gap: 8, align: 'end', onAncestorScroll: () => this.closeFilters() });
      (pop.querySelector('button, [tabindex]') as HTMLElement | null)?.focus({ preventScroll: true });
    }, { injector: this.injector });
  }

  closeFilters(focus = false): void {
    if (!this.filterOpen()) return;
    this.filterHandle?.destroy();
    this.filterHandle = undefined;
    this.filterOpen.set(false);
    if (focus) this.filterBtn()?.nativeElement.querySelector('button')?.focus({ preventScroll: true });
  }

  onFilterKey(e: KeyboardEvent): void {
    if (e.key === 'Escape') {
      e.stopPropagation();
      this.closeFilters(true);
    }
  }

  onDocPointer(e: PointerEvent): void {
    if (!this.filterOpen()) return;
    const t = e.target as Node;
    if (this.filterPop()?.nativeElement.contains(t) || this.filterBtn()?.nativeElement.contains(t)) return;
    // Bảng chọn của mof-select nằm ngoài popover (portal) → không đóng.
    if ((t as HTMLElement).closest?.('.mof-select-panel, [role="listbox"]')) return;
    this.closeFilters();
  }

  // ---------- Tiến độ xử lý ----------
  readonly monthOptions = computed<MofSelectOption[]>(() => {
    this.i18n.locale();
    const months = this.repo.months().map((m) => ({ value: m, label: this.i18n.t('workspace.monthLabel', { m: +m.slice(5), y: m.slice(0, 4) }) }));
    return [{ value: '', label: this.i18n.t('workspace.anyMonth') }, ...months];
  });
  readonly unitOptions = computed<MofSelectOption[]>(() => {
    this.i18n.locale();
    const rows = this.repo.unitsFor({ month: this.month(), unit: '', topic: this.topic() });
    return [
      { value: '', label: this.i18n.t('workspace.anyUnit') },
      ...rows.map((u) => ({
        value: u.id || WS_UNASSIGNED_UNIT,
        label: u.id ? u.name : this.i18n.t('workspace.unassignedUnit'),
      })),
    ];
  });
  readonly progress = computed(() => this.repo.progressForSlice(this.slice(), this.now()));

  setMonth(m: string): void {
    this.month.set(m);
    this.page.set(1);
    this.patch({ month: m || null, page: null });
  }

  private tone(name: string): string {
    this.theme.theme();
    if (typeof getComputedStyle !== 'function') return '';
    return getComputedStyle(document.documentElement).getPropertyValue(`--mof-tone-${name}`).trim();
  }

  readonly chartOptions = computed<ApexOptions>(() => {
    const p = this.progress();
    this.i18n.locale();
    return {
      chart: {
        type: 'donut',
        height: 156,
        toolbar: { show: false },
        fontFamily: 'inherit',
        background: 'transparent',
        animations: { enabled: !reducedMotion(), speed: 600 },
      },
      labels: [this.i18n.t('workspace.onTime'), this.i18n.t('workspace.nearDue'), this.i18n.t('workspace.overdue'), this.i18n.t('workspace.done')],
      series: [p.onTime, p.nearDue, p.overdue, p.done],
      colors: [this.tone('blue'), this.tone('amber'), this.tone('red'), this.tone('green')].map((c) => c || '#2563b8'),
      legend: { show: false },
      dataLabels: { enabled: false },
      stroke: { width: 0 },
      tooltip: { theme: this.theme.theme() === 'dark' ? 'dark' : 'light' },
      states: { hover: { filter: { type: 'none' } }, active: { filter: { type: 'none' } } },
      plotOptions: { pie: { expandOnClick: false, donut: { size: '76%', labels: { show: false } } } },
      noData: { text: this.i18n.t('workspace.noData') },
    };
  });

  readonly legend = computed(() => {
    const p = this.progress();
    return [
      { key: 'workspace.onTime', tone: 'blue', n: p.onTime },
      { key: 'workspace.nearDue', tone: 'amber', n: p.nearDue },
      { key: 'workspace.overdue', tone: 'red', n: p.overdue },
      { key: 'workspace.done', tone: 'green', n: p.done },
    ];
  });

  // ---------- Lĩnh vực / đơn vị (DASH-01) ----------
  readonly topicStats = computed(() => this.repo.topicsFor(this.slice()).slice(0, 5));
  readonly unitStats = computed(() => this.repo.unitsFor(this.slice()).slice(0, 6));

  unitValue(id: string): string {
    return id || WS_UNASSIGNED_UNIT;
  }

  unitLabel(id: string, name: string): string {
    return id ? name : this.i18n.t('workspace.unassignedUnit');
  }
}
