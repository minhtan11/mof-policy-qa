import { Injectable } from '@angular/core';
import { UseCaseDefinition, UseCaseTraceStatus } from '../models/domain.models';

/** Registry UC-001..UC-203 dùng để kiểm soát phạm vi và tránh đánh dấu thiếu nghiệp vụ khi mở rộng mockup. */
@Injectable({ providedIn: 'root' })
export class UseCaseRegistry {
  readonly groups = [
    { from: 1, to: 8, name: 'Quản lý đăng nhập', file: '01-quan-ly-dang-nhap.mdc', mocked: [1, 4] },
    { from: 9, to: 17, name: 'Tổ chức đơn vị', file: '02-to-chuc-don-vi.mdc', mocked: [] },
    { from: 18, to: 30, name: 'Người dùng', file: '03-nguoi-dung.mdc', mocked: [18, 19, 20] },
    { from: 31, to: 40, name: 'Phân quyền', file: '04-phan-quyen.mdc', mocked: [31, 32] },
    { from: 41, to: 51, name: 'Quy trình', file: '05-quy-trinh.mdc', mocked: [41, 42, 43, 44] },
    { from: 52, to: 59, name: 'Tích hợp', file: '06-tich-hop.mdc', mocked: [] },
    { from: 60, to: 74, name: 'Danh mục', file: '07-danh-muc.mdc', mocked: [60, 61, 62] },
    { from: 75, to: 83, name: 'Văn bản pháp luật', file: '08-van-ban-phap-luat.mdc', mocked: [75, 76, 77] },
    { from: 84, to: 99, name: 'Vận hành', file: '09-van-hanh.mdc', mocked: [84, 85] },
    { from: 100, to: 113, name: 'Gửi câu hỏi', file: '10-gui-cau-hoi.mdc', mocked: [100, 101, 102, 103, 104, 105] },
    { from: 114, to: 126, name: 'Tương tác', file: '11-tuong-tac.mdc', mocked: [114, 115] },
    { from: 127, to: 134, name: 'Phân hệ thông minh', file: '12-phan-he-thong-minh.mdc', mocked: [127, 128, 129, 130] },
    { from: 135, to: 141, name: 'Dữ liệu backend', file: '13-du-lieu-backend.mdc', mocked: [135, 136] },
    { from: 142, to: 161, name: 'Quy trình trả lời', file: '14-quy-trinh-tra-loi.mdc', mocked: [142, 143, 144, 145, 146, 147, 148, 149] },
    { from: 162, to: 175, name: 'Tra cứu công khai', file: '15-tra-cuu-cong-khai.mdc', mocked: [162, 163, 164, 165] },
    { from: 176, to: 187, name: 'Tra cứu nội bộ', file: '16-tra-cuu-noi-bo.mdc', mocked: [176, 177] },
    { from: 188, to: 203, name: 'Báo cáo thống kê', file: '17-bao-cao-thong-ke.mdc', mocked: [188, 189, 190, 191] },
  ] as const;

  readonly all: UseCaseDefinition[] = this.groups.flatMap((group) => Array.from({ length: group.to - group.from + 1 }, (_, index) => {
    const number = group.from + index;
    const status: UseCaseTraceStatus = group.mocked.includes(number as never) ? 'mocked' : this.isIntegrationBlocked(number) ? 'blocked' : 'specified';
    return { id: `UC-${String(number).padStart(3, '0')}`, number, group: group.name, title: `${group.name} - nghiệp vụ ${number}`, mdc: `docs/nghiep-vu/${group.file}`, status };
  }));

  byStatus(status: UseCaseTraceStatus): UseCaseDefinition[] { return this.all.filter((item) => item.status === status); }
  private isIntegrationBlocked(number: number): boolean { return [6, 7, 8, 52, 53, 54, 55, 56, 57, 58, 59, 86, 87, 88, 89, 90, 91, 92, 93, 94, 95, 96, 97, 98, 99, 131, 132, 133, 134, 137, 138, 139, 140, 141].includes(number); }
}
