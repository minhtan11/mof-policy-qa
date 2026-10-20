import { Injectable, computed, signal, effect } from '@angular/core';
import { AppLocale, TRANSLATIONS } from './translations';

const STORAGE_KEY = 'mof-policy-qa.locale.v1';

@Injectable({ providedIn: 'root' })
export class I18nService {
  readonly locale = signal<AppLocale>(this.readInitial());
  readonly dictionary = computed(() => TRANSLATIONS[this.locale()]);

  constructor() {
    effect(() => {
      const locale = this.locale();
      document.documentElement.lang = locale;
      localStorage.setItem(STORAGE_KEY, locale);
    });
  }

  t(key: string, params?: Record<string, string | number>): string {
    const template = this.dictionary()[key] ?? TRANSLATIONS.vi[key] ?? key;
    if (!params) {
      return template;
    }
    return Object.entries(params).reduce(
      (text, [name, value]) => text.replaceAll(`{{${name}}}`, String(value)),
      template,
    );
  }

  setLocale(locale: AppLocale): void {
    this.locale.set(locale);
  }

  toggleLocale(): void {
    this.locale.update((current) => (current === 'vi' ? 'en' : 'vi'));
  }

  private readInitial(): AppLocale {
    const saved = localStorage.getItem(STORAGE_KEY);
    return saved === 'en' || saved === 'vi' ? saved : 'vi';
  }
}
