import { TestBed } from '@angular/core/testing';
import { Component } from '@angular/core';
import { Router, provideRouter } from '@angular/router';
import { WorkspaceSidebarComponent } from './workspace-sidebar.component';
import { AuthService } from '../../../../core/auth/auth.service';
import { DEMO_DEFAULT_PASSWORD } from '../../../../core/mock-api/auth-credentials';
import { MockDbService } from '../../../../core/mock-api/mock-db.service';
import { scopeFor, tabCounts } from '../../../../core/mock-api/workspace-overview.repository';
import { WorkspaceShellState } from '../../../../core/workspace/workspace-shell.state';

@Component({ template: '' })
class Blank {}

/** Round 29 — sidebar workspace: rail/mở rộng lưu localStorage, gập nhóm lưu, flyout (core overlay), lọc theo vai trò. */
describe('WorkspaceSidebarComponent', () => {
  afterEach(() => {
    vi.useRealTimers();
    localStorage.clear();
    document.querySelectorAll('#ws-flyout').forEach((e) => e.remove());
  });

  async function setup(user = 'ha.tt', url = '/workspace', pre: Record<string, string> = {}) {
    vi.useFakeTimers();
    localStorage.clear();
    for (const [k, v] of Object.entries(pre)) localStorage.setItem(k, v);
    TestBed.configureTestingModule({
      imports: [WorkspaceSidebarComponent],
      providers: [
        provideRouter([
          { path: 'workspace', component: Blank },
          { path: 'workspace/tra-cuu', component: Blank },
          { path: 'workspace/ho-so/:id', component: Blank },
          { path: 'admin', component: Blank },
          { path: 'portal', component: Blank },
          { path: 'portal/tra-cuu', component: Blank },
        ]),
      ],
    });
    TestBed.inject(AuthService).loginWithCredentials(user, DEMO_DEFAULT_PASSWORD, false);
    const router = TestBed.inject(Router);
    await router.navigateByUrl(url);
    const f = TestBed.createComponent(WorkspaceSidebarComponent);
    f.detectChanges();
    const flush = async () => {
      await vi.runAllTimersAsync();
      f.detectChanges();
    };
    await flush();
    const el = f.nativeElement as HTMLElement;
    return { f, el, cmp: f.componentInstance, router, flush, state: TestBed.inject(WorkspaceShellState) };
  }

  const titles = (el: HTMLElement) => Array.from(el.querySelectorAll('.g-title')).map((e) => e.textContent!.trim());

  it('shows only role-permitted groups (reception: no admin groups; admin: Hệ thống + Văn bản)', async () => {
    const a = await setup('ha.tt');
    expect(titles(a.el)).toEqual(['Hồ sơ – Công việc', 'Tra cứu – Tiện ích', 'Văn bản – Tài liệu']);
    expect(a.el.querySelector('a[href^="/admin"]')).toBeNull();
    TestBed.resetTestingModule();
    const b = await setup('admin', '/admin?tab=users');
    expect(titles(b.el)).toContain('Hệ thống');
    expect(titles(b.el)).toContain('Văn bản – Tài liệu');
    expect(b.el.querySelector('.item.active')?.textContent).toContain('Người dùng');
  });

  it('shows coming-soon items (with a Sắp có tag) linking to their own coming-soon routes', async () => {
    const { el } = await setup('ha.tt');
    const soon = [...el.querySelectorAll('a.item')].filter((a) => a.querySelector('.soon-tag'));
    const hrefs = soon.map((a) => a.getAttribute('href'));
    expect(hrefs).toEqual(expect.arrayContaining(['/workspace/ho-so-cua-toi', '/workspace/lich-lam-viec', '/workspace/van-ban-den', '/workspace/van-ban-di', '/workspace/tai-lieu-noi-bo']));
    expect(soon[0].querySelector('.soon-tag')?.textContent).toContain('Sắp có');
    // Mục có màn thật thì không gắn tag
    expect(el.querySelector('a.item[href="/workspace/tra-cuu"] .soon-tag')).toBeNull();
  });

  it('counts queue badges with the signed-in role scope and the overview tab groups', async () => {
    const specialist = await setup('hung.lq');
    const db = TestBed.inject(MockDbService);
    const auth = TestBed.inject(AuthService);
    const tabs = tabCounts(scopeFor(db.dossiers(), auth.user()));
    expect(specialist.cmp.counts()).toEqual({
      all: tabs.all,
      new: tabs.new,
      processing: tabs.processing,
      'waiting-approval': tabs['waiting-approval'],
    });
    expect(tabs.all).toBe(tabs.new + tabs.processing + tabs['waiting-approval']);
    TestBed.resetTestingModule();
    const coord = await setup('ngoc.db');
    const wide = tabCounts(scopeFor(TestBed.inject(MockDbService).dossiers(), TestBed.inject(AuthService).user()));
    expect(wide.all).toBeGreaterThan(tabs.all);
    expect(coord.cmp.counts().all).toBe(wide.all);
  });

  it('marks the active item from path + query and shows repository badge counts', async () => {
    const { el, router, flush } = await setup('ha.tt', '/workspace?filter=new');
    expect(el.querySelector('.item.active')?.textContent).toContain('Mới tiếp nhận');
    expect(el.querySelector('.home')?.classList.contains('active')).toBe(false);
    expect(el.querySelector('.item.active .badge')?.textContent?.trim()).toMatch(/^\d+$/);
    await router.navigateByUrl('/workspace/ho-so/d-001');
    await flush();
    expect(el.querySelector('.item.active')?.textContent).toContain('Hàng đợi xử lý');
  });

  it('persists the collapsed (rail) mode', async () => {
    const { el, f, state } = await setup();
    // Nút đóng/mở nằm ở header shell (☰), sidebar chỉ phản ánh state.
    state.toggleCollapsed();
    f.detectChanges();
    expect(state.collapsed()).toBe(true);
    expect(localStorage.getItem('mof.ws.sidebar.collapsed')).toBe('1');
    expect(el.classList.contains('rail') || f.debugElement.nativeElement.classList.contains('rail')).toBe(true);
    expect(el.querySelector('.g-title')).toBeNull();
    const saved = localStorage.getItem('mof.ws.sidebar.collapsed')!;
    TestBed.resetTestingModule();
    const again = await setup('ha.tt', '/workspace', { 'mof.ws.sidebar.collapsed': saved });
    expect(again.state.collapsed()).toBe(true);
    expect(again.el.querySelectorAll('.rail-btn').length).toBeGreaterThan(0);
  });

  it('persists group open state and auto-opens the active group', async () => {
    const { el, f, state } = await setup('ha.tt', '/workspace/tra-cuu');
    const toggle = el.querySelectorAll<HTMLButtonElement>('.g-toggle')[0];
    expect(toggle.getAttribute('aria-expanded')).toBe('true');
    toggle.click();
    f.detectChanges();
    expect(toggle.getAttribute('aria-expanded')).toBe('false');
    expect(el.querySelector('#ws-gb-dossiers')?.hasAttribute('inert')).toBe(true);
    expect(JSON.parse(localStorage.getItem('mof.ws.sidebar.groups')!)).toMatchObject({ dossiers: false });
    // Nhóm chứa route hiện tại (Công việc) luôn được mở + lưu
    expect(state.isGroupOpen('work')).toBe(true);
    TestBed.resetTestingModule();
    localStorage.setItem('mof.ws.sidebar.groups', JSON.stringify({ dossiers: false, work: false }));
    vi.useFakeTimers();
    TestBed.configureTestingModule({ imports: [WorkspaceSidebarComponent], providers: [provideRouter([{ path: 'workspace/tra-cuu', component: Blank }])] });
    TestBed.inject(AuthService).loginWithCredentials('ha.tt', DEMO_DEFAULT_PASSWORD, false);
    await TestBed.inject(Router).navigateByUrl('/workspace/tra-cuu');
    const f2 = TestBed.createComponent(WorkspaceSidebarComponent);
    f2.detectChanges();
    await vi.runAllTimersAsync();
    f2.detectChanges();
    const st = TestBed.inject(WorkspaceShellState);
    expect(st.isGroupOpen('dossiers')).toBe(false);
    expect(st.isGroupOpen('work')).toBe(true);
  });

  it('rail: clicking a group icon opens a flyout menu (portal via core overlay), Esc closes and restores focus', async () => {
    const { el, f, flush, cmp } = await setup('ha.tt', '/workspace', { 'mof.ws.sidebar.collapsed': '1' });
    const btn = el.querySelector<HTMLButtonElement>('.rail-btn')!;
    btn.click();
    f.detectChanges();
    await flush();
    const fly = document.getElementById('ws-flyout')!;
    expect(fly).not.toBeNull();
    expect(fly.parentElement).toBe(document.body);
    expect(fly.dataset['strategy']).toBe('portal');
    expect(btn.getAttribute('aria-expanded')).toBe('true');
    expect(fly.querySelectorAll('a[role="menuitem"]').length).toBe(3);
    expect(fly.querySelectorAll('.soon-tag').length).toBe(1);
    fly.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }));
    f.detectChanges();
    expect(cmp.flyout()).toBeNull();
    expect(document.getElementById('ws-flyout')).toBeNull();
    expect(document.activeElement).toBe(btn);
  });

  it('rail: tooltips carry each icon label', async () => {
    const { el, f } = await setup('ha.tt', '/workspace', { 'mof.ws.sidebar.collapsed': '1' });
    el.querySelector('.rail-btn')!.dispatchEvent(new MouseEvent('mouseenter'));
    f.detectChanges();
    expect(el.querySelector('.tip')?.textContent).toBe('Hồ sơ – Công việc');
    expect(el.querySelector('.rail-btn')?.getAttribute('aria-label')).toBe('Hồ sơ – Công việc');
  });
});
