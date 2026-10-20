import { TestBed } from '@angular/core/testing';
import { OpsRepository } from './ops.repository';
import { MockDbService, SEED_DOSSIERS } from './mock-db.service';

/** UC-084..UC-099 */
describe('OpsRepository', () => {
  beforeEach(() => {
    localStorage.clear();
    TestBed.configureTestingModule({});
  });

  it('creates a backup snapshot and resets seed', () => {
    const ops = TestBed.inject(OpsRepository);
    const db = TestBed.inject(MockDbService);
    db.createDossier({
      topicId: 'tax',
      question: 'Câu hỏi tạm để kiểm tra reset seed dữ liệu demo.',
      sender: 'X',
      senderEmail: 'x@example.vn',
      organization: '',
      attachments: [],
    });
    expect(db.dossiers().length).toBeGreaterThan(3);
    ops.createBackup('Test backup');
    expect(ops.backups()[0].label).toBe('Test backup');
    ops.resetSeed();
    expect(db.dossiers().length).toBe(SEED_DOSSIERS.length);
  });

  it('runs a mock job', () => {
    const ops = TestBed.inject(OpsRepository);
    const id = ops.jobs()[0].id;
    expect(ops.runJob(id)).toBe(true);
    expect(ops.jobs().find((item) => item.id === id)?.status).toBe('running');
  });
});
