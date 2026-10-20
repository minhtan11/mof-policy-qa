import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
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
  readonly slide = computed(() => this.slides[this.slideIndex()] ?? this.slides[0]);

  readonly news = this.repo.news();
  readonly notices = this.repo.notices();
  readonly yearOptions: MofSelectOption[] = this.repo.budgetYears().map((y) => ({ label: String(y), value: String(y) }));

  readonly year = signal(this.yearOptions[0]?.value ?? '');
  readonly tab = signal<BudgetTab>('overview');
  readonly chartYear = signal(this.yearOptions[0]?.value ?? '');

  readonly kpis = computed(() => this.repo.kpis(Number(this.year()), this.tab()));

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
        height: 260,
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
      plotOptions: { bar: { columnWidth: '55%', borderRadius: 4, dataLabels: { position: 'top' } } },
      dataLabels: { enabled: true, offsetY: -18, style: { fontSize: '11px', colors: [token('--mof-ink')] } },
      xaxis: {
        categories: ['I', 'II', 'III', 'IV'].map((q) => `${t('portal.budget.quarter')} ${q}`),
        labels: { style: { colors: token('--mof-muted') } },
      },
      yaxis: { title: { text: t('portal.budget.unitTrillion'), style: { color: token('--mof-muted') } }, labels: { style: { colors: token('--mof-muted') } } },
      grid: { borderColor: token('--mof-line') },
      legend: { position: 'top', labels: { colors: token('--mof-ink') } },
      tooltip: { theme: this.theme.theme() === 'dark' ? 'dark' : 'light' },
    };
  });

  /** Carousel chỉ chuyển khi người dùng bấm (không autoplay) để tôn trọng reduced-motion và tránh mất tập trung. */
  goTo(index: number): void {
    const n = this.slides.length;
    this.slideIndex.set(((index % n) + n) % n);
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
