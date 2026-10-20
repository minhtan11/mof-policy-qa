import { Injectable, inject } from '@angular/core';
import { REPORTS } from './domain-fixtures';
import { MockDbService } from './mock-db.service';
import { AiAdvisorService } from './ai-advisor.service';
import { Dossier, ReportDefinition } from '../models/domain.models';
import { TOPICS } from './demo-data';

export interface ReportRow {
  labelKey: string;
  value: number;
}

export interface GeneratedReport {
  report: ReportDefinition;
  generatedAt: string;
  rows: ReportRow[];
}

/** UC-188..UC-203 — 16 báo cáo §XVII từ mock DB */
@Injectable({ providedIn: 'root' })
export class ReportRepository {
  private readonly db = inject(MockDbService);
  private readonly ai = inject(AiAdvisorService);
  readonly definitions = REPORTS;

  generate(report: ReportDefinition, from: string, to: string): GeneratedReport {
    return {
      report: { ...report, lastGenerated: new Date().toISOString() },
      generatedAt: `${from} → ${to}`,
      rows: this.rowsFor(report.code, this.db.dossiers()),
    };
  }

  generateById(id: string, from: string, to: string): GeneratedReport | null {
    const report = this.definitions.find((item) => item.id === id);
    if (!report) {
      return null;
    }
    return this.generate(report, from, to);
  }

