import { TestBed } from '@angular/core/testing';
import { ReportRepository } from './report.repository';
import { MockDbService } from './mock-db.service';
import { AiAdvisorService } from './ai-advisor.service';

/** UC-188..UC-203 */
describe('ReportRepository', () => {
  it('exposes 16 report definitions and generates category rows', () => {
    localStorage.clear();
    TestBed.configureTestingModule({ providers: [ReportRepository, MockDbService, AiAdvisorService] });
    const repository = TestBed.inject(ReportRepository);
    expect(repository.definitions.length).toBe(16);
    const result = repository.generate(repository.definitions[0], '01/10/2026', '20/10/2026');
    expect(result.rows.map((row) => row.labelKey)).toEqual([
      'admin.report.total',
      'admin.report.processing',
      'admin.report.waiting',
      'admin.report.collab',
    ]);
    expect(result.rows[0].value).toBeGreaterThan(0);
  });
});
