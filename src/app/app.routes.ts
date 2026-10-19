import { Routes } from '@angular/router';
import { adminGuard, internalGuard } from './core/auth/auth.guards';

export const routes: Routes = [
  { path: '', pathMatch: 'full', redirectTo: 'portal' },
  { path: 'portal', loadComponent: () => import('./features/portal/portal-home/portal-home.component').then((m) => m.PortalHomeComponent) },
  { path: 'portal/login', loadComponent: () => import('./features/portal/public-login.component').then((m) => m.PublicLoginComponent) },
  { path: 'portal/login/vneid', loadComponent: () => import('./features/portal/vneid-login.component').then((m) => m.VneidLoginComponent) },
  { path: 'portal/hoi-dap', loadComponent: () => import('./features/portal/ask-question.component').then((m) => m.AskQuestionComponent) },
  { path: 'portal/tra-cuu', loadComponent: () => import('./features/portal/lookup.component').then((m) => m.LookupComponent) },
  { path: 'workspace/login', loadComponent: () => import('./features/auth/internal-login/internal-login.component').then((m) => m.InternalLoginComponent) },
  { path: 'workspace', canActivate: [internalGuard], loadComponent: () => import('./features/workspace/workspace.component').then((m) => m.WorkspaceComponent) },
  { path: 'workspace/ho-so/:id', canActivate: [internalGuard], loadComponent: () => import('./features/workspace/dossier-detail/dossier-detail.component').then((m) => m.DossierDetailComponent) },
  { path: 'admin', canActivate: [adminGuard], loadComponent: () => import('./features/admin/admin/admin.component').then((m) => m.AdminComponent) },
  { path: '**', redirectTo: 'portal' },
];
