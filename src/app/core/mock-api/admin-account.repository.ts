import { Injectable, signal } from '@angular/core';
import { ADMIN_ACCOUNTS } from './domain-fixtures';
import { AdminAccount, UserRole } from '../models/domain.models';

/** UC-018..UC-030 — tài khoản nội bộ mock (không hiện mật khẩu) */
@Injectable({ providedIn: 'root' })
export class AdminAccountRepository {
  readonly accounts = signal<AdminAccount[]>(structuredClone(ADMIN_ACCOUNTS));

  toggleActive(id: string): boolean {
    const target = this.accounts().find((item) => item.id === id);
    if (!target) {
      return false;
    }
    this.accounts.update((items) =>
      items.map((item) => (item.id === id ? { ...item, active: !item.active } : item)),
    );
    return true;
  }

  setRole(id: string, role: Exclude<UserRole, 'public'>): boolean {
    if (!this.accounts().some((item) => item.id === id)) {
      return false;
    }
    this.accounts.update((items) => items.map((item) => (item.id === id ? { ...item, role } : item)));
    return true;
  }

  setOrganization(id: string, organizationId: string): boolean {
    if (!this.accounts().some((item) => item.id === id)) {
      return false;
    }
    this.accounts.update((items) =>
      items.map((item) => (item.id === id ? { ...item, organizationId } : item)),
    );
    return true;
  }

  /** Che email trên UI/log — chỉ hiện phần đầu + domain. */
  maskEmail(email: string): string {
    const [local, domain] = email.split('@');
    if (!local || !domain) {
      return '***';
    }
    const head = local.slice(0, Math.min(2, local.length));
    return `${head}***@${domain}`;
  }
}
