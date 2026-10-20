import { ChangeDetectionStrategy, Component, computed, inject, input, output } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { TranslatePipe } from '../../../core/i18n/translate.pipe';
import { I18nService } from '../../../core/i18n/i18n.service';
import { MofSelectComponent } from '../mof-select/mof-select.component';
import { MofFiIconComponent } from '../mof-fi-icon/mof-fi-icon.component';

export type PageItem = number | 'gap-l' | 'gap-r';

/** Dãy số trang có dấu "…": luôn có trang đầu/cuối và ±1 quanh trang hiện tại. */
export function pageItems(page: number, pages: number): PageItem[] {
  if (pages <= 7) {
    return Array.from({ length: pages }, (_, i) => i + 1);
  }
  const lo = Math.max(2, Math.min(page - 1, pages - 4));
  const hi = Math.min(pages - 1, Math.max(page + 1, 5));
  const mid = Array.from({ length: hi - lo + 1 }, (_, i) => lo + i);
  return [1, ...(lo > 2 ? (['gap-l'] as PageItem[]) : []), ...mid, ...(hi < pages - 1 ? (['gap-r'] as PageItem[]) : []), pages];
}

/**
 * Phân trang dùng chung: "Hiển thị x–y / N", trước/sau, số trang có dấu …, chọn số dòng/trang.
 * Chỉ phát sự kiện — trang cha giữ trạng thái (vd. đồng bộ ?page=&size=).
 */
@Component({
  selector: 'app-mof-pagination',
  imports: [FormsModule, TranslatePipe, MofSelectComponent, MofFiIconComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './mof-pagination.component.html',
  styleUrl: './mof-pagination.component.scss',
})
export class MofPaginationComponent {
  private readonly i18n = inject(I18nService);
  readonly page = input(1);
  readonly total = input(0);
  readonly pageSize = input(10);
  readonly pageSizes = input<number[]>([6, 12, 24]);
  readonly pageChange = output<number>();
  readonly pageSizeChange = output<number>();

  readonly pages = computed(() => Math.max(1, Math.ceil(this.total() / this.pageSize())));
  readonly current = computed(() => Math.min(Math.max(1, this.page()), this.pages()));
  readonly from = computed(() => (this.total() ? (this.current() - 1) * this.pageSize() + 1 : 0));
  readonly to = computed(() => Math.min(this.total(), this.current() * this.pageSize()));
  readonly items = computed(() => pageItems(this.current(), this.pages()));
  readonly sizeOptions = computed(() => {
    this.i18n.locale();
    return this.pageSizes().map((n) => ({ value: String(n), label: this.i18n.t('pagination.perPage', { n }) }));
  });

  go(p: number): void {
    if (p >= 1 && p <= this.pages() && p !== this.current()) {
      this.pageChange.emit(p);
    }
  }

  isNum(i: PageItem): i is number {
    return typeof i === 'number';
  }
}
