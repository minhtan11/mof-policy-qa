import { Injectable, inject } from '@angular/core';
import { REPORTS } from './domain-fixtures';
import { MockDbService } from './mock-db.service';
import { ReportDefinition } from '../models/domain.models';

@Injectable({ providedIn: 'root' })
export class ReportRepository {
  private readonly db = inject(MockDbService);
  readonly definitions = REPORTS;
  generate(report: ReportDefinition, from: string, to: string): { report: ReportDefinition; generatedAt: string; rows: Array<{ label: string; value: number }> } { const dossiers = this.db.dossiers(); const rows = [{ label: 'Tổng hồ sơ', value: dossiers.length }, { label: 'Đang xử lý', value: dossiers.filter((item) => item.status === 'processing').length }, { label: 'Chờ phê duyệt', value: dossiers.filter((item) => item.status === 'waiting-approval').length }, { label: 'Đã công khai', value: dossiers.filter((item) => item.status === 'published').length }]; return { report: { ...report, lastGenerated: new Date().toISOString() }, generatedAt: `${from} → ${to}`, rows }; }
}
