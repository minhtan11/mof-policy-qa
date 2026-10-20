import { TestBed } from '@angular/core/testing';
import { MockDbService } from './mock-db.service';

describe('MockDbService', () => {
  let service: MockDbService;

  beforeEach(() => {
    localStorage.clear();
    TestBed.configureTestingModule({});
    service = TestBed.inject(MockDbService);
  });

  it('creates a new dossier and persists it in the work queue', () => {
    const created = service.createDossier({
      topicId: 'tax',
      question: 'Câu hỏi kiểm thử có đủ nội dung.',
      sender: 'Người kiểm thử',
      senderEmail: 'test@example.vn',
      organization: 'Đơn vị kiểm thử',
      attachments: [],
    });
    expect(service.dossiers()[0].code).toBe(created.code);
    expect(created.status).toBe('new');
  });

  it('moves a dossier through a tracked workflow state', () => {
    const target = service.dossiers()[0];
    service.updateStatus(target.id, 'waiting-approval', 'Chuyên viên', 'Trình phê duyệt', 'Đã gửi lãnh đạo.');
    expect(service.dossiers().find((d) => d.id === target.id)?.status).toBe('waiting-approval');
  });

  /** UC-108 similar suggestion advisory */
  it('finds similar published dossiers by keyword and topic', () => {
    const similar = service.findSimilar('hoàn thuế giá trị gia tăng xuất khẩu', 'tax');
    expect(similar.length).toBeGreaterThan(0);
    expect(similar.every((item) => item.isPublic)).toBe(true);
  });

  /** UC-110 / my questions by email */
  it('lists dossiers by sender email', () => {
    service.createDossier({
      topicId: 'tax',
      question: 'Câu hỏi riêng để lọc theo email người gửi.',
      sender: 'A',
      senderEmail: 'mine@example.vn',
      organization: '',
      attachments: [],
    });
    expect(service.dossiersByEmail('mine@example.vn').length).toBe(1);
    expect(service.lastSenderEmail()).toBe('mine@example.vn');
  });

  /** UC-116 rating on published answer */
  it('adds a rating only for published dossiers', () => {
    const published = service.dossiers().find((item) => item.isPublic)!;
    const rating = service.addRating(published.id, 5, 'Rõ ràng');
    expect(rating?.stars).toBe(5);
    expect(service.findByCode(published.code)?.ratings?.length).toBe(1);
  });

  /** UC-145 assign specialist */
  it('assigns specialist and moves dossier to processing', () => {
    const created = service.createDossier({
      topicId: 'tax',
      question: 'Câu hỏi kiểm thử phân công chuyên viên nội bộ đủ dài.',
      sender: 'B',
      senderEmail: 'b@example.vn',
      organization: '',
      attachments: [],
    });
    expect(service.assign(created.id, 'Lê Quốc Hưng', 'Điều phối')).toBe(true);
    const updated = service.dossiers().find((item) => item.id === created.id);
    expect(updated?.status).toBe('processing');
    expect(updated?.assignedTo).toBe('Lê Quốc Hưng');
  });

  /** UC-161 recall published */
  it('recalls a published dossier without deleting history', () => {
    const published = service.dossiers().find((item) => item.status === 'published')!;
    const timelineLen = published.timeline.length;
    expect(service.recall(published.id, 'Lãnh đạo', 'Sai sót hình thức')).toBe(true);
    const updated = service.dossiers().find((item) => item.id === published.id)!;
    expect(updated.status).toBe('answered');
    expect(updated.isPublic).toBe(false);
    expect(updated.timeline.length).toBeGreaterThan(timelineLen);
  });

  /** UC-150 collaboration */
  it('requests collaboration on a processing dossier', () => {
    const target = service.dossiers().find((item) => item.status === 'processing')!;
    const collab = service.requestCollaboration(target.id, {
      unitId: 'org-budget',
      unitName: 'Vụ Ngân sách nhà nước',
      note: 'Xin ý kiến về quyết toán',
      dueAt: '2026-10-25',
      requestedBy: 'Chuyên viên',
    });
    expect(collab?.status).toBe('open');
    expect(service.dossiers().find((item) => item.id === target.id)?.collaborations?.length).toBe(1);
  });

  /** UC-176 internal search */
  it('searches internal dossiers by keyword', () => {
    expect(service.searchInternal({ query: 'CSTC-2026' }).length).toBeGreaterThan(0);
  });

  /** UC-099 reset seed */
  it('resets dossiers to seed data', () => {
    service.createDossier({
      topicId: 'tax',
      question: 'Câu hỏi tạm để kiểm tra reset seed dữ liệu demo.',
      sender: 'Y',
      senderEmail: 'y@example.vn',
      organization: '',
      attachments: [],
    });
    service.resetSeed();
    expect(service.dossiers().length).toBe(3);
  });
});
