import { Injectable, inject } from '@angular/core';
import { PortalUser } from '../models/domain.models';
import { USERS } from '../mock-api/demo-data';
import { DEMO_CREDENTIALS, DEMO_LOGIN_PREFILL_USER_ID } from '../mock-api/auth-credentials';

/**
 * Cổng xác thực tên đăng nhập/mật khẩu. UI + AuthService chỉ phụ thuộc lớp trừu tượng; mặc định là mock.
 * Backend thật: gọi API đăng nhập, trả user hoặc null.
 */
@Injectable({ providedIn: 'root', useFactory: () => inject(MockCredentialsAuthAdapter) })
export abstract class CredentialsAuthAdapter {
  /** Trả user khớp (username hoặc email, không phân biệt hoa thường) + đúng mật khẩu; ngược lại null. */
  abstract verify(identifier: string, password: string): PortalUser | null;
  /** Giá trị điền sẵn cho form (demo). Bản thật trả null. */
  abstract prefill(userId?: string): { identifier: string; password: string } | null;
}

@Injectable({ providedIn: 'root' })
export class MockCredentialsAuthAdapter extends CredentialsAuthAdapter {
  verify(identifier: string, password: string): PortalUser | null {
    const id = identifier.trim().toLowerCase();
    if (!id) {
      return null;
    }
    const user = USERS.find((u) => u.email.toLowerCase() === id || u.username?.toLowerCase() === id);
    return user && DEMO_CREDENTIALS[user.id] === password ? user : null;
  }

  prefill(userId = DEMO_LOGIN_PREFILL_USER_ID): { identifier: string; password: string } | null {
    const user = USERS.find((u) => u.id === userId);
    return user ? { identifier: user.username ?? user.email, password: DEMO_CREDENTIALS[user.id] ?? '' } : null;
  }
}
