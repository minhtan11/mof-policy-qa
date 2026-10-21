/**
 * Screen OPS-LIST | Hồ sơ nội bộ
 * Cán bộ xem danh sách hồ sơ hỏi–đáp trong phạm vi vai trò; lọc trạng thái/từ khoá như hàng đợi W-01.
 * UC-142..UC-161 | Permission: internalGuard; data scope WS_ROLE_SCOPE.
 */
import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { ActivatedRoute, Params, Router, RouterLink } from '@angular/router';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { DatePipe } from '@angular/common';
import { WorkspaceShellComponent } from '../../../shared/ui/workspace-shell/workspace-shell.component';
import { StatusBadgeComponent } from '../../../shared/ui/status-badge/status-badge.component';
import { TranslatePipe } from '../../../core/i18n/translate.pipe';
import { AuthService } from '../../../core/auth/auth.service';
import { MofFiIconComponent } from '../../../shared/ui/mof-fi-icon/mof-fi-icon.component';
import { MofPaginationComponent } from '../../../shared/ui/mof-pagination/mof-pagination.component';
import { MofDataTableComponent } from '../../../shared/ui/mof-data-table/mof-data-table.component';
import { MofBreadcrumbComponent } from '../../../shared/ui/mof-breadcrumb/mof-breadcrumb.component';
import { MofBreadcrumbItem } from '../../../shared/ui/mof-breadcrumb/mof-breadcrumb.model';
import {
  INTERNAL_STATUS_TABS,
  InternalDossierRepository,
  InternalStatusTab,
} from '../../../core/mock-api/internal-dossier.repository';
import { WS_TOPIC_VISUALS } from '../../../core/mock-api/workspace-overview-fixtures';
import { isOverdue } from '../../../core/mock-api/workspace-overview.repository';
import { Dossier } from '../../../core/models/domain.models';
import { MofTooltipDirective } from '../../../shared/ui/mof-tooltip/mof-tooltip.directive';

export const INTERNAL_PAGE_SIZES = [10, 20, 50];
const TAB_IDS = INTERNAL_STATUS_TABS.map((t) => t.id);

@Component({
  imports: [MofTooltipDirective, 
    WorkspaceShellComponent,
    RouterLink,
    DatePipe,
    StatusBadgeComponent,
    TranslatePipe,
    MofFiIconComponent,
    MofPaginationComponent,
    MofDataTableComponent,
    MofBreadcrumbComponent,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './internal-dossiers.component.html',
  styleUrl: './internal-dossiers.component.scss',
})
export class InternalDossiersComponent {
  readonly repo = inject(InternalDossierRepository);
  readonly auth = inject(AuthService);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);

  readonly tabs = INTERNAL_STATUS_TABS;
  readonly pageSizes = INTERNAL_PAGE_SIZES;

  readonly tab = signal<InternalStatusTab>('all');
  readonly qInput = signal('');
  readonly q = signal('');
  readonly page = signal(1);
  readonly size = signal(10);

  readonly crumbs = computed<MofBreadcrumbItem[]>(() => [
    { labelKey: 'workspace.navOverview', link: '/workspace' },
    { labelKey: 'wsNav.internalDossiers', current: true },
  ]);

  readonly rows = computed(() => this.repo.list(this.tab(), this.q()));
  readonly total = computed(() => this.rows().length);
  readonly pageRows = computed(() => {
    const start = (this.page() - 1) * this.size();
    return this.rows().slice(start, start + this.size());
  });

  private readonly urlSync = this.route.queryParamMap.pipe(takeUntilDestroyed()).subscribe((p) => {
    const t = p.get('filter') as InternalStatusTab | null;
    this.tab.set(t && TAB_IDS.includes(t) ? t : 'all');
    this.qInput.set(p.get('q') ?? '');
    this.q.set(p.get('q') ?? '');
    this.page.set(Math.max(1, Math.floor(Number(p.get('page'))) || 1));
    const size = Number(p.get('size'));
    this.size.set(INTERNAL_PAGE_SIZES.includes(size) ? size : 10);
  });

  setTab(id: InternalStatusTab): void {
    this.patchUrl({ filter: id === 'all' ? null : id, page: null });
  }

  onSearch(v: string): void {
    this.qInput.set(v);
  }

  applySearch(): void {
    this.patchUrl({ q: this.qInput().trim() || null, page: null });
  }

  clearSearch(): void {
    this.qInput.set('');
    this.patchUrl({ q: null, page: null });
  }

  onPage(p: number): void {
    this.patchUrl({ page: p > 1 ? String(p) : null });
  }

  onSize(s: number): void {
    this.patchUrl({ size: s === 10 ? null : String(s), page: null });
  }

  overdue(d: Dossier): boolean {
    return isOverdue(d, Date.now());
  }

  topicTone(d: Dossier): string {
    return (WS_TOPIC_VISUALS[d.topicId] ?? WS_TOPIC_VISUALS['other']).tone;
  }

  onTabKey(ev: KeyboardEvent, i: number): void {
    const n = this.tabs.length;
    let next = i;
    if (ev.key === 'ArrowRight') next = (i + 1) % n;
    else if (ev.key === 'ArrowLeft') next = (i - 1 + n) % n;
    else return;
    ev.preventDefault();
    this.setTab(this.tabs[next].id);
  }

  private patchUrl(patch: Params): void {
    void this.router.navigate([], {
      relativeTo: this.route,
      queryParams: patch,
      queryParamsHandling: 'merge',
      replaceUrl: true,
    });
  }
}
