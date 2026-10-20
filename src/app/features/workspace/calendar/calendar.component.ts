/**
 * Screen WS-CAL | Lịch làm việc (SLA calendar)
 * Cán bộ xem hồ sơ theo tháng hạn xử lý; chọn tháng; mở chi tiết hồ sơ.
 * UC-142..UC-161 (SLA) | Permission: internalGuard
 */
import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { WorkspaceShellComponent } from '../../../shared/ui/workspace-shell/workspace-shell.component';
import { StatusBadgeComponent } from '../../../shared/ui/status-badge/status-badge.component';
import { TranslatePipe } from '../../../core/i18n/translate.pipe';
import { AuthService } from '../../../core/auth/auth.service';
import { I18nService } from '../../../core/i18n/i18n.service';
import { MofFiIconComponent } from '../../../shared/ui/mof-fi-icon/mof-fi-icon.component';
import { MofBreadcrumbComponent } from '../../../shared/ui/mof-breadcrumb/mof-breadcrumb.component';
import { MofBreadcrumbItem } from '../../../shared/ui/mof-breadcrumb/mof-breadcrumb.model';
import { MofSelectComponent } from '../../../shared/ui/mof-select/mof-select.component';
import { MofIconButtonComponent } from '../../../shared/ui/mof-icon-button/mof-icon-button.component';
import { CalendarRepository, monthKey, shiftMonth } from '../../../core/mock-api/calendar.repository';

@Component({
  imports: [
    WorkspaceShellComponent,
    FormsModule,
    RouterLink,
    DatePipe,
    StatusBadgeComponent,
    TranslatePipe,
    MofFiIconComponent,
    MofBreadcrumbComponent,
    MofSelectComponent,
    MofIconButtonComponent,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './calendar.component.html',
  styleUrl: './calendar.component.scss',
})
export class WorkspaceCalendarComponent {
  readonly repo = inject(CalendarRepository);
  readonly auth = inject(AuthService);
  readonly i18n = inject(I18nService);

  readonly crumbs: MofBreadcrumbItem[] = [
    { labelKey: 'workspace.navOverview', link: '/workspace' },
    { labelKey: 'wsNav.calendar', current: true },
  ];

  readonly month = signal(this.defaultMonth());

  readonly monthOptions = computed(() => {
    const months = this.repo.months();
    const cur = this.month();
    const set = new Set(months);
    if (!set.has(cur)) set.add(cur);
    return [...set]
      .sort()
      .reverse()
      .map((m) => ({
        value: m,
        label: this.i18n.t('workspace.monthLabel', { m: +m.slice(5), y: m.slice(0, 4) }),
      }));
  });

  readonly rows = computed(() => this.repo.listByMonth(this.month()));
  readonly counts = computed(() => this.repo.counts(this.month()));

  onMonth(v: string): void {
    if (/^\d{4}-\d{2}$/.test(v)) this.month.set(v);
  }

  prev(): void {
    this.month.set(shiftMonth(this.month(), -1));
  }

  next(): void {
    this.month.set(shiftMonth(this.month(), 1));
  }

  private defaultMonth(): string {
    const months = this.repo.months();
    const now = monthKey(new Date().toISOString()) ?? '2026-10';
    return months.includes(now) ? now : (months[0] ?? now);
  }
}
