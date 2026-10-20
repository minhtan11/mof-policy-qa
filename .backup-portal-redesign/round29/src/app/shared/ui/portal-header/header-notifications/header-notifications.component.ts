import { ChangeDetectionStrategy, Component, inject, output, signal } from '@angular/core';
import { DatePipe } from '@angular/common';
import { Router } from '@angular/router';
import { TranslatePipe } from '../../../../core/i18n/translate.pipe';
import { PortalNotificationRepository } from '../../../../core/mock-api/portal-notification.repository';
import { PortalNotification } from '../../../../core/mock-api/portal-notifications';
import { MofIconButtonComponent } from '../../mof-icon-button/mof-icon-button.component';
import { MofFiIconComponent } from '../../mof-fi-icon/mof-fi-icon.component';

const KIND_ICON: Record<PortalNotification['kind'], string> = { answer: 'comment-check', status: 'time-forward', news: 'newspaper', system: 'info' };

/** Chuông thông báo header cổng: badge chưa đọc, dropdown (absolute trong wrapper relative), đánh dấu đã đọc. */
@Component({
  selector: 'app-header-notifications',
  imports: [DatePipe, TranslatePipe, MofIconButtonComponent, MofFiIconComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './header-notifications.component.html',
  styleUrl: './header-notifications.component.scss',
  host: { '(focusout)': 'onFocusOut($event)', '(keydown.escape)': 'close()' },
})
export class HeaderNotificationsComponent {
  readonly repo = inject(PortalNotificationRepository);
  private readonly router = inject(Router);
  readonly open = signal(false);
  readonly icon = KIND_ICON;
  /** Báo header đóng nav/user khi panel này mở (chỉ một dropdown cùng lúc). */
  readonly opened = output<void>();

  toggle(): void {
    const next = !this.open();
    this.open.set(next);
    if (next) {
      this.opened.emit();
    }
  }

  close(): void {
    this.open.set(false);
  }

  onFocusOut(e: FocusEvent): void {
    if (!(e.currentTarget as HTMLElement).contains(e.relatedTarget as Node | null)) {
      this.close();
    }
  }

  go(n: PortalNotification): void {
    this.repo.markRead(n.id);
    this.close();
    void this.router.navigate([n.route], { fragment: n.fragment });
  }
}
