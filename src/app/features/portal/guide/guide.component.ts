import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { GuideRepository } from '../../../core/mock-api/guide.repository';
import { TranslatePipe } from '../../../core/i18n/translate.pipe';
import { PortalHeaderComponent } from '../../../shared/ui/portal-header/portal-header.component';
import { PortalFooterComponent } from '../../../shared/ui/portal-footer/portal-footer.component';
import { PageBackdropComponent } from '../../../shared/ui/page-backdrop/page-backdrop.component';
import { RevealDirective } from '../../../shared/ui/reveal/reveal.directive';
import { MofButtonComponent } from '../../../shared/ui/mof-button/mof-button.component';
import { MofFiIconComponent } from '../../../shared/ui/mof-fi-icon/mof-fi-icon.component';
import { MofBreadcrumbComponent } from '../../../shared/ui/mof-breadcrumb/mof-breadcrumb.component';
import { MofBreadcrumbItem } from '../../../shared/ui/mof-breadcrumb/mof-breadcrumb.model';

/**
 * Screen PUB-guide | Người dân/doanh nghiệp | Hướng dẫn sử dụng cổng: gửi hỏi, theo dõi hồ sơ, đánh giá;
 * FAQ từ GuideRepository (fixture). UC-162..UC-165 | Permission: public.
 */
@Component({
  imports: [
    RouterLink,
    TranslatePipe,
    PortalHeaderComponent,
    PortalFooterComponent,
    PageBackdropComponent,
    RevealDirective,
    MofButtonComponent,
    MofFiIconComponent,
    MofBreadcrumbComponent,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './guide.component.html',
  styleUrl: './guide.component.scss',
})
export class GuideComponent {
  private readonly repo = inject(GuideRepository);

  readonly crumbs: readonly MofBreadcrumbItem[] = [
    { labelKey: 'portal.nav.about', link: '/portal' },
    { labelKey: 'nav.guide', link: '/portal/huong-dan' },
  ];

  readonly sections = this.repo.sections();
  readonly faqs = this.repo.faqs();
  readonly openFaq = signal<string | null>(this.faqs[0]?.id ?? null);

  toggleFaq(id: string): void {
    this.openFaq.update((cur) => (cur === id ? null : id));
  }
}
