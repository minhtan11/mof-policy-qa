import { Injectable, computed, signal } from '@angular/core';
import { PortalUser, UserRole } from '../models/domain.models';
import { USERS } from '../mock-api/demo-data';

const SESSION_KEY = 'mof-policy-qa.session.v1';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly currentUserSignal = signal<PortalUser | null>(this.restore());
  readonly user = this.currentUserSignal.asReadonly();
  readonly isInternal = computed(() => !!this.user() && this.user()!.role !== 'public');

  loginAs(role: UserRole): PortalUser {
    const user = USERS.find((item) => item.role === role) ?? USERS[0];
    this.currentUserSignal.set(user);
    localStorage.setItem(SESSION_KEY, JSON.stringify(user));
    return user;
  }

  logout(): void { this.currentUserSignal.set(null); localStorage.removeItem(SESSION_KEY); }
  hasAnyRole(roles: UserRole[]): boolean { return !!this.user() && roles.includes(this.user()!.role); }
  private restore(): PortalUser | null { const raw = localStorage.getItem(SESSION_KEY); return raw ? JSON.parse(raw) as PortalUser : null; }
}
