import { TestBed } from '@angular/core/testing';
import { AiAdvisorService } from './ai-advisor.service';

describe('AiAdvisorService', () => { let service: AiAdvisorService; beforeEach(() => { TestBed.configureTestingModule({}); service = TestBed.inject(AiAdvisorService); }); it('keeps AI output advisory until explicitly accepted', () => { const item = service.suggestFor('new-dossier', 'Nội dung câu hỏi kiểm thử'); expect(item[0].status).toBe('suggested'); service.accept(item[0].id); expect(service.suggestions().find(value => value.id === item[0].id)?.status).toBe('accepted'); }); });
