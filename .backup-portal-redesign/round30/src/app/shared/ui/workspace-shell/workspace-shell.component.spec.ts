import { Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { Router, provideRouter } from '@angular/router';
import { WorkspaceShellComponent } from './workspace-shell.component';
import { AuthService } from '../../../core/auth/auth.service';
import { DEMO_DEFAULT_PASSWORD } from '../../../core/mock-api/auth-credentials';
import { WorkspaceShellState } from '../../../core/workspace/workspace-shell.state';

@Component({ imports: [WorkspaceShellComponent], template: '<app-workspace-shell title="Tổng quan"><p class="page">nội dung</p></app-workspace-shell>' })
class Host {}

/** Round 29 — khung workspace: header 1 hàng, nút menu (rail ↔ mở rộng / drawer mobile), drawer a11y. */
describe('WorkspaceShellComponent', () => {
  const realMM = window.matchMedia;
  afterEach(() => {
    window.matchMedia = realMM;
    vi.useRealTimers();
    localStorage.clear();
    document.documentElement.classList.remove('mof-scroll-lock');
  });

  async function setup(mobile: boolean) {
    window.matchMedia = ((q: string) => ({
      matches: mobile && q.includes('max-width'),
      media: q,
      addEventListener: () => {},
      removeEventListener: () => {},
    })) as unknown as typeof window.matchMedia;
    vi.useFakeTimers();
    localStorage.clear();
    TestBed.configureTestingModule({ imports: [Host], providers: [provideRouter([{ path: 'workspace', component: Host }])] });
    TestBed.inject(AuthService).loginWithCredentials('ha.tt', DEMO_DEFAULT_PASSWORD, false);
    await TestBed.inject(Router).navigateByUrl('/workspace');
    const f = TestBed.createComponent(Host);
    f.detectChanges();
    await vi.runAllTimersAsync();
    f.detectChanges();
    const el = f.nativeElement as HTMLElement;
    return { f, el, state: TestBed.inject(WorkspaceShellState) };
  }

  it('renders header pieces + projected content; user pill shows name and role', async () => {
    const { el } = await setup(false);
    expect(el.querySelector('.ws-header .pill-trigger kbd')?.textContent).toContain('Ctrl K');
    expect(el.querySelector('app-header-notifications')).not.toBeNull();
    expect(el.querySelector('app-lang-switch')).not.toBeNull();
    expect(el.querySelector('.user-btn .who')?.textContent).toContain('Trần Thu Hà');
    expect(el.querySelector('.user-btn .who')?.textContent).toContain('Cán bộ tiếp nhận');
    expect(el.querySelector('main#ws-main .page')).not.toBeNull();
    expect(el.querySelector('h1')?.textContent).toBe('Tổng quan');
  });

  it('desktop: the header menu button toggles rail mode (persisted)', async () => {
    const { el, f, state } = await setup(false);
    (el.querySelector('.menu-btn') as HTMLButtonElement).click();
    f.detectChanges();
    expect(state.collapsed()).toBe(true);
    expect(el.querySelector('.shell')?.classList.contains('rail')).toBe(true);
    expect(localStorage.getItem('mof.ws.sidebar.collapsed')).toBe('1');
    expect(state.drawerOpen()).toBe(false);
  });

  it('mobile: opens an off-canvas drawer (dialog, scroll lock, focus close), Esc closes and restores focus', async () => {
    const { el, f, state } = await setup(true);
    const side = el.querySelector('app-workspace-sidebar')!;
    expect(side.hasAttribute('inert')).toBe(true);
    const btn = el.querySelector('.menu-btn') as HTMLButtonElement;
    btn.click();
    f.detectChanges();
    await vi.runAllTimersAsync();
    f.detectChanges();
    expect(state.drawerOpen()).toBe(true);
    expect(state.collapsed()).toBe(false);
    expect(el.querySelector('.side-root')?.classList.contains('open')).toBe(true);
    expect(side.getAttribute('role')).toBe('dialog');
    expect(side.getAttribute('aria-modal')).toBe('true');
    expect(side.hasAttribute('inert')).toBe(false);
    expect(document.documentElement.classList.contains('mof-scroll-lock')).toBe(true);
    expect(document.activeElement?.hasAttribute('data-drawer-close')).toBe(true);
    // Drawer luôn ở chế độ mở rộng (không rail)
    expect(side.classList.contains('rail')).toBe(false);
    el.querySelector('.side-root')!.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }));
    f.detectChanges();
    expect(state.drawerOpen()).toBe(false);
    expect(document.documentElement.classList.contains('mof-scroll-lock')).toBe(false);
    expect(document.activeElement).toBe(btn);
  });
});
