import { Injectable, inject } from '@angular/core';
import { REPORTS } from './domain-fixtures';
import { MockDbService } from './mock-db.service';
import { AiAdvisorService } from './ai-advisor.service';
import { Dossier, ReportDefinition } from '../models/domain.models';
import { TOPICS } from './demo-data';
import { ROYALTY_RATE_VND } from './dossier-seed';
import { WS_OPEN_STATUSES, WS_TABS } from './workspace-overview-fixtures';

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
      rows: this.rowsFor(report.code, this.inPeriod(this.db.dossiers(), from, to)),
    };
  }

  generateById(id: string, from: string, to: string): GeneratedReport | null {
    const report = this.definitions.find((item) => item.id === id);
    if (!report) {
      return null;
    }
    return this.generate(report, from, to);
  }

  /** `dd/MM/yyyy`. Ngày không đọc được thì không lọc. */
  private inPeriod(dossiers: Dossier[], from: string, to: string): Dossier[] {
    const start = vnDay(from);
    const end = vnDay(to);
    if (!start || !end) return dossiers;
    return dossiers.filter((item) => {
      const day = item.receivedAt.slice(0, 10);
      return day >= start && day <= end;
    });
  }

  private rowsFor(code: string, dossiers: Dossier[]): ReportRow[] {
    const now = Date.now();
    const inTab = (tab: string) => {
      const statuses = WS_TABS.find((item) => item.id === tab)?.statuses ?? [];
      return dossiers.filter((item) => statuses.includes(item.status));
    };
    const open = dossiers.filter((item) => WS_OPEN_STATUSES.includes(item.status));
    const overdue = open.filter((item) => new Date(item.dueAt).getTime() < now);
    const onTime = open.filter((item) => new Date(item.dueAt).getTime() >= now);
    const collabs = dossiers.reduce((sum, item) => sum + (item.collaborations?.length ?? 0), 0);
    const ratings = dossiers.reduce((sum, item) => sum + (item.ratings?.length ?? 0), 0);
    const starHigh = dossiers.reduce(
      (sum, item) => sum + (item.ratings?.filter((rating) => rating.stars >= 4).length ?? 0),
      0,
    );
    const clarifies = dossiers.reduce((sum, item) => sum + (item.clarifications?.length ?? 0), 0);
    const timelineEvents = dossiers.reduce((sum, item) => sum + item.timeline.length, 0);
    const returned = inTab('processing').filter((item) => item.status === 'returned').length;
    const suggestions = this.ai.suggestions();
    const byUnit = new Map<string, number>();
    for (const item of dossiers) {
      const key = item.handlingUnitId || 'admin.report.unassigned';
      byUnit.set(key, (byUnit.get(key) ?? 0) + 1);
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
    const published = dossiers.filter((item) => item.status === 'published');
    const answered = inTab('answered').length + published.length + dossiers.filter((item) => item.status === 'closed').length;
    const views = dossiers.reduce((sum, item) => sum + (item.portalViews ?? 0), 0);
    const channel = (id: Dossier['intakeChannel']) => dossiers.filter((item) => (item.intakeChannel ?? 'portal') === id).length;

    switch (code) {
      case 'RPT-01':
        return [
          { labelKey: 'admin.report.total', value: dossiers.length },
          { labelKey: 'admin.report.processing', value: inTab('processing').length },
          { labelKey: 'admin.report.waiting', value: inTab('waiting-approval').length },
          { labelKey: 'admin.report.answered', value: answered },
        ];
      case 'RPT-02':
        return [...byUnit.entries()]
          .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))
          .slice(0, 3)
          .map(([, value], index) => ({ labelKey: `admin.report.unit${index + 1}`, value }));
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
          { labelKey: 'admin.report.processing', value: inTab('processing').length },
          { labelKey: 'admin.report.waiting', value: inTab('waiting-approval').length },
          { labelKey: 'admin.report.new', value: inTab('new').length },
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
          { labelKey: 'admin.report.returned', value: returned },
          { labelKey: 'admin.report.clarify', value: clarifies },
          { labelKey: 'admin.report.waiting', value: inTab('waiting-approval').length },
        ];
      case 'RPT-09':
        return [
          { labelKey: 'admin.report.complex', value: dossiers.filter((i) => (i.collaborations?.length ?? 0) > 0 || i.priority === 'urgent').length },
          { labelKey: 'admin.report.collab', value: collabs },
          { labelKey: 'admin.report.extensions', value: overdue.length },
        ];
      case 'RPT-10':
        return [
          { labelKey: 'admin.report.answered', value: answered },
          { labelKey: 'admin.report.published', value: published.length },
          { labelKey: 'admin.report.processing', value: inTab('processing').length },
        ];
      case 'RPT-11':
        return [
          { labelKey: 'admin.report.ratings', value: ratings },
          { labelKey: 'admin.report.starHigh', value: starHigh },
          { labelKey: 'admin.report.clarify', value: clarifies },
        ];
      case 'RPT-12':
        return [
          { labelKey: 'admin.report.keywordHits', value: views },
          { labelKey: 'admin.report.published', value: published.length },
          { labelKey: 'admin.report.total', value: dossiers.length },
        ];
      case 'RPT-13':
        return [
          { labelKey: 'admin.report.channelPortal', value: channel('portal') },
          { labelKey: 'admin.report.channelEmail', value: channel('email') },
          { labelKey: 'admin.report.channelPaper', value: channel('paper') },
        ];
      case 'RPT-14':
        return [
          { labelKey: 'admin.report.repeatSenders', value: repeatSenders },
          { labelKey: 'admin.report.uniqueSenders', value: byEmail.size },
          { labelKey: 'admin.report.total', value: dossiers.length },
        ];
      case 'RPT-15': {
        const assignees = [...byAssignee.entries()].sort((a, b) => b[1] - a[1]).slice(0, 3);
        if (!assignees.length) {
          return [{ labelKey: 'admin.report.unassigned', value: 0 }];
        }
        return assignees.map(([, value], index) => ({
          labelKey: `admin.report.specialist${index + 1}`,
          value,
        }));
      }
      case 'RPT-16':
        return [
          { labelKey: 'admin.report.royaltyItems', value: published.length },
          { labelKey: 'admin.report.royaltyAmount', value: published.length * ROYALTY_RATE_VND },
          { labelKey: 'admin.report.answered', value: answered },
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

function vnDay(value: string): string | null {
  const match = /^(\d{2})\/(\d{2})\/(\d{4})$/.exec(value.trim());
  return match ? `${match[3]}-${match[2]}-${match[1]}` : null;
}
