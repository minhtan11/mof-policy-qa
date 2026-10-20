import { ChangeDetectionStrategy, Component, DestroyRef, ElementRef, computed, inject, signal, viewChild } from '@angular/core';
import { AbstractControl, FormControl, ReactiveFormsModule, ValidationErrors } from '@angular/forms';
import { ActivatedRoute, ParamMap, Router, RouterLink } from '@angular/router';
import { DatePipe } from '@angular/common';
import { takeUntilDestroyed, toSignal } from '@angular/core/rxjs-interop';
import { AuthService } from '../../../core/auth/auth.service';
import { TranslatePipe } from '../../../core/i18n/translate.pipe';
import { I18nService } from '../../../core/i18n/i18n.service';
import { ToastService } from '../../../core/toast/toast.service';
import {
  MINE_SORTS,
  MINE_STATUSES,
  MineQuery,
  MineSort,
  MineStatus,
  MyQuestionRepository,
  queryMine,
} from '../../../core/mock-api/my-question.repository';
import { PortalHeaderComponent } from '../../../shared/ui/portal-header/portal-header.component';
import { PortalFooterComponent } from '../../../shared/ui/portal-footer/portal-footer.component';
import { PageBackdropComponent } from '../../../shared/ui/page-backdrop/page-backdrop.component';
import { RevealDirective } from '../../../shared/ui/reveal/reveal.directive';
import { MofButtonComponent } from '../../../shared/ui/mof-button/mof-button.component';
import { MofInputComponent } from '../../../shared/ui/mof-input/mof-input.component';
import { MofSelectComponent } from '../../../shared/ui/mof-select/mof-select.component';
import { MofFiIconComponent } from '../../../shared/ui/mof-fi-icon/mof-fi-icon.component';
import { MofFieldErrorComponent } from '../../../shared/ui/mof-field-error/mof-field-error.component';
import { MofPaginationComponent } from '../../../shared/ui/mof-pagination/mof-pagination.component';
import { FormsModule } from '@angular/forms';

export interface MineState extends MineQuery {
  page: number;
  size: number;
}

export const MINE_PAGE_SIZES = [10, 20, 50];
export const MINE_PAGE_SIZE = 10;
/** Email: cần có tên miền cấp cao (Validators.email chấp nhận “a@b”). */
export const MINE_EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

/** Validator email (trim trước khi kiểm) → { required } | { email }. */
export function mineEmailValidator(c: AbstractControl<string>): ValidationErrors | null {
  const v = (c.value ?? '').trim();
  if (!v) return { required: true };
  return MINE_EMAIL_PATTERN.test(v) ? null : { email: true };
}

export const MINE_STATUS_ICON: Record<MineStatus, string> = {
  processing: 'hourglass-end',
  waiting: 'time-past',
  answered: 'check-circle',
  rejected: 'cross-circle',
};

/** Đọc bộ lọc/sắp xếp/trang từ query params (email KHÔNG đưa lên URL — dữ liệu cá nhân). */
export function parseMine(p: ParamMap): MineState {
  const status = p.get('status') as MineStatus | null;
  const sort = p.get('sort') as MineSort | null;
  const size = Number(p.get('size'));
  return {
    status: status && MINE_STATUSES.includes(status) ? status : null,
    topic: p.get('topic') || null,
    sort: sort && MINE_SORTS.includes(sort) ? sort : 'newest',
    page: Math.max(1, Math.floor(Number(p.get('page'))) || 1),
    size: MINE_PAGE_SIZES.includes(size) ? size : MINE_PAGE_SIZE,
  };
}

export function mineParams(s: MineState): Record<string, string | null> {
  return {
    status: s.status,
    topic: s.topic,
    sort: s.sort === 'newest' ? null : s.sort,
    page: s.page > 1 ? String(s.page) : null,
    size: s.size === MINE_PAGE_SIZE ? null : String(s.size),
  };
}

/**
 * Screen PUB-03 | Người dân/doanh nghiệp | “Câu hỏi của tôi”: tra cứu hồ sơ theo email đã gửi, lọc trạng thái/lĩnh vực,
 * sắp xếp, phân trang (mof-pagination), mở chi tiết /portal/ho-so/:code. Đăng nhập → prefill email tài khoản + tự tải;
 * khách → prefill email vừa gửi trên máy (nếu có). Bộ lọc/trang đồng bộ query params (không tạo lại component, không nháy).
 * Dữ liệu: MyQuestionRepository → MockDbService. UC-110, UC-122 | Permission: phạm vi đúng email.
 */
