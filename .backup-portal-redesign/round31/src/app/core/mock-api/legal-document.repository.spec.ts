import { TestBed } from '@angular/core/testing';
import { LegalDocumentRepository } from './legal-document.repository';

describe('LegalDocumentRepository', () => { let repo: LegalDocumentRepository; beforeEach(() => { TestBed.configureTestingModule({}); repo = TestBed.inject(LegalDocumentRepository); }); it('finds legal documents by code or title', () => { expect(repo.search('quản lý thuế').length).toBeGreaterThan(0); }); it('preserves document identity while changing validity status', () => { const id = repo.documents()[0].id; repo.updateStatus(id, 'expired'); expect(repo.documents().find(item => item.id === id)?.status).toBe('expired'); }); });
