import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { AskQuestionComponent } from './ask-question.component';

/** UC-100..UC-105 wizard step validation */
describe('AskQuestionComponent', () => {
  beforeEach(async () => {
    localStorage.clear();
    await TestBed.configureTestingModule({
      imports: [AskQuestionComponent],
      providers: [provideRouter([])],
    }).compileComponents();
  });

  it('blocks next from content step when question is too short', () => {
    const fixture = TestBed.createComponent(AskQuestionComponent);
    const cmp = fixture.componentInstance;
    fixture.detectChanges();
    cmp.form.patchValue({ topicId: 'tax', question: 'ngắn quá' });
    cmp.next();
    expect(cmp.step()).toBe(0);
    expect(cmp.stepError()).toBeTruthy();
  });

  it('advances to contact step when content is valid', () => {
    const fixture = TestBed.createComponent(AskQuestionComponent);
    const cmp = fixture.componentInstance;
    fixture.detectChanges();
    cmp.form.patchValue({
      topicId: 'tax',
      question: 'Câu hỏi đủ dài để vượt qua kiểm tra tối thiểu hai mươi ký tự.',
    });
    cmp.next();
    expect(cmp.step()).toBe(1);
  });
});
