import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from './auth.service';

export const internalGuard: CanActivateFn = () => {
  const auth = inject(AuthService); const router = inject(Router);
  return auth.isInternal() || router.createUrlTree(['/workspace/login']);
};

export const adminGuard: CanActivateFn = () => {
  const auth = inject(AuthService); const router = inject(Router);
  return auth.user()?.role === 'system-admin' || router.createUrlTree(['/workspace/login'], { queryParams: { required: 'system-admin' } });
};