@Component({
  imports: [
    DatePipe,
    FormsModule,
    ReactiveFormsModule,
    RouterLink,
    TranslatePipe,
    PortalHeaderComponent,
    PortalFooterComponent,
    PageBackdropComponent,
    RevealDirective,
    MofButtonComponent,
    MofInputComponent,
    MofSelectComponent,
    MofFiIconComponent,
    MofFieldErrorComponent,
    MofPaginationComponent,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './my-questions.component.html',
  styleUrl: './my-questions.component.scss',
})
export class MyQuestionsComponent {
  readonly repo = inject(MyQuestionRepository);
  private readonly auth = inject(AuthService);
  private readonly i18n = inject(I18nService);
  private readonly toast = inject(ToastService);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);

  readonly signedIn = computed(() => !!this.auth.user()?.email);
  private readonly initialEmail = this.auth.user()?.email ?? this.repo.lastSenderEmail();

  readonly emailCtrl = new FormControl(this.initialEmail, {
    nonNullable: true,
    validators: [mineEmailValidator],
  });
  /** Email đã áp dụng (tự tải nếu prefill hợp lệ). */
  readonly email = signal(this.emailCtrl.valid ? this.initialEmail.trim().toLowerCase() : '');
  private readonly tried = signal(false);
  /** Nhịp đổi giá trị/trạng thái của control (FormControl không phải signal). */
  private readonly ctrlTick = signal(0);
  readonly emailError = computed(() => {
    this.ctrlTick();
    if (!this.tried() || this.emailCtrl.valid) return null;
    return this.i18n.t(this.emailCtrl.hasError('required') ? 'my.emailRequired' : 'my.emailInvalid');
  });

  private readonly params = toSignal(this.route.queryParamMap, { initialValue: this.route.snapshot.queryParamMap });
  readonly state = computed(() => parseMine(this.params()));
  readonly all = computed(() => this.repo.rows(this.email()));
  readonly results = computed(() => queryMine(this.all(), this.state()));
  readonly pages = computed(() => Math.max(1, Math.ceil(this.results().length / this.state().size)));
  readonly page = computed(() => Math.min(this.state().page, this.pages()));
  readonly visible = computed(() => {
    const { size } = this.state();
    return this.results().slice((this.page() - 1) * size, this.page() * size);
  });
  readonly hasFilters = computed(() => !!this.state().status || !!this.state().topic);
  readonly pageSizes = MINE_PAGE_SIZES;
  readonly statusIcon = MINE_STATUS_ICON;

  readonly statusOptions = computed(() => {
    this.i18n.locale();
    return [{ label: this.i18n.t('my.statusAll'), value: '' }, ...MINE_STATUSES.map((s) => ({ label: this.i18n.t(`my.st.${s}`), value: s }))];
  });
  readonly topicOptions = computed(() => {
    this.i18n.locale();
    return [{ label: this.i18n.t('my.topicAll'), value: '' }, ...this.repo.topics.map((t) => ({ label: t.name, value: t.id }))];
  });
  readonly sortOptions = computed(() => {
    this.i18n.locale();
    return MINE_SORTS.map((s) => ({ label: this.i18n.t(`my.sort.${s}`), value: s }));
  });

  /** Giữ chiều cao bảng trong lúc đổi trang/lọc → không co giật. */
  readonly holdHeight = signal<number | null>(null);
  private readonly tableEl = viewChild<ElementRef<HTMLElement>>('table');
  private readonly toolbarEl = viewChild<ElementRef<HTMLElement>>('toolbar');

  constructor() {
    this.emailCtrl.valueChanges.pipe(takeUntilDestroyed(inject(DestroyRef))).subscribe(() => this.ctrlTick.update((n) => n + 1));
  }

  load(): void {
    this.tried.set(true);
    this.ctrlTick.update((n) => n + 1);
    if (this.emailCtrl.invalid) {
      return;
    }
    const email = this.emailCtrl.value.trim().toLowerCase();
    this.email.set(email);
    if (this.state().page > 1) {
      void this.go({ page: 1 });
    }
    if (!this.all().length) {
      this.toast.info('my.toastEmpty', { title: 'my.toastEmptyTitle', params: { email } });
    }
  }

  setStatus(v: string): void {
    void this.swap({ status: (v || null) as MineStatus | null, page: 1 });
  }

  setTopic(v: string): void {
    void this.swap({ topic: v || null, page: 1 });
  }

  setSort(v: string): void {
    void this.swap({ sort: v as MineSort, page: 1 });
  }

  setSize(size: number): void {
    void this.swap({ size, page: 1 });
  }

  clearFilters(): void {
    void this.swap({ status: null, topic: null, page: 1 });
  }

  goAsk(): void {
    void this.router.navigateByUrl('/portal/hoi-dap');
  }

  goPage(page: number): void {
    void this.swap({ page }).then(() => {
      const bar = this.toolbarEl()?.nativeElement;
      if (!bar || typeof bar.getBoundingClientRect !== 'function') return;
      const top = bar.getBoundingClientRect().top;
      const headerH = parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--mof-header-h')) * 16 || 68;
      if (top < headerH || top > window.innerHeight) {
        bar.scrollIntoView?.({ behavior: this.reduced() ? 'auto' : 'smooth', block: 'start' });
      }
    });
  }

  /** Đổi dữ liệu bảng: giữ min-height + crossfade (View Transitions) → nút cũ không biến mất trước khi nút mới vào. */
  private swap(patch: Partial<MineState>): Promise<boolean> {
    this.holdHeight.set(this.tableEl()?.nativeElement.offsetHeight ?? null);
    return this.go(patch, true).then((ok) => {
      requestAnimationFrame(() => this.holdHeight.set(null));
      return ok;
    });
  }

  private go(patch: Partial<MineState>, fade = false): Promise<boolean> {
    const nav = () =>
      this.router.navigate([], { relativeTo: this.route, queryParams: mineParams({ ...this.state(), ...patch }), replaceUrl: true });
    const doc = document as Document & { startViewTransition?: (cb: () => Promise<unknown>) => unknown };
    if (fade && doc.startViewTransition && !this.reduced()) {
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

  private reduced(): boolean {
    return !!window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
  }
}
