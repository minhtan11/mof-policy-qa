import { Routes } from '@angular/router';
import { adminGuard, internalGuard } from './core/auth/auth.guards';
import { WS_SOON_PAGES } from './core/workspace/workspace-nav';

export const routes: Routes = [
  { path: '', pathMatch: 'full', redirectTo: 'portal' },
  { path: 'portal', loadComponent: () => import('./features/portal/portal-home/portal-home.component').then((m) => m.PortalHomeComponent) },
  { path: 'portal/login', loadComponent: () => import('./features/portal/public-login/public-login.component').then((m) => m.PublicLoginComponent) },
  { path: 'portal/hoi-dap', loadComponent: () => import('./features/portal/ask-question/ask-question.component').then((m) => m.AskQuestionComponent) },
  { path: 'portal/cau-hoi-cua-toi', loadComponent: () => import('./features/portal/my-questions/my-questions.component').then((m) => m.MyQuestionsComponent) },
  { path: 'portal/ho-so/:code', loadComponent: () => import('./features/portal/public-dossier-detail/public-dossier-detail.component').then((m) => m.PublicDossierDetailComponent) },
  { path: 'portal/tra-cuu', loadComponent: () => import('./features/portal/lookup/lookup.component').then((m) => m.LookupComponent) },
  { path: 'portal/huong-dan', loadComponent: () => import('./features/portal/guide/guide.component').then((m) => m.GuideComponent) },
  { path: 'portal/van-ban', loadComponent: () => import('./features/portal/public-legal/public-legal.component').then((m) => m.PublicLegalComponent) },

  { path: 'workspace/login', loadComponent: () => import('./features/auth/internal-login/internal-login.component').then((m) => m.InternalLoginComponent) },
  { path: 'workspace', canActivate: [internalGuard], loadComponent: () => import('./features/workspace/workspace/workspace.component').then((m) => m.WorkspaceComponent) },
  { path: 'workspace/tra-cuu', canActivate: [internalGuard], loadComponent: () => import('./features/workspace/internal-search/internal-search.component').then((m) => m.InternalSearchComponent) },
  { path: 'workspace/ho-so/:id', canActivate: [internalGuard], loadComponent: () => import('./features/workspace/dossier-detail/dossier-detail.component').then((m) => m.DossierDetailComponent) },
  {
    path: 'workspace/ho-so-cua-toi',
    canActivate: [internalGuard],
    loadComponent: () => import('./features/workspace/my-dossiers/my-dossiers.component').then((m) => m.MyDossiersComponent),
  },
  {
    path: 'workspace/ho-so-noi-bo',
    canActivate: [internalGuard],
    loadComponent: () =>
      import('./features/workspace/internal-dossiers/internal-dossiers.component').then((m) => m.InternalDossiersComponent),
  },
  {
    path: 'workspace/ho-so-phoi-hop',
    canActivate: [internalGuard],
    loadComponent: () =>
      import('./features/workspace/coop-dossiers/coop-dossiers.component').then((m) => m.CoopDossiersComponent),
  },
  {
    path: 'workspace/bao-cao-thong-ke',
    canActivate: [internalGuard],
    loadComponent: () =>
      import('./features/workspace/reports/reports.component').then((m) => m.WorkspaceReportsComponent),
  },
  {
    path: 'workspace/lich-lam-viec',
    canActivate: [internalGuard],
    loadComponent: () =>
      import('./features/workspace/calendar/calendar.component').then((m) => m.WorkspaceCalendarComponent),
  },
  {
    path: 'workspace/van-ban-den',
    canActivate: [internalGuard],
    loadComponent: () =>
      import('./features/workspace/incoming-docs/incoming-docs.component').then((m) => m.IncomingDocsComponent),
  },
  {
    path: 'workspace/van-ban-di',
    canActivate: [internalGuard],
    loadComponent: () =>
      import('./features/workspace/outgoing-docs/outgoing-docs.component').then((m) => m.OutgoingDocsComponent),
  },
  {
    path: 'workspace/tai-lieu-noi-bo',
    canActivate: [internalGuard],
    loadComponent: () =>
      import('./features/workspace/internal-docs/internal-docs.component').then((m) => m.InternalDocsComponent),
  },
  {
    path: 'workspace/kho-du-lieu',
    canActivate: [internalGuard],
    loadComponent: () =>
      import('./features/workspace/data-store/data-store.component').then((m) => m.DataStoreComponent),
  },
  {
    path: 'workspace/ho-so-ca-nhan',
    canActivate: [internalGuard],
    loadComponent: () =>
      import('./features/workspace/officer-profile/officer-profile.component').then((m) => m.OfficerProfileComponent),
  },
  // G5: WS_SOON_PAGES rỗng — giữ spread để không gãy nếu bổ sung tạm.
  ...WS_SOON_PAGES.map((p) => ({
    path: p.path,
    canActivate: [internalGuard],
    loadComponent: () => import('./features/portal/coming-soon/coming-soon.component').then((m) => m.ComingSoonComponent),
    data: { titleKey: p.titleKey, icon: p.icon, bodyKey: p.bodyKey, shell: 'workspace' },
  })),
  { path: 'admin', canActivate: [adminGuard], loadComponent: () => import('./features/admin/admin/admin.component').then((m) => m.AdminComponent) },
  { path: '**', redirectTo: 'portal' },
];
