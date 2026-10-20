import { ChangeDetectionStrategy, Component, DestroyRef, computed, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { ApexOptions } from 'apexcharts';
import { PortalHeaderComponent } from '../../../shared/ui/portal-header/portal-header.component';
import { PortalFooterComponent } from '../../../shared/ui/portal-footer/portal-footer.component';
import { TranslatePipe } from '../../../core/i18n/translate.pipe';
import { I18nService } from '../../../core/i18n/i18n.service';
import { ThemeService } from '../../../core/theme/theme.service';
import { BudgetTab, PortalHomeRepository } from '../../../core/mock-api/portal-home.repository';
import { LocalizedText } from '../../../core/mock-api/portal-home-fixtures';
import { MofButtonComponent } from '../../../shared/ui/mof-button/mof-button.component';
import { MofSelectComponent, MofSelectOption } from '../../../shared/ui/mof-select/mof-select.component';
import { MofChartComponent } from '../../../shared/ui/mof-chart/mof-chart.component';
import { MofFiIconComponent } from '../../../shared/ui/mof-fi-icon/mof-fi-icon.component';
import { RevealDirective } from '../../../shared/ui/reveal/reveal.directive';

/**
 * Screen PUB-home | Người dân / doanh nghiệp (ẩn danh) | Trang chủ cổng: banner, lối vào dịch vụ, tin tức,
 * thông báo, công khai số liệu ngân sách (mẫu) và tiện ích nhanh dẫn tới tra cứu / gửi câu hỏi / câu hỏi của tôi.
 * UC-162..UC-165 | Permission: public (không yêu cầu đăng nhập).
 */
@Component({
  imports: [
    PortalHeaderComponent,
    PortalFooterComponent,
    RouterLink,
    FormsModule,
    TranslatePipe,
    MofButtonComponent,
    MofSelectComponent,
    MofChartComponent,
    MofFiIconComponent,
    RevealDirective,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './portal-home.component.html',
  styleUrl: './portal-home.component.scss',
})
export class PortalHomeComponent {
  readonly repo = inject(PortalHomeRepository);
  private readonly i18n = inject(I18nService);
  private readonly theme = inject(ThemeService);

  private readonly reducedMotion =
    typeof window.matchMedia === 'function' && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  readonly slides = this.repo.heroSlides;
  readonly slideIndex = signal(0);
  private readonly destroyRef = inject(DestroyRef);
  private timer?: ReturnType<typeof setInterval>;
  private hovered = false;
  /** Tự chuyển slide mỗi 6s (crossfade); dừng khi hover/focus, khi tab ẩn; tắt hẳn với reduced-motion. */
  private readonly autoplayMs = 6000;
  readonly slide = computed(() => this.slides[this.slideIndex()] ?? this.slides[0]);

  readonly news = this.repo.news();
  readonly notices = this.repo.notices();
  readonly yearOptions: MofSelectOption[] = this.repo.budgetYears().map((y) => ({ label: String(y), value: String(y) }));

  readonly year = signal(this.yearOptions[0]?.value ?? '');
  readonly tab = signal<BudgetTab>('overview');
  readonly chartYear = signal(this.yearOptions[0]?.value ?? '');

  readonly kpis = computed(() => this.repo.kpis(Number(this.year()), this.tab()));

  constructor() {
    const onVisibility = () => (document.hidden ? this.stop() : this.start());
    document.addEventListener('visibilitychange', onVisibility);
    this.start();
    this.destroyRef.onDestroy(() => {
      this.stop();
      document.removeEventListener('visibilitychange', onVisibility);
    });
  }

  private readonly numberFmt = computed(
    () => new Intl.NumberFormat(this.i18n.locale() === 'vi' ? 'vi-VN' : 'en-US', { maximumFractionDigits: 1, minimumFractionDigits: 1 }),
  );
  private readonly dateFmt = computed(
    () => new Intl.DateTimeFormat(this.i18n.locale() === 'vi' ? 'vi-VN' : 'en-GB', { day: '2-digit', month: '2-digit', year: 'numeric' }),
  );

  /** Màu chart lấy từ token CSS theo theme hiện tại, không hard-code. */
  readonly chartOptions = computed<ApexOptions>(() => {
    this.theme.theme();
    const data = this.repo.budget(Number(this.chartYear()));
    const css = getComputedStyle(document.documentElement);
    const token = (name: string) => css.getPropertyValue(name).trim();
    const t = (key: string) => this.i18n.t(key);
    return {
      chart: {
        type: 'bar',
        height: 340,
        toolbar: { show: false },
        fontFamily: 'inherit',
        background: 'transparent',
        // Đổi ngôn ngữ/theme/năm chỉ cập nhật dữ liệu, không vẽ lại có animation → không nhảy layout.
        animations: { enabled: !this.reducedMotion, speed: 220, dynamicAnimation: { enabled: false } },
      },
      theme: { mode: this.theme.theme() === 'dark' ? 'dark' : 'light' },
      series: [
        { name: t('portal.budget.seriesRevenue'), data: data?.quarterly.revenue ?? [] },
        { name: t('portal.budget.seriesExpenditure'), data: data?.quarterly.expenditure ?? [] },
      ],
      colors: [token('--mof-blue'), token('--mof-chart-2')],
      plotOptions: {
        bar: { columnWidth: '64%', borderRadius: 6, borderRadiusApplication: 'end', dataLabels: { position: 'top' } },
      },
      // Viền trong suốt tạo khe giữa cột thu/chi để nhãn giá trị không dính nhau.
      stroke: { show: true, width: 4, colors: ['transparent'] },
      dataLabels: {
        enabled: true,
        offsetY: -20,
        style: { fontSize: '10px', fontWeight: 600, colors: [token('--mof-ink')] },
        background: { enabled: false },
      },
      xaxis: {
        categories: ['I', 'II', 'III', 'IV'].map((q) => `${t('portal.budget.quarter')} ${q}`),
        labels: { style: { colors: token('--mof-muted') } },
      },
      yaxis: {
        min: 0,
        forceNiceScale: true,
        labels: { offsetX: -6, style: { colors: token('--mof-muted') } },
      },
      grid: { borderColor: token('--mof-line'), strokeDashArray: 3, padding: { top: 4, right: 10, bottom: 4, left: 6 } },
      legend: {
        position: 'top',
        horizontalAlign: 'center',
        offsetY: 0,
        markers: { shape: 'circle' },
        itemMargin: { horizontal: 10, vertical: 6 },
        labels: { colors: token('--mof-ink') },
      },
      tooltip: { theme: this.theme.theme() === 'dark' ? 'dark' : 'light' },
    };
  });

  /** Carousel chỉ chuyển khi người dùng bấm (không autoplay) để tôn trọng reduced-motion và tránh mất tập trung. */
  goTo(index: number): void {
    const n = this.slides.length;
    this.slideIndex.set(((index % n) + n) % n);
    this.start();
  }

  pause(on: boolean): void {
    this.hovered = on;
    if (on) {
      this.stop();
    } else {
      this.start();
    }
  }

  private start(): void {
    this.stop();
    if (this.reducedMotion || this.hovered || this.slides.length < 2 || document.hidden) {
      return;
    }
    this.timer = setInterval(() => this.slideIndex.update((i) => (i + 1) % this.slides.length), this.autoplayMs);
  }

  private stop(): void {
    if (this.timer) {
      clearInterval(this.timer);
      this.timer = undefined;
    }
  }

  /** Sparkline 4 quý (chiều cao %) cho KPI thu/chi/bội chi; dữ liệu lấy từ repository. */
  sparkFor(id: string): number[] {
    const q = this.repo.budget(Number(this.year()))?.quarterly;
    if (!q) {
      return [];
    }
    const series = id === 'revenue' ? q.revenue : id === 'expenditure' ? q.expenditure : q.revenue.map((r, i) => Math.abs(r - q.expenditure[i]));
    const max = Math.max(...series, 1);
    return series.map((v) => Math.round((v / max) * 100));
  }

  step(delta: number): void {
    this.goTo(this.slideIndex() + delta);
  }

  /** Tiêu đề hero tách 2 dòng tại dấu "–" để luôn hiển thị đúng 2 dòng như mockup. */
  heroLines(key: string): string[] {
    const value = this.i18n.t(key);
    const at = value.indexOf(' – ');
    return at < 0 ? [value] : [value.slice(0, at + 2), value.slice(at + 3)];
  }

  text(value: LocalizedText): string {
    return value[this.i18n.locale()];
  }

  formatNumber(value: number): string {
    return this.numberFmt().format(value);
  }

  formatDate(iso: string): string {
    return this.dateFmt().format(new Date(iso));
  }
}
