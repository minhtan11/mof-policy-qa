import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { I18nService } from '../../../core/i18n/i18n.service';
import { AppLocale } from '../../../core/i18n/translations';
import { TranslatePipe } from '../../../core/i18n/translate.pipe';

type ViewTransitionDoc = Document & { startViewTransition?: (cb: () => void) => unknown };

/**
 * Chuyển ngôn ngữ dùng chung (portal + workspace): cờ của ngôn ngữ đang chọn + segmented VI | EN.
 * Hai cờ luôn nằm trong DOM, chỉ đổi opacity → không tải lại ảnh, không nhảy layout (kích thước cố định).
 * Đổi chữ qua View Transition (crossfade ngắn) nếu trình duyệt hỗ trợ và người dùng không bật reduced-motion.
 */
@Component({
  selector: 'app-lang-switch',
  imports: [TranslatePipe],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './lang-switch.component.html',
  styleUrl: './lang-switch.component.scss',
})
export class LangSwitchComponent {
  readonly i18n = inject(I18nService);
  readonly locales: AppLocale[] = ['vi', 'en'];

  set(locale: AppLocale): void {
    if (this.i18n.locale() === locale) {
      return;
    }
    const doc = document as ViewTransitionDoc;
    const reduce = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
    if (doc.startViewTransition && !reduce) {
      doc.documentElement.classList.add('vt-locale');
      const vt = doc.startViewTransition(() => this.i18n.setLocale(locale)) as { finished?: Promise<unknown> };
      void vt.finished?.finally(() => doc.documentElement.classList.remove('vt-locale'));
    } else {
      this.i18n.setLocale(locale);
    }
  }

  setVi(): void {
    this.set('vi');
  }

  setEn(): void {
    this.set('en');
  }
}
