import { Component, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { provideRouter, Router } from '@angular/router';
import { RouterTestingHarness } from '@angular/router/testing';
import { MofBreadcrumbComponent } from './mof-breadcrumb.component';
import {
  breadcrumbLinkPath,
  buildBreadcrumbView,
  normalizeBreadcrumbPath,
  parseBreadcrumbQuery,
  resolveBreadcrumbCurrentIndex,
  type MofBreadcrumbItem,
} from './mof-breadcrumb.model';

@Component({
  standalone: true,
  imports: [MofBreadcrumbComponent],
  template: `<app-mof-breadcrumb [items]="items()" />`,
})
class HostPage {
  readonly items = signal<readonly MofBreadcrumbItem[]>([
    { label: 'Portal', link: '/portal' },
    { label: 'Hỏi đáp', link: '/portal/hoi-dap' },
  ]);
}

describe('mof-breadcrumb model helpers', () => {
  it('normalizes paths (slash, query/hash, empty)', () => {
    expect(normalizeBreadcrumbPath('')).toBe('/');
    expect(normalizeBreadcrumbPath('portal')).toBe('/portal');
    expect(normalizeBreadcrumbPath('/portal/')).toBe('/portal');
    expect(normalizeBreadcrumbPath('/portal/hoi-dap?x=1#top')).toBe('/portal/hoi-dap');
    expect(normalizeBreadcrumbPath('/')).toBe('/');
  });

  it('builds link path from string or commands array', () => {
    expect(breadcrumbLinkPath('/workspace/ho-so/12')).toBe('/workspace/ho-so/12');
    expect(breadcrumbLinkPath(['/', 'workspace', 'ho-so', '12'])).toBe('/workspace/ho-so/12');
    expect(breadcrumbLinkPath(['workspace', '', 'tra-cuu'])).toBe('/workspace/tra-cuu');
  });

  it('parses query string safely', () => {
    expect(parseBreadcrumbQuery('/workspace')).toEqual({});
    expect(parseBreadcrumbQuery('/workspace?filter=new&q=a%20b')).toEqual({ filter: 'new', q: 'a b' });
    expect(parseBreadcrumbQuery('/x?broken')).toEqual({ broken: '' });
  });

  it('resolves current by forced flag, then deepest URL match, then last item', () => {
    const items: MofBreadcrumbItem[] = [
      { label: 'A', link: '/a' },
      { label: 'B', link: '/a/b' },
      { label: 'C', link: '/a/b/c' },
    ];
    expect(resolveBreadcrumbCurrentIndex([], '/a')).toBe(-1);
    expect(resolveBreadcrumbCurrentIndex(items, '/a/b')).toBe(1);
    expect(resolveBreadcrumbCurrentIndex(items, '/a/b/c?x=1')).toBe(2);
    expect(resolveBreadcrumbCurrentIndex(items, '/unknown')).toBe(2);
    expect(
      resolveBreadcrumbCurrentIndex(
        [
          { label: 'A', link: '/a', current: true },
          { label: 'B', link: '/a/b' },
        ],
        '/a/b',
      ),
    ).toBe(0);
  });

  it('matches queryParams when provided; ignores when omitted', () => {
    const items: MofBreadcrumbItem[] = [
      { label: 'All', link: '/workspace' },
      { label: 'New', link: '/workspace', queryParams: { filter: 'new' } },
    ];
    expect(resolveBreadcrumbCurrentIndex(items, '/workspace')).toBe(0);
    expect(resolveBreadcrumbCurrentIndex(items, '/workspace?filter=new')).toBe(1);
    expect(resolveBreadcrumbCurrentIndex(items, '/workspace?filter=processing')).toBe(0);
  });

  it('sanitizes empty labels and marks only non-current links clickable', () => {
    const view = buildBreadcrumbView(
      [
        { label: '  ', labelKey: '' },
        { label: 'Home', link: '/portal' },
        { labelKey: 'nav.ask', link: '/portal/hoi-dap' },
        { label: '   ' },
      ],
      '/portal/hoi-dap',
      (k) => (k === 'nav.ask' ? 'Gửi câu hỏi' : k),
    );
    expect(view.map((v) => v.label)).toEqual(['Home', 'Gửi câu hỏi']);
    expect(view[0].clickable).toBe(true);
    expect(view[0].current).toBe(false);
    expect(view[1].clickable).toBe(false);
    expect(view[1].current).toBe(true);
  });

  it('treats middle items without link as non-clickable spans', () => {
    const view = buildBreadcrumbView(
      [
        { label: 'Root', link: '/portal' },
        { label: 'Section' },
        { label: 'Page', link: '/portal/x' },
      ],
      '/portal/x',
      (k) => k,
    );
    expect(view[1].clickable).toBe(false);
    expect(view[1].current).toBe(false);
    expect(view[2].current).toBe(true);
  });
});

describe('MofBreadcrumbComponent', () => {
  async function setup(url: string, items?: readonly MofBreadcrumbItem[]) {
    TestBed.configureTestingModule({
      providers: [
        provideRouter([
          { path: 'portal', component: HostPage },
          { path: 'portal/hoi-dap', component: HostPage },
        ]),
      ],
    });
    const h = await RouterTestingHarness.create(url);
    const host = h.routeDebugElement!.componentInstance as HostPage;
    if (items !== undefined) {
      host.items.set(items);
      h.detectChanges();
    }
    return { h, host, router: TestBed.inject(Router), el: h.routeNativeElement as HTMLElement };
  }

  it('marks the matching crumb as current after initial load (refresh)', async () => {
    const { el } = await setup('/portal/hoi-dap');
    expect(el.querySelector('[aria-current="page"]')?.textContent?.trim()).toBe('Hỏi đáp');
    expect(el.querySelector('a[href="/portal"]')?.textContent?.trim()).toBe('Portal');
    expect(el.querySelector('a[href="/portal/hoi-dap"]')).toBeNull();
  });

  it('updates current after navigating between pages', async () => {
    // Fixture ổn định (không bị destroy theo route) để kiểm tra navTick + router.url.
    TestBed.configureTestingModule({
      imports: [MofBreadcrumbComponent],
      providers: [
        provideRouter([
          { path: 'portal', component: HostPage },
          { path: 'portal/hoi-dap', component: HostPage },
        ]),
      ],
    });
    const router = TestBed.inject(Router);
    await router.navigateByUrl('/portal');
    const f = TestBed.createComponent(MofBreadcrumbComponent);
    f.componentRef.setInput('items', [
      { label: 'Portal', link: '/portal' },
      { label: 'Hỏi đáp', link: '/portal/hoi-dap' },
    ]);
    f.detectChanges();
    expect(f.nativeElement.querySelector('[aria-current="page"]')?.textContent?.trim()).toBe('Portal');

    await router.navigateByUrl('/portal/hoi-dap');
    f.detectChanges();
    expect(router.url.split('?')[0]).toBe('/portal/hoi-dap');
    expect(f.nativeElement.querySelector('[aria-current="page"]')?.textContent?.trim()).toBe('Hỏi đáp');
    expect(f.nativeElement.querySelector('a[href="/portal"]')).toBeTruthy();
  });

  it('exposes ancestor crumbs as router links (back navigation)', async () => {
    const { el } = await setup('/portal/hoi-dap');
    const link = el.querySelector<HTMLAnchorElement>('a[href="/portal"]');
    expect(link).toBeTruthy();
    expect(link!.textContent?.trim()).toBe('Portal');
    expect(el.querySelector('a[href="/portal/hoi-dap"]')).toBeNull();
  });

  it('renders nothing for empty / all-invalid items', async () => {
    const { h, host, el } = await setup('/portal', []);
    expect(el.querySelector('nav.mof-bc')).toBeNull();
    host.items.set([{ label: '  ' }, { labelKey: '' }]);
    h.detectChanges();
    expect(el.querySelector('nav.mof-bc')).toBeNull();
  });

  it('honours explicit current even when URL matches a deeper item', async () => {
    const { el } = await setup('/portal/hoi-dap', [
      { label: 'Portal', link: '/portal', current: true },
      { label: 'Hỏi đáp', link: '/portal/hoi-dap' },
    ]);
    expect(el.querySelector('[aria-current="page"]')?.textContent?.trim()).toBe('Portal');
    expect(el.querySelector('a[href="/portal"]')).toBeNull();
  });

  it('falls back to last crumb when URL matches none', async () => {
    const { el } = await setup('/portal', [
      { label: 'A', link: '/zzz' },
      { label: 'B', link: '/yyy' },
      { label: 'C' },
    ]);
    expect(el.querySelector('[aria-current="page"]')?.textContent?.trim()).toBe('C');
  });
});
