import { Injectable, computed, inject, signal } from '@angular/core';
import { PortalUser, UserRole } from '../models/domain.models';
import { USERS } from '../mock-api/demo-data';
import { CredentialsAuthAdapter } from './credentials-auth.adapter';

export const SESSION_KEY = 'mof-policy-qa.session.v1';

/**
 * Phiên đăng nhập demo. "Ghi nhớ" = localStorage (giữ qua lần mở trình duyệt), không ghi nhớ = sessionStorage.
 * Khôi phục từ một trong hai; đăng xuất xóa cả hai.
 */
@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly credentials = inject(CredentialsAuthAdapter);
  private readonly currentUserSignal = signal<PortalUser | null>(this.restore());
  readonly user = this.currentUserSignal.asReadonly();
  readonly isInternal = computed(() => !!this.user() && this.user()!.role !== 'public');

  loginAs(role: UserRole, remember = true): PortalUser {
    return this.persist(USERS.find((item) => item.role === role) ?? USERS[0], remember);
  }

  /** Đăng nhập theo id user trong fixture (dùng cho adapter VNeID mock). */
  loginById(id: string, remember = true): PortalUser {
    return this.persist(USERS.find((item) => item.id === id) ?? USERS[0], remember);
  }

  /** Đăng nhập bằng username/email + mật khẩu qua `CredentialsAuthAdapter`. Sai → null, không đổi phiên. */
  loginWithCredentials(identifier: string, password: string, remember = true): PortalUser | null {
    const user = this.credentials.verify(identifier, password);
    return user ? this.persist(user, remember) : null;
  }

  /**
   * Đăng nhập cán bộ: chỉ tài khoản nội bộ. Trả user (đã lưu phiên), 'denied' nếu đúng mật khẩu nhưng là
   * tài khoản công dân (KHÔNG lưu phiên), null nếu sai tên/mật khẩu.
   */
  loginInternal(identifier: string, password: string, remember = true): PortalUser | 'denied' | null {
    const user = this.credentials.verify(identifier, password);
    if (!user) {
      return null;
    }
    return user.role === 'public' ? 'denied' : this.persist(user, remember);
  }

  /** Trang đích sau đăng nhập theo vai trò (khớp guard: /workspace = nội bộ, /admin = system-admin). */
  landingFor(user: PortalUser): string {
    if (user.role === 'public') {
      return '/portal/hoi-dap';
    }
    return user.role === 'system-admin' ? '/admin' : '/workspace';
  }

  logout(): void {
    this.currentUserSignal.set(null);
    localStorage.removeItem(SESSION_KEY);
    sessionStorage.removeItem(SESSION_KEY);
  }

  hasAnyRole(roles: UserRole[]): boolean {
    return !!this.user() && roles.includes(this.user()!.role);
  }

  private persist(user: PortalUser, remember: boolean): PortalUser {
    this.currentUserSignal.set(user);
    const json = JSON.stringify(user);
    if (remember) {
      localStorage.setItem(SESSION_KEY, json);
      sessionStorage.removeItem(SESSION_KEY);
    } else {
      sessionStorage.setItem(SESSION_KEY, json);
      localStorage.removeItem(SESSION_KEY);
    }
    return user;
  }

  private restore(): PortalUser | null {
    const raw = localStorage.getItem(SESSION_KEY) ?? sessionStorage.getItem(SESSION_KEY);
    try {
      return raw ? (JSON.parse(raw) as PortalUser) : null;
    } catch {
      return null;
    }
  }
}
