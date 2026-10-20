import { Injectable, signal } from '@angular/core';
import { INTEGRATION_CHANNELS } from './integration-fixtures';
import { IntegrationChannel, IntegrationStatus } from '../models/domain.models';

export interface IntegrationTestResult {
  ok: boolean;
  status: IntegrationStatus;
  checkedAt: string;
}

/** UC-052..UC-059 — cấu hình tích hợp mock (không gọi API thật) */
@Injectable({ providedIn: 'root' })
export class IntegrationRepository {
  readonly channels = signal<IntegrationChannel[]>(structuredClone(INTEGRATION_CHANNELS));

  toggle(id: string): boolean {
    const target = this.channels().find((item) => item.id === id);
    if (!target) {
      return false;
    }
    this.channels.update((items) =>
      items.map((item) => {
        if (item.id !== id) {
          return item;
        }
        const enabled = !item.enabled;
        return {
          ...item,
          enabled,
          status: enabled ? (item.status === 'disconnected' ? 'mock' : item.status) : 'disconnected',
          lastCheckedAt: new Date().toISOString(),
        };
      }),
    );
    return true;
  }

  /** Mô phỏng kiểm tra kết nối — luôn cục bộ, không HTTP. */
  testConnection(id: string): IntegrationTestResult | null {
    const target = this.channels().find((item) => item.id === id);
    if (!target) {
      return null;
    }
    const checkedAt = new Date().toISOString();
    const status: IntegrationStatus = !target.enabled
      ? 'disconnected'
      : target.kind === 'vbpq'
        ? 'degraded'
        : target.kind === 'vneid-sso'
          ? 'mock'
          : 'connected';
    this.channels.update((items) =>
      items.map((item) => (item.id === id ? { ...item, status, lastCheckedAt: checkedAt } : item)),
    );
    return { ok: status === 'connected' || status === 'mock' || status === 'degraded', status, checkedAt };
  }
}
