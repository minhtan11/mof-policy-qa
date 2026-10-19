import { TestBed } from '@angular/core/testing';
import { ReportRepository } from './report.repository';
import { MockDbService } from './mock-db.service';

/** UC-188..UC-203: báo cáo phải lấy số liệu từ mock database và trả về các chỉ số có thể hiển thị. */
describe('ReportRepository', () => {
  it('generates operational summary rows', () => {
    TestBed.configureTestingModule({ providers: [ReportRepository, MockDbService] });
    const repository = TestBed.inject(ReportRepository);
    const result = repository.generate(repository.definitions[0], '01/10/2026', '20/10/2026');
    expect(result.rows.map((row) => row.label)).toEqual(['Tổng hồ sơ', 'Đang xử lý', 'Chờ phê duyệt', 'Đã công khai']);
    expect(result.rows[0].value).toBeGreaterThan(0);
  });
});
