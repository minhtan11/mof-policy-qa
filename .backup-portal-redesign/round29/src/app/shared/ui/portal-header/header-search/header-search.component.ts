import { ChangeDetectionStrategy, Component, ElementRef, inject, output, signal, viewChild } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { TranslatePipe } from '../../../../core/i18n/translate.pipe';
import { PublicQaRepository } from '../../../../core/mock-api/public-qa.repository';
import { MofIconButtonComponent } from '../../mof-icon-button/mof-icon-button.component';
import { MofFiIconComponent } from '../../mof-fi-icon/mof-fi-icon.component';

/**
 * Tìm kiếm dạng command overlay của header cổng. Mở bằng nút kính lúp hoặc Ctrl/⌘+K; Esc đóng và trả focus;
 * Tab bị giữ trong hộp. Gửi = logic tìm kiếm cũ: điều hướng /portal/tra-cuu?q=… (gợi ý chủ đề → ?topic=…).
 * Lưu ý: header KHÔNG đặt backdrop-filter trên chính nó (đã chuyển sang ::before) để overlay fixed phủ đúng viewport.
 */
@Component({
  selector: 'app-header-search',
  imports: [FormsModule, TranslatePipe, MofIconButtonComponent, MofFiIconComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './header-search.component.html',
  styleUrl: './header-search.component.scss',
  host: { '(document:keydown)': 'onGlobalKey($event)' },
})
export class HeaderSearchComponent {
  private readonly router = inject(Router);
  readonly topics = inject(PublicQaRepository).popularTopics(5);
  readonly open = signal(false);
  readonly keyword = signal('');
  /** Báo header đóng dropdown khác khi overlay tìm kiếm mở. */
  readonly opened = output<void>();
  private readonly trigger = viewChild(MofIconButtonComponent);
  private readonly input = viewChild<ElementRef<HTMLInputElement>>('input');
  private readonly panel = viewChild<ElementRef<HTMLElement>>('panel');

  show(): void {
    this.open.set(true);
    this.opened.emit();
    setTimeout(() => this.input()?.nativeElement.focus({ preventScroll: true }), 0);
  }

  close(): void {
    if (!this.open()) {
      return;
    }
    this.open.set(false);
    this.trigger()?.focus();
  }

  submit(e?: Event): void {
    e?.preventDefault();
    const q = this.keyword().trim();
    this.open.set(false);
    void this.router.navigate(['/portal/tra-cuu'], { queryParams: { q: q || null } });
  }

  goTopic(id: string): void {
    this.open.set(false);
    void this.router.navigate(['/portal/tra-cuu'], { queryParams: { topic: id } });
  }

  onGlobalKey(e: KeyboardEvent): void {
    if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
      e.preventDefault();
      this.show();
    }
  }

  onKey(e: KeyboardEvent): void {
    if (e.key === 'Escape') {
      e.preventDefault();
      this.close();
      return;
    }
    if (e.key !== 'Tab') {
      return;
    }
    const els = Array.from(this.panel()?.nativeElement.querySelectorAll<HTMLElement>('input, button') ?? []);
    if (!els.length) {
      return;
    }
    const first = els[0];
    const last = els[els.length - 1];
    if (e.shiftKey && document.activeElement === first) {
      e.preventDefault();
      last.focus();
    } else if (!e.shiftKey && document.activeElement === last) {
      e.preventDefault();
      first.focus();
    }
  }
}
