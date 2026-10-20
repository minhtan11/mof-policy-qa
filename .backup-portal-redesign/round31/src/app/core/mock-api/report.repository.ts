import { Injectable, inject } from '@angular/core';
import { REPORTS } from './domain-fixtures';
import { MockDbService } from './mock-db.service';
import { AiAdvisorService } from './ai-advisor.service';
import { ReportDefinition } from '../models/domain.models';

export interface ReportRow {
  labelKey: string;
  value: number;
}

export interface GeneratedReport {
  report: ReportDefinition;
  generatedAt: string;
  rows: ReportRow[];
}

/** UC-188..UC-203 — 16 báo cáo tóm tắt từ mock DB */
@Injectable({ providedIn: 'root' })
export class ReportRepository {
  private readonly db = inject(MockDbService);
  private readonly ai = inject(AiAdvisorService);
  readonly definitions = REPORTS;

  generate(report: ReportDefinition, from: string, to: string): GeneratedReport {
    const dossiers = this.db.dossiers();
    const now = Date.now();
    const open = dossiers.filter((item) => item.status !== 'published');
    const overdue = open.filter((item) => new Date(item.dueAt).getTime() < now).length;
    const collabs = dossiers.reduce((sum, item) => sum + (item.collaborations?.length ?? 0), 0);
    const ratings = dossiers.reduce((sum, item) => sum + (item.ratings?.length ?? 0), 0);
    const clarifies = dossiers.reduce((sum, item) => sum + (item.clarifications?.length ?? 0), 0);
    const notes = dossiers.reduce((sum, item) => sum + (item.auditNotes?.length ?? 0), 0);
    const suggestions = this.ai.suggestions();
    const accepted = suggestions.filter((item) => item.status === 'accepted').length;
    const rejected = suggestions.filter((item) => item.status === 'rejected').length;

    const byCategory: Record<ReportDefinition['category'], ReportRow[]> = {
      operations: [
        { labelKey: 'admin.report.total', value: dossiers.length },
        { labelKey: 'admin.report.processing', value: dossiers.filter((i) => i.status === 'processing').length },
        { labelKey: 'admin.report.waiting', value: dossiers.filter((i) => i.status === 'waiting-approval').length },
        { labelKey: 'admin.report.collab', value: collabs },
      ],
      sla: [
        { labelKey: 'admin.report.open', value: open.length },
        { labelKey: 'admin.report.overdue', value: overdue },
        { labelKey: 'admin.report.onTime', value: Math.max(open.length - overdue, 0) },
      ],
      quality: [
        { labelKey: 'admin.report.clarify', value: clarifies },
        { labelKey: 'admin.report.aiAccept', value: accepted },
        { labelKey: 'admin.report.aiReject', value: rejected },
      ],
      public: [
        { labelKey: 'admin.report.published', value: dossiers.filter((i) => i.isPublic).length },
        { labelKey: 'admin.report.ratings', value: ratings },
        { labelKey: 'admin.report.answered', value: dossiers.filter((i) => i.status === 'answered').length },
      ],
      audit: [
        { labelKey: 'admin.report.notes', value: notes },
        { labelKey: 'admin.report.recalled', value: dossiers.filter((i) => i.status === 'answered' && !i.isPublic && (i.answer ?? '').length > 0).length },
        { labelKey: 'admin.report.total', value: dossiers.length },
      ],
    };

    return {
      report: { ...report, lastGenerated: new Date().toISOString() },
      generatedAt: `${from} → ${to}`,
      rows: byCategory[report.category] ?? byCategory.operations,
    };
  }

  generateById(id: string, from: string, to: string): GeneratedReport | null {
    const report = this.definitions.find((item) => item.id === id);
    if (!report) {
      return null;
    }
    return this.generate(report, from, to);
  }
}
