/**
 * Screen PUB-soon | Người dân / doanh nghiệp | Placeholder màn chưa mock đầy đủ (Hướng dẫn, VBPL…).
 * UC liên quan: UC-162..UC-165 (lối vào cổng) | Permission: công khai
 */
import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { map } from 'rxjs';
import { TranslatePipe } from '../../../core/i18n/translate.pipe';
import { PortalHeaderComponent } from '../../../shared/ui/portal-header/portal-header.component';
import { PortalFooterComponent } from '../../../shared/ui/portal-footer/portal-footer.component';
import { PageBackdropComponent } from '../../../shared/ui/page-backdrop/page-backdrop.component';
import { MofButtonComponent } from '../../../shared/ui/mof-button/mof-button.component';
import { MofFiIconComponent } from '../../../shared/ui/mof-fi-icon/mof-fi-icon.component';

export interface ComingSoonData {
  titleKey: string;
  bodyKey?: string;
}

@Component({
  selector: 'app-coming-soon',
  imports: [
    RouterLink,
    TranslatePipe,
    PortalHeaderComponent,
    PortalFooterComponent,
    PageBackdropComponent,
    MofButtonComponent,
    MofFiIconComponent,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './coming-soon.component.html',
  styleUrl: './coming-soon.component.scss',
})
export class ComingSoonComponent {
  private readonly route = inject(ActivatedRoute);

  private readonly data = toSignal(
    this.route.data.pipe(map((d) => d as ComingSoonData)),
    { initialValue: (this.route.snapshot.data ?? {}) as ComingSoonData },
  );

  readonly titleKey = computed(() => this.data().titleKey || 'comingSoon.title');
  readonly bodyKey = computed(() => this.data().bodyKey || 'comingSoon.body');
}
