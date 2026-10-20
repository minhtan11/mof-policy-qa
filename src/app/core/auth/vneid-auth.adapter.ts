import { Injectable, Signal, inject, signal } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { AuthService } from './auth.service';
import { VNEID_MOCK } from '../mock-api/vneid-fixtures';

/**
 * Trạng thái phiên QR VNeID:
 * idle → waiting (chờ quét) → scanning → scanned (chờ xác nhận trên app) → confirming → success;
 * scanned → denied (bấm Đóng) | expired (hết hạn khi chưa xác nhận). Mã hết hạn lúc `waiting` tự làm mới.
 */
export type VneidStatus = 'idle' | 'waiting' | 'scanning' | 'scanned' | 'confirming' | 'success' | 'denied' | 'expired';

export interface VneidSession {
  id: string;
  /** Nội dung nhúng trong QR. */
  qrPayload: string;
  ttlSec: number;
}

/**
 * Cổng (port) đăng nhập VNeID. UI chỉ phụ thuộc lớp trừu tượng này; mặc định dùng bản mock.
 * Bản thật: OIDC qua sso.mof.gov.vn (startSession = tạo phiên + QR, status$ = polling/SSE, confirm do app thực hiện).
 */
@Injectable({ providedIn: 'root', useFactory: () => inject(MockVneidAuthAdapter) })
export abstract class VneidAuthAdapter {
  abstract readonly status: Signal<VneidStatus>;
  abstract readonly status$: Observable<VneidStatus>;
  abstract readonly session: Signal<VneidSession | null>;
  /** Số giây còn lại của mã QR hiện tại. */
  abstract readonly remaining: Signal<number>;
  abstract startSession(): void;
  abstract refresh(): void;
  abstract confirm(): void;
  abstract deny(): void;
  abstract cancel(): void;
  /** Chỉ có ở bản mock: mô phỏng điện thoại quét mã. */
  simulateScan?(): void;
}

/** Bản mock: hẹn giờ cục bộ, đăng nhập user công dân mặc định qua AuthService. */
@Injectable({ providedIn: 'root' })
export class MockVneidAuthAdapter extends VneidAuthAdapter {
  private readonly auth = inject(AuthService);
  private readonly statusSig = signal<VneidStatus>('idle');
  private readonly subject = new BehaviorSubject<VneidStatus>('idle');
  private readonly sessionSig = signal<VneidSession | null>(null);
  private readonly remainingSig = signal(0);
  private tick?: ReturnType<typeof setInterval>;
  private pending?: ReturnType<typeof setTimeout>;
  private seq = 0;

  readonly status = this.statusSig.asReadonly();
  readonly status$ = this.subject.asObservable();
  readonly session = this.sessionSig.asReadonly();
  readonly remaining = this.remainingSig.asReadonly();

  startSession(): void {
    this.clearTimers();
    this.issueQr();
    this.set('waiting');
    this.tick = setInterval(() => this.onTick(), 1000);
  }

  refresh(): void {
    const s = this.statusSig();
    if (s === 'waiting' || s === 'expired' || s === 'denied' || s === 'idle') {
      this.startSession();
    }
  }

  override simulateScan(): void {
    if (this.statusSig() !== 'waiting') {
      return;
    }
    this.set('scanning');
    this.pending = setTimeout(() => this.set('scanned'), VNEID_MOCK.scanDelayMs);
  }

  confirm(): void {
    if (this.statusSig() !== 'scanned') {
      return;
    }
    this.set('confirming');
    this.pending = setTimeout(() => {
      this.clearTimers();
      this.auth.loginById(VNEID_MOCK.userId);
      this.set('success');
    }, VNEID_MOCK.confirmDelayMs);
  }

  deny(): void {
    if (this.statusSig() === 'scanned') {
      this.clearTimers();
      this.set('denied');
    }
  }

  cancel(): void {
    this.clearTimers();
    this.sessionSig.set(null);
    this.remainingSig.set(0);
    this.set('idle');
  }

  private onTick(): void {
    const left = this.remainingSig() - 1;
    if (left > 0) {
      this.remainingSig.set(left);
      return;
    }
    const s = this.statusSig();
    if (s === 'waiting') {
      this.issueQr(); // hết hạn khi chưa quét → tự làm mới mã
    } else if (s === 'scanning' || s === 'scanned') {
      this.clearTimers();
      this.remainingSig.set(0);
      this.set('expired');
    }
  }

  private issueQr(): void {
    this.seq += 1;
    const id = `vneid-${Date.now().toString(36)}-${this.seq}`;
    this.sessionSig.set({ id, qrPayload: `${VNEID_MOCK.authorizeUrl}?session=${id}`, ttlSec: VNEID_MOCK.qrTtlSec });
    this.remainingSig.set(VNEID_MOCK.qrTtlSec);
  }

  private set(s: VneidStatus): void {
    this.statusSig.set(s);
    this.subject.next(s);
  }

  private clearTimers(): void {
    clearInterval(this.tick);
    clearTimeout(this.pending);
    this.tick = undefined;
    this.pending = undefined;
  }
}
