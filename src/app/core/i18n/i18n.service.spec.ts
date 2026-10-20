import { TestBed } from '@angular/core/testing';
import { I18nService } from './i18n.service';

describe('I18nService', () => {
  let service: I18nService;

  beforeEach(() => {
    localStorage.clear();
    TestBed.configureTestingModule({});
    service = TestBed.inject(I18nService);
  });

  it('translates Vietnamese by default', () => {
    expect(service.t('nav.home')).toBe('Trang chủ');
  });

  it('switches to English and interpolates params', () => {
    service.setLocale('en');
    expect(service.t('home.topicCount', { count: 12 })).toContain('12');
    expect(service.t('nav.home')).toBe('Home');
  });
});
