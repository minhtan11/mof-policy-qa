import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { DatePipe, DecimalPipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { TableModule } from 'primeng/table';
import { TagModule } from 'primeng/tag';
import { SelectModule } from 'primeng/select';
import { InputTextModule } from 'primeng/inputtext';
import { MessageService } from 'primeng/api';
import { WorkspaceShellComponent } from '../../../shared/ui/workspace-shell/workspace-shell.component';
import { USERS } from '../../../core/mock-api/demo-data';
import { CatalogRepository } from '../../../core/mock-api/catalog.repository';
import { LegalDocumentRepository } from '../../../core/mock-api/legal-document.repository';
import { WorkflowRepository } from '../../../core/mock-api/workflow.repository';
import { ReportRepository } from '../../../core/mock-api/report.repository';
import { AiAdvisorService } from '../../../core/mock-api/ai-advisor.service';

/** Screen A-01..A-06 | System administrator | Operate accounts, catalogues, workflows, legal documents, AI and reports. | UC 18-99, 127-141, 188-203 */
@Component({
  imports: [WorkspaceShellComponent, FormsModule, DatePipe, DecimalPipe, ButtonModule, TableModule, TagModule, SelectModule, InputTextModule], changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './admin.component.html', styleUrl: './admin.component.scss' })
export class AdminComponent {
  readonly collapsed = signal(false); readonly activeTab = signal<'users' | 'catalog' | 'workflow' | 'legal' | 'ai' | 'reports'>('users'); readonly users = USERS.filter((user) => user.role !== 'public'); readonly tabs = [{ id: 'users', label: 'NgÃ†Â°Ã¡Â»Âi dÃƒÂ¹ng', icon: 'pi pi-users' }, { id: 'catalog', label: 'Danh mÃ¡Â»Â¥c', icon: 'pi pi-tags' }, { id: 'workflow', label: 'Workflow', icon: 'pi pi-share-alt' }, { id: 'legal', label: 'VÃ„Æ’n bÃ¡ÂºÂ£n', icon: 'pi pi-book' }, { id: 'ai', label: 'AI', icon: 'pi pi-sparkles' }, { id: 'reports', label: 'BÃƒÂ¡o cÃƒÂ¡o', icon: 'pi pi-chart-bar' }] as const;
  readonly catalog = inject(CatalogRepository); readonly legal = inject(LegalDocumentRepository); readonly workflow = inject(WorkflowRepository); readonly reports = inject(ReportRepository); readonly ai = inject(AiAdvisorService); private readonly message = inject(MessageService); legalQuery = ''; readonly reportResult = signal<ReturnType<ReportRepository['generate']> | null>(null);
  roleLabel(role: string): string { return ({ reception: 'TiÃ¡ÂºÂ¿p nhÃ¡ÂºÂ­n', specialist: 'ChuyÃƒÂªn viÃƒÂªn', leader: 'LÃƒÂ£nh Ã„â€˜Ã¡ÂºÂ¡o', coordinator: 'Ã„ÂiÃ¡Â»Âu phÃ¡Â»â€˜i', 'system-admin': 'QuÃ¡ÂºÂ£n trÃ¡Â»â€¹ viÃƒÂªn' } as Record<string, string>)[role] ?? role; }
  toggleCatalog(id: string): void { this.catalog.toggle(id); this.message.add({ severity: 'success', summary: 'Ã„ÂÃƒÂ£ cÃ¡ÂºÂ­p nhÃ¡ÂºÂ­t danh mÃ¡Â»Â¥c', detail: 'TrÃ¡ÂºÂ¡ng thÃƒÂ¡i danh mÃ¡Â»Â¥c Ã„â€˜ÃƒÂ£ Ã„â€˜Ã†Â°Ã¡Â»Â£c lÃ†Â°u trong mock repository.' }); }
  addCatalog(): void { this.catalog.add({ type: 'tag', code: `TAG-${this.catalog.entries().length + 1}`, label: 'Danh mÃ¡Â»Â¥c mÃ¡Â»â€ºi', active: true, sortOrder: this.catalog.entries().length + 1 }); this.message.add({ severity: 'success', summary: 'Ã„ÂÃƒÂ£ thÃƒÂªm danh mÃ¡Â»Â¥c', detail: 'Danh mÃ¡Â»Â¥c mÃ¡Â»â€ºi Ã„â€˜ÃƒÂ£ Ã„â€˜Ã†Â°Ã¡Â»Â£c tÃ¡ÂºÂ¡o.' }); }
  createWorkflow(): void { this.workflow.createDraft(`Quy trÃƒÂ¬nh nhÃƒÂ¡p ${this.workflow.workflows().length + 1}`, 7); this.activeTab.set('workflow'); this.message.add({ severity: 'success', summary: 'Ã„ÂÃƒÂ£ tÃ¡ÂºÂ¡o workflow nhÃƒÂ¡p', detail: 'BÃ¡ÂºÂ¡n cÃƒÂ³ thÃ¡Â»Æ’ tiÃ¡ÂºÂ¿p tÃ¡Â»Â¥c cÃ¡ÂºÂ¥u hÃƒÂ¬nh cÃƒÂ¡c bÃ†Â°Ã¡Â»â€ºc xÃ¡Â»Â­ lÃƒÂ½.' }); }
  activateWorkflow(id: string): void { this.workflow.activate(id); this.message.add({ severity: 'success', summary: 'Ã„ÂÃƒÂ£ kÃƒÂ­ch hoÃ¡ÂºÂ¡t workflow', detail: 'PhiÃƒÂªn bÃ¡ÂºÂ£n active cÃ…Â© Ã„â€˜ÃƒÂ£ Ã„â€˜Ã†Â°Ã¡Â»Â£c lÃ†Â°u thÃƒÂ nh archived.' }); }
  addLegal(): void { this.legal.add({ code: `DRAFT/${this.legal.documents().length + 1}`, title: 'VÃ„Æ’n bÃ¡ÂºÂ£n phÃƒÂ¡p luÃ¡ÂºÂ­t mÃ¡Â»â€ºi', issuer: 'BÃ¡Â»â„¢ TÃƒÂ i chÃƒÂ­nh', issuedAt: new Date().toISOString(), effectiveFrom: new Date().toISOString(), status: 'draft', version: 1, chapters: 0, source: 'manual' }); this.message.add({ severity: 'success', summary: 'Ã„ÂÃƒÂ£ thÃƒÂªm vÃ„Æ’n bÃ¡ÂºÂ£n nhÃƒÂ¡p', detail: 'VÃ„Æ’n bÃ¡ÂºÂ£n cÃ¡ÂºÂ§n Ã„â€˜Ã†Â°Ã¡Â»Â£c bÃ¡Â»â€¢ sung nÃ¡Â»â„¢i dung trÃ†Â°Ã¡Â»â€ºc khi phÃƒÂ¡t hÃƒÂ nh.' }); }
  runAi(): void { this.ai.suggestFor('d-001', 'Doanh nghiÃ¡Â»â€¡p mÃ¡Â»â€ºi thÃƒÂ nh lÃ¡ÂºÂ­p cÃ¡ÂºÂ§n thÃ¡Â»Â±c hiÃ¡Â»â€¡n cÃƒÂ¡c thÃ¡Â»Â§ tÃ¡Â»Â¥c khai thuÃ¡ÂºÂ¿ ban Ã„â€˜Ã¡ÂºÂ§u nhÃ†Â° thÃ¡ÂºÂ¿ nÃƒÂ o?'); this.message.add({ severity: 'info', summary: 'Ã„ÂÃƒÂ£ chÃ¡ÂºÂ¡y phÃƒÂ¢n tÃƒÂ­ch', detail: 'GÃ¡Â»Â£i ÃƒÂ½ AI Ã„â€˜ang Ã¡Â»Å¸ trÃ¡ÂºÂ¡ng thÃƒÂ¡i chÃ¡Â»Â cÃƒÂ¡n bÃ¡Â»â„¢ xÃƒÂ¡c nhÃ¡ÂºÂ­n.' }); }
  acceptAi(id: string): void { this.ai.accept(id); this.message.add({ severity: 'success', summary: 'Ã„ÂÃƒÂ£ xÃƒÂ¡c nhÃ¡ÂºÂ­n gÃ¡Â»Â£i ÃƒÂ½', detail: 'KÃ¡ÂºÂ¿t quÃ¡ÂºÂ£ AI Ã„â€˜ÃƒÂ£ Ã„â€˜Ã†Â°Ã¡Â»Â£c ghi nhÃ¡ÂºÂ­n vÃƒÂ o hÃ¡Â»â€œ sÃ†Â¡.' }); }
  generateReport(): void { this.reportResult.set(this.reports.generate(this.reports.definitions[0], '01/10/2026', '20/10/2026')); this.message.add({ severity: 'success', summary: 'Ã„ÂÃƒÂ£ sinh bÃƒÂ¡o cÃƒÂ¡o', detail: 'BÃƒÂ¡o cÃƒÂ¡o tÃ¡Â»â€¢ng hÃ¡Â»Â£p Ã„â€˜ÃƒÂ£ sÃ¡ÂºÂµn sÃƒÂ ng Ã„â€˜Ã¡Â»Æ’ xem vÃƒÂ  xuÃ¡ÂºÂ¥t.' }); }
}




