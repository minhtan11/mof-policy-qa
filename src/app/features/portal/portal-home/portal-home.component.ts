import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { DatePipe, DecimalPipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { InputTextModule } from 'primeng/inputtext';
import { TagModule } from 'primeng/tag';
import { PortalHeaderComponent } from '../../../shared/ui/portal-header/portal-header.component';
import { MockDbService } from '../../../core/mock-api/mock-db.service';
import { NOTICES } from '../../../core/mock-api/demo-data';

/** Screen P-01 | Public users | Discover policy Q&A, search published answers and start a question. | UC-01..UC-05 */
@Component({
  imports: [PortalHeaderComponent, RouterLink, FormsModule, DatePipe, DecimalPipe, ButtonModule, CardModule, InputTextModule, TagModule], changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './portal-home.component.html', styleUrl: './portal-home.component.scss' })
export class PortalHomeComponent {
  readonly db = inject(MockDbService); readonly keyword = signal(''); readonly notices = NOTICES;
  readonly published = computed(() => this.db.dossiers().filter((item) => item.isPublic));
  topicName(id: string): string { return this.db.topics.find((topic) => topic.id === id)?.name ?? 'ChÃƒÂ­nh sÃƒÂ¡ch tÃƒÂ i chÃƒÂ­nh'; }
  search(): void { window.location.assign(`/portal/tra-cuu?q=${encodeURIComponent(this.keyword())}`); }
}




