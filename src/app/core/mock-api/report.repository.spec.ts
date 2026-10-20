import { TestBed } from '@angular/core/testing';
import { ReportRepository } from './report.repository';
import { MockDbService } from './mock-db.service';
import { AiAdvisorService } from './ai-advisor.service';

/** UC-188..UC-203 — 16 báo cáo khớp dac-ta §XVII */
describe('ReportRepository', () => {
  beforeEach(() => {
    localStorage.clear();
    TestBed.configureTestingModule({ providers: [ReportRepository, MockDbService, AiAdvisorService] });
  });

  it('exposes 16 §XVII definitions RPT-01..16', () => {
    const repository = TestBed.inject(ReportRepository);
    expect(repository.definitions.length).toBe(16);
    expect(repository.definitions.map((r) => r.code)).toEqual([
      'RPT-01', 'RPT-02', 'RPT-03', 'RPT-04', 'RPT-05', 'RPT-06', 'RPT-07', 'RPT-08',
      'RPT-09', 'RPT-10', 'RPT-11', 'RPT-12', 'RPT-13', 'RPT-14', 'RPT-15', 'RPT-16',
    ]);
    expect(repository.definitions[0].name).toBe('Tổng hợp tình hình tiếp nhận và xử lý');
    expect(repository.definitions[15].name).toBe('Thanh toán nhuận bút');
  });

  it('generates mock chart rows for every report code', () => {
    const repository = TestBed.inject(ReportRepository);
    for (const def of repository.definitions) {
      const result = repository.generate(def, '01/10/2026', '20/10/2026');
      expect(result.rows.length).toBeGreaterThan(0);
      expect(result.rows.every((row) => row.labelKey.startsWith('admin.report.'))).toBe(true);
    }
    const intake = repository.generate(repository.definitions[0], '01/10/2026', '20/10/2026');
    expect(intake.rows.map((row) => row.labelKey)).toEqual([
      'admin.report.total',
      'admin.report.processing',
      'admin.report.waiting',
      'admin.report.answered',
    ]);
    expect(intake.rows[0].value).toBeGreaterThan(0);
  });
});