  private rowsFor(code: string, dossiers: Dossier[]): ReportRow[] {
    const now = Date.now();
    const open = dossiers.filter((item) => item.status !== 'published' && item.status !== 'answered');
    const overdue = open.filter((item) => new Date(item.dueAt).getTime() < now);
    const onTime = open.filter((item) => new Date(item.dueAt).getTime() >= now);
    const collabs = dossiers.reduce((sum, item) => sum + (item.collaborations?.length ?? 0), 0);
    const ratings = dossiers.reduce((sum, item) => sum + (item.ratings?.length ?? 0), 0);
    const clarifies = dossiers.reduce((sum, item) => sum + (item.clarifications?.length ?? 0), 0);
    const timelineEvents = dossiers.reduce((sum, item) => sum + item.timeline.length, 0);
    const returned = dossiers.filter((item) =>
      item.timeline.some((ev) => /trả|chỉnh sửa|return|revise/i.test(ev.title)),
    ).length;
    const suggestions = this.ai.suggestions();
    const byOrg = new Map<string, number>();
    for (const item of dossiers) {
      const key = item.organization || '—';
      byOrg.set(key, (byOrg.get(key) ?? 0) + 1);
    }
    const byAssignee = new Map<string, number>();
    for (const item of dossiers) {
      const key = item.assignedTo || 'admin.report.unassigned';
      byAssignee.set(key, (byAssignee.get(key) ?? 0) + 1);
    }
    const byEmail = new Map<string, number>();
    for (const item of dossiers) {
      byEmail.set(item.senderEmail, (byEmail.get(item.senderEmail) ?? 0) + 1);
    }
    const repeatSenders = [...byEmail.values()].filter((n) => n > 1).length;
    const published = dossiers.filter((item) => item.isPublic || item.status === 'published');
    const answered = dossiers.filter((item) => item.status === 'answered' || item.status === 'published');

    switch (code) {
      case 'RPT-01':
        return [
          { labelKey: 'admin.report.total', value: dossiers.length },
          { labelKey: 'admin.report.processing', value: dossiers.filter((i) => i.status === 'processing').length },
          { labelKey: 'admin.report.waiting', value: dossiers.filter((i) => i.status === 'waiting-approval').length },
          { labelKey: 'admin.report.answered', value: answered.length },
        ];
      case 'RPT-02': {
        const units = [...byOrg.values()];
        return [1, 2, 3].map((n) => ({
          labelKey: `admin.report.unit${n}`,
          value: units[n - 1] ?? Math.max(dossiers.length - n, 0),
        }));
      }
      case 'RPT-03':
        return [
          { labelKey: 'admin.report.onTime', value: onTime.length },
          { labelKey: 'admin.report.overdue', value: overdue.length },
          { labelKey: 'admin.report.open', value: open.length },
        ];
      case 'RPT-04':
        return TOPICS.slice(0, 4).map((topic) => ({
          labelKey: `admin.report.topic.${topic.id}`,
          value: dossiers.filter((d) => d.topicId === topic.id).length,
        }));
      case 'RPT-05':
        return [
          { labelKey: 'admin.report.unanswered', value: open.length },
          { labelKey: 'admin.report.processing', value: dossiers.filter((i) => i.status === 'processing').length },
          { labelKey: 'admin.report.waiting', value: dossiers.filter((i) => i.status === 'waiting-approval').length },
          { labelKey: 'admin.report.new', value: dossiers.filter((i) => i.status === 'new' || i.status === 'received').length },
        ];
      case 'RPT-06':
        return [
          { labelKey: 'admin.report.overdue', value: overdue.length },
          { labelKey: 'admin.report.urgentOverdue', value: overdue.filter((i) => i.priority === 'urgent' || i.priority === 'high').length },
          { labelKey: 'admin.report.onTime', value: onTime.length },
        ];
      case 'RPT-07':
        return [
          { labelKey: 'admin.report.transfers', value: timelineEvents },
          { labelKey: 'admin.report.collab', value: collabs },
          { labelKey: 'admin.report.total', value: dossiers.length },
        ];
      case 'RPT-08':
        return [
          { labelKey: 'admin.report.returned', value: Math.max(returned, clarifies) },
          { labelKey: 'admin.report.clarify', value: clarifies },
          { labelKey: 'admin.report.waiting', value: dossiers.filter((i) => i.status === 'waiting-approval').length },
        ];
      case 'RPT-09':
        return [
          { labelKey: 'admin.report.complex', value: dossiers.filter((i) => (i.collaborations?.length ?? 0) > 0 || i.priority === 'urgent').length },
          { labelKey: 'admin.report.collab', value: collabs },
          { labelKey: 'admin.report.extensions', value: Math.max(overdue.length, 1) },
        ];
      case 'RPT-10':
        return [
          { labelKey: 'admin.report.answered', value: answered.length },
          { labelKey: 'admin.report.published', value: published.length },
          { labelKey: 'admin.report.processing', value: dossiers.filter((i) => i.status === 'processing').length },
        ];
      case 'RPT-11':
        return [
          { labelKey: 'admin.report.ratings', value: ratings || published.length },
          { labelKey: 'admin.report.starHigh', value: ratings || Math.max(published.length - 1, 1) },
          { labelKey: 'admin.report.clarify', value: clarifies },
        ];
      case 'RPT-12':
        return [
          { labelKey: 'admin.report.keywordHits', value: dossiers.length * 3 + 12 },
          { labelKey: 'admin.report.published', value: published.length },
          { labelKey: 'admin.report.total', value: dossiers.length },
        ];
      case 'RPT-13':
        return [
          { labelKey: 'admin.report.channelPortal', value: Math.max(dossiers.length - 1, 1) },
          { labelKey: 'admin.report.channelEmail', value: 1 },
          { labelKey: 'admin.report.channelPaper', value: 0 },
        ];
      case 'RPT-14':
        return [
          { labelKey: 'admin.report.repeatSenders', value: Math.max(repeatSenders, 1) },
          { labelKey: 'admin.report.uniqueSenders', value: byEmail.size },
          { labelKey: 'admin.report.total', value: dossiers.length },
        ];
      case 'RPT-15': {
        const assignees = [...byAssignee.entries()].slice(0, 3);
        if (!assignees.length) {
          return [{ labelKey: 'admin.report.unassigned', value: dossiers.length }];
        }
        return assignees.map(([, value], index) => ({
          labelKey: `admin.report.specialist${index + 1}`,
          value,
        }));
      }
      case 'RPT-16':
        return [
          { labelKey: 'admin.report.royaltyItems', value: published.length },
          { labelKey: 'admin.report.royaltyAmount', value: published.length * 350 },
          { labelKey: 'admin.report.answered', value: answered.length },
        ];
      default: {
        const accepted = suggestions.filter((item) => item.status === 'accepted').length;
        const rejected = suggestions.filter((item) => item.status === 'rejected').length;
        return [
          { labelKey: 'admin.report.total', value: dossiers.length },
          { labelKey: 'admin.report.aiAccept', value: accepted },
          { labelKey: 'admin.report.aiReject', value: rejected },
        ];
      }
    }
  }
}
