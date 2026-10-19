import { TestBed } from '@angular/core/testing';
import { MockDbService } from './mock-db.service';

describe('MockDbService', () => {
  let service: MockDbService;
  beforeEach(() => { localStorage.clear(); TestBed.configureTestingModule({}); service = TestBed.inject(MockDbService); });
  it('creates a new dossier and persists it in the work queue', () => { const created = service.createDossier({ topicId: 'tax', question: 'Câu hỏi kiểm thử có đủ nội dung.', sender: 'Người kiểm thử', senderEmail: 'test@example.vn', organization: 'Đơn vị kiểm thử', attachments: [] }); expect(service.dossiers()[0].code).toBe(created.code); expect(created.status).toBe('new'); });
  it('moves a dossier through a tracked workflow state', () => { const target = service.dossiers()[0]; service.updateStatus(target.id, 'waiting-approval', 'Chuyên viên', 'Trình phê duyệt', 'Đã gửi lãnh đạo.'); expect(service.dossiers().find(d => d.id === target.id)?.status).toBe('waiting-approval'); });
});
