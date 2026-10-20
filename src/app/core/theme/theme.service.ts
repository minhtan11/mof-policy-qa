import { Injectable, signal, effect } from '@angular/core';

export type AppTheme = 'light' | 'dark';

const STORAGE_KEY = 'mof-policy-qa.theme.v1';

@Injectable({ providedIn: 'root' })
export class ThemeService {
  readonly theme = signal<AppTheme>(this.readInitial());

  constructor() {
    effect(() => {
      const value = this.theme();
      document.documentElement.setAttribute('data-theme', value);
      localStorage.setItem(STORAGE_KEY, value);
    });
  }

  toggle(): void {
    this.theme.update((current) => (current === 'light' ? 'dark' : 'light'));
  }

  set(theme: AppTheme): void {
    this.theme.set(theme);
  }

  private readInitial(): AppTheme {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved === 'light' || saved === 'dark') {
      return saved;
    }
    const media = window.matchMedia?.('(prefers-color-scheme: dark)');
    return media?.matches ? 'dark' : 'light';
  }
}
