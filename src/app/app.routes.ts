import { Routes } from '@angular/router';
import { adminGuard, internalGuard } from './core/auth/auth.guards';
import { WS_SOON_PAGES } from './core/workspace/workspace-nav';

export const routes: Routes = [
  { path: '', pathMatch: 'full', redirectTo: 'portal' },
  { path: 'portal', loadComponent: () => import('./features/portal/portal-home/portal-home.component').then((m) => m.PortalHomeComponent) },
  { path: 'portal/login', loadComponent: () => import('./features/portal/public-login/public-login.component').then((m) => m.PublicLoginComponent) },
  { path: 'portal/login/vneid', loadComponent: () => import('./features/portal/vneid-login/vneid-login.component').then((m) => m.VneidLoginComponent) },
  { path: 'portal/hoi-dap', loadComponent: () => import('./features/portal/ask-question/ask-question.component').then((m) => m.AskQuestionComponent) },
  { path: 'portal/cau-hoi-cua-toi', loadComponent: () => import('./features/portal/my-questions/my-questions.component').then((m) => m.MyQuestionsComponent) },
  { path: 'portal/ho-so/:code', loadComponent: () => import('./features/portal/public-dossier-detail/public-dossier-detail.component').then((m) => m.PublicDossierDetailComponent) },
  { path: 'portal/tra-cuu', loadComponent: () => import('./features/portal/lookup/lookup.component').then((m) => m.LookupComponent) },
  {
    path: 'portal/huong-dan',
    loadComponent: () => import('./features/portal/coming-soon/coming-soon.component').then((m) => m.ComingSoonComponent),
    data: { titleKey: 'nav.guide', bodyKey: 'comingSoon.guideBody' },
  },
  {
    path: 'portal/van-ban',
    loadComponent: () => import('./features/portal/coming-soon/coming-soon.component').then((m) => m.ComingSoonComponent),
    data: { titleKey: 'portal.nav.legal', bodyKey: 'comingSoon.legalBody' },
  },

  { path: 'workspace/login', loadComponent: () => import('./features/auth/internal-login/internal-login.component').then((m) => m.InternalLoginComponent) },
  { path: 'workspace', canActivate: [internalGuard], loadComponent: () => import('./features/workspace/workspace/workspace.component').then((m) => m.WorkspaceComponent) },
  { path: 'workspace/tra-cuu', canActivate: [internalGuard], loadComponent: () => import('./features/workspace/internal-search/internal-search.component').then((m) => m.InternalSearchComponent) },
  { path: 'workspace/ho-so/:id', canActivate: [internalGuard], loadComponent: () => import('./features/workspace/dossier-detail/dossier-detail.component').then((m) => m.DossierDetailComponent) },
  // Mục sidebar chưa có màn: mỗi mục 1 path riêng → trang Sắp ra mắt (khung workspace).
  ...WS_SOON_PAGES.map((p) => ({
    path: p.path,
    canActivate: [internalGuard],
    loadComponent: () => import('./features/portal/coming-soon/coming-soon.component').then((m) => m.ComingSoonComponent),
    data: { titleKey: p.titleKey, icon: p.icon, bodyKey: p.bodyKey, shell: 'workspace' },
  })),
  { path: 'admin', canActivate: [adminGuard], loadComponent: () => import('./features/admin/admin/admin.component').then((m) => m.AdminComponent) },
  { path: '**', redirectTo: 'portal' },
];
