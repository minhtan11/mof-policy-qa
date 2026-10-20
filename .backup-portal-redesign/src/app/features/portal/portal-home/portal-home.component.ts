import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { PortalHeaderComponent } from '../../../shared/ui/portal-header/portal-header.component';
import { MockDbService } from '../../../core/mock-api/mock-db.service';
import { TranslatePipe } from '../../../core/i18n/translate.pipe';
import { MofButtonComponent } from '../../../shared/ui/mof-button/mof-button.component';
import { MofBadgeComponent } from '../../../shared/ui/mof-badge/mof-badge.component';
import { MofFiIconComponent } from '../../../shared/ui/mof-fi-icon/mof-fi-icon.component';

/** Screen PUB-home | Public users | Discover policy Q&A, search published answers and start a question. | UC-162..UC-165 */
@Component({
  imports: [
    PortalHeaderComponent,
    RouterLink,
    FormsModule,
    DatePipe,
    TranslatePipe,
    MofButtonComponent,
    MofBadgeComponent,
    MofFiIconComponent,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './portal-home.component.html',
  styleUrl: './portal-home.component.scss',
})
export class PortalHomeComponent {
  readonly db = inject(MockDbService);
  private readonly router = inject(Router);

  readonly keyword = signal('');
  readonly published = computed(() => this.db.dossiers().filter((item) => item.isPublic));
  readonly popular = ['Thuế GTGT', 'Hóa đơn điện tử', 'Thuế TNDN', 'Kế toán'];

  readonly stats = [
    { key: 'home.statsAnswered', value: '12.580+', icon: 'comments', tone: 'blue' },
    { key: 'home.statsTopics', value: '08', icon: 'apps', tone: 'teal' },
    { key: 'home.statsOnTime', value: '98,4%', icon: 'chart-histogram', tone: 'amber' },
    { key: 'home.statsSupport', value: '24/7', icon: 'headset', tone: 'violet' },
  ];

  readonly highlights = [
    { title: 'home.highlight1Title', body: 'home.highlight1Body', icon: 'book-open-cover', tone: 'blue' },
    { title: 'home.highlight2Title', body: 'home.highlight2Body', icon: 'paper-plane', tone: 'teal' },
    { title: 'home.highlight3Title', body: 'home.highlight3Body', icon: 'building', tone: 'amber' },
  ];

  private readonly topicMeta: Record<string, { icon: string; tone: string }> = {
    tax: { icon: 'receipt', tone: 'blue' },
    budget: { icon: 'wallet', tone: 'teal' },
    customs: { icon: 'box', tone: 'amber' },
    finance: { icon: 'building', tone: 'violet' },
    'public-assets': { icon: 'briefcase', tone: 'rose' },
    other: { icon: 'apps', tone: 'navy' },
  };

  topicMetaOf(id: string): { icon: string; tone: string } {
    return this.topicMeta[id] ?? { icon: 'apps', tone: 'navy' };
  }

  topicName(id: string): string {
    return this.db.topics.find((topic) => topic.id === id)?.name ?? 'Policy';
  }

  search(): void {
    void this.router.navigate(['/portal/tra-cuu'], { queryParams: { q: this.keyword() } });
  }

  usePopular(term: string): void {
    this.keyword.set(term);
    this.search();
  }
}
