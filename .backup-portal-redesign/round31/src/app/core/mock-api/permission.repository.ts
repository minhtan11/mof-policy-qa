import { Injectable } from '@angular/core';
import { ROLE_PERMISSIONS } from './domain-fixtures';
import { RolePermissionRow, UserRole } from '../models/domain.models';

/** UC-031..UC-040 — ma trận quyền / scope (hiển thị + kiểm tra mock) */
@Injectable({ providedIn: 'root' })
export class PermissionRepository {
  readonly matrix: RolePermissionRow[] = structuredClone(ROLE_PERMISSIONS);

  forRole(role: UserRole): RolePermissionRow | undefined {
    if (role === 'public') {
      return undefined;
    }
    return this.matrix.find((row) => row.role === role);
  }

  hasPermission(role: UserRole, permission: string): boolean {
    const row = this.forRole(role);
    if (!row) {
      return false;
    }
    return row.permissions.some(
      (item) => item === permission || (item.endsWith('.*') && permission.startsWith(item.slice(0, -1))),
    );
  }
}
