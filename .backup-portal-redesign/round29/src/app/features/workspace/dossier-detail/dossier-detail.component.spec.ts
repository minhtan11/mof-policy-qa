import { TestBed } from '@angular/core/testing';
import { provideRouter, ActivatedRoute } from '@angular/router';
import { of } from 'rxjs';
import { DossierDetailComponent } from './dossier-detail.component';
import { MockDbService } from '../../../core/mock-api/mock-db.service';
import { AuthService } from '../../../core/auth/auth.service';
import { WorkflowRepository } from '../../../core/mock-api/workflow.repository';

/** UC-142..UC-161 — G2 workspace actions + workflow gates */
describe('DossierDetailComponent G2', () => {
  async function setup(dossierId: string, clearStorage = true): Promise<void> {
    if (clearStorage) {
      localStorage.clear();
    }
    await TestBed.configureTestingModule({
      imports: [DossierDetailComponent],
      providers: [
        provideRouter([]),
        {
          provide: ActivatedRoute,
          useValue: {
            snapshot: { paramMap: { get: () => dossierId } },
            paramMap: of({ get: () => dossierId }),
          },
        },
      ],
    }).compileComponents();
  }

  it('assigns a specialist from new into processing', async () => {
    TestBed.resetTestingModule();
    localStorage.clear();
    TestBed.configureTestingModule({});
    const seedDb = TestBed.inject(MockDbService);
    const created = seedDb.createDossier({
      topicId: 'tax',
      question: 'Câu hỏi đủ dài để tạo hồ sơ phân công trong workspace nội bộ.',
      sender: 'A',
      senderEmail: 'a@example.vn',
      organization: '',
      attachments: [],
    });

    TestBed.resetTestingModule();
    await setup(created.id, false);
    const auth = TestBed.inject(AuthService);
    auth.loginAs('coordinator');

    const fixture = TestBed.createComponent(DossierDetailComponent);
    const cmp = fixture.componentInstance;
    fixture.detectChanges();

    cmp.draftForm.controls.assignee.setValue('Lê Quốc Hưng');
    cmp.assign();

    const live = TestBed.inject(MockDbService);
    expect(live.dossiers().find((item) => item.id === created.id)?.status).toBe('processing');
    expect(live.dossiers().find((item) => item.id === created.id)?.assignedTo).toBe('Lê Quốc Hưng');
  });

  it('blocks illegal publish transition from processing', async () => {
    TestBed.resetTestingModule();
    await setup('d-001');
    const workflow = TestBed.inject(WorkflowRepository);
    expect(workflow.canTransition('processing', 'published')).toBe(false);
    expect(workflow.canTransition('waiting-approval', 'processing')).toBe(true);
    expect(workflow.canTransition('waiting-approval', 'published')).toBe(true);
    expect(workflow.canTransition('answered', 'published')).toBe(true);
  });
});
