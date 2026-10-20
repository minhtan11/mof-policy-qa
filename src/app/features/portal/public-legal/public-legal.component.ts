import { ChangeDetectionStrategy, Component, computed, effect, inject, signal, untracked } from '@angular/core';
import { DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, ParamMap, Router } from '@angular/router';
import { toSignal } from '@angular/core/rxjs-interop';
import { LegalDocStatus, LegalDocumentRepository } from '../../../core/mock-api/legal-document.repository';
import { LegalDocument } from '../../../core/models/domain.models';
import { TranslatePipe } from '../../../core/i18n/translate.pipe';
import { I18nService } from '../../../core/i18n/i18n.service';
import { PortalHeaderComponent } from '../../../shared/ui/portal-header/portal-header.component';
import { PortalFooterComponent } from '../../../shared/ui/portal-footer/portal-footer.component';
import { PageBackdropComponent } from '../../../shared/ui/page-backdrop/page-backdrop.component';
import { RevealDirective } from '../../../shared/ui/reveal/reveal.directive';
import { MofButtonComponent } from '../../../shared/ui/mof-button/mof-button.component';
import { MofInputComponent } from '../../../shared/ui/mof-input/mof-input.component';
import { MofSelectComponent } from '../../../shared/ui/mof-select/mof-select.component';
import { MofFiIconComponent } from '../../../shared/ui/mof-fi-icon/mof-fi-icon.component';
import { MofBadgeComponent } from '../../../shared/ui/mof-badge/mof-badge.component';
import { MofIconButtonComponent } from '../../../shared/ui/mof-icon-button/mof-icon-button.component';
import { MofBreadcrumbComponent } from '../../../shared/ui/mof-breadcrumb/mof-breadcrumb.component';
import { MofBreadcrumbItem } from '../../../shared/ui/mof-breadcrumb/mof-breadcrumb.model';

export const LEGAL_STATUSES: readonly LegalDocStatus[] = ['effective', 'expired', 'replaced', 'draft'];

export interface PublicLegalState {
  q: string;
  status: LegalDocStatus | null;
}

/** Đọc bộ lọc từ query params. */
export function parseLegal(p: ParamMap): PublicLegalState {
  const status = p.get('status') as LegalDocStatus | null;
  return {
    q: p.get('q') ?? '',
    status: status && LEGAL_STATUSES.includes(status) ? status : null,
  };
}

export function legalParams(s: PublicLegalState): Record<string, string | null> {
  return {
    q: s.q.trim() || null,
    status: s.status,
  };
}

export function legalStatusTone(status: LegalDocStatus): 'success' | 'warn' | 'neutral' | 'info' {
  switch (status) {
    case 'effective':
      return 'success';
    case 'draft':
      return 'info';
    case 'expired':
    case 'replaced':
      return 'neutral';
  }
}

/**
 * Screen PUB-legal | Người dân/doanh nghiệp | Tra cứu văn bản pháp luật công khai: tìm kiếm, lọc hiệu lực,
 * mở chi tiết mở rộng. Dữ liệu: LegalDocumentRepository ← LEGAL_DOCUMENTS. UC-162..UC-165 | Permission: public.
 */
@Component({
  imports: [
    DatePipe,
    FormsModule,
    TranslatePipe,
    PortalHeaderComponent,
    PortalFooterComponent,
    PageBackdropComponent,
    RevealDirective,
    MofButtonComponent,
    MofInputComponent,
    MofSelectComponent,
    MofFiIconComponent,
    MofBadgeComponent,
    MofIconButtonComponent,
    MofBreadcrumbComponent,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './public-legal.component.html',
  styleUrl: './public-legal.component.scss',
})
export class PublicLegalComponent {
  private readonly repo = inject(LegalDocumentRepository);
  private readonly i18n = inject(I18nService);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);

  readonly crumbs: readonly MofBreadcrumbItem[] = [
    { labelKey: 'nav.home', link: '/portal' },
    { labelKey: 'portal.nav.legal', link: '/portal/van-ban' },
  ];

  private readonly params = toSignal(this.route.queryParamMap, { initialValue: this.route.snapshot.queryParamMap });
  readonly state = computed(() => parseLegal(this.params()));
  readonly results = computed(() => this.repo.list({ query: this.state().q, status: this.state().status }));
  readonly keyword = signal('');
  readonly expanded = signal<Set<string>>(new Set());

  readonly statusOptions = computed(() => {
    this.i18n.locale();
    return [
      { label: this.i18n.t('legal.statusAll'), value: '' },
      ...LEGAL_STATUSES.map((s) => ({ label: this.i18n.t(`legal.st.${s}`), value: s })),
    ];
  });

  constructor() {
    effect(() => {
      const q = this.state().q;
      untracked(() => this.keyword.set(q));
    });
  }

  search(e?: Event): void {
    e?.preventDefault();
    void this.go({ q: this.keyword() });
  }

  setStatus(v: string): void {
    void this.go({ status: (v || null) as LegalDocStatus | null });
  }

  clearFilters(): void {
    this.keyword.set('');
    void this.go({ q: '', status: null });
  }

  toggleExpand(id: string): void {
    this.expanded.update((set) => {
      const next = new Set(set);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  isOpen(id: string): boolean {
    return this.expanded().has(id);
  }

  statusTone(status: LegalDocStatus): 'success' | 'warn' | 'neutral' | 'info' {
    return legalStatusTone(status);
  }

  trackDoc(_: number, doc: LegalDocument): string {
    return doc.id;
  }

  private go(patch: Partial<PublicLegalState>): Promise<boolean> {
    return this.router.navigate([], {
      relativeTo: this.route,
      queryParams: legalParams({ ...this.state(), ...patch }),
      replaceUrl: true,
    });
  }
}
