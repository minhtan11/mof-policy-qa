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

  const LONG = 'Câu hỏi đủ dài để vượt qua kiểm tra tối thiểu hai mươi ký tự.';

  it('stepper: forward jump validates earlier steps and stops at the first invalid one', () => {
    const fixture = TestBed.createComponent(AskQuestionComponent);
    const cmp = fixture.componentInstance;
    fixture.detectChanges();
    cmp.goTo(2);
    expect(cmp.step()).toBe(0);
    expect(cmp.stepError()).toBeTruthy();
    cmp.form.patchValue({ topicId: 'tax', question: LONG, sender: '', senderEmail: '' });
    cmp.goTo(2);
    expect(cmp.step()).toBe(1);
    expect(cmp.stepError()).toBeTruthy();
    cmp.form.patchValue({ sender: 'Nguyễn Văn A', senderEmail: 'a@example.vn' });
    cmp.goTo(2);
    expect(cmp.step()).toBe(2);
    expect(cmp.completedSteps()).toEqual([0, 1]);
  });

  it('stepper: going back is always allowed; Sửa jumps to the section', () => {
    const fixture = TestBed.createComponent(AskQuestionComponent);
    const cmp = fixture.componentInstance;
    fixture.detectChanges();
    cmp.form.patchValue({ topicId: 'tax', question: LONG, sender: 'A', senderEmail: 'a@example.vn' });
    cmp.goTo(2);
    fixture.detectChanges();
    (fixture.nativeElement.querySelectorAll('.edit-link')[0] as HTMLButtonElement).click();
    expect(cmp.step()).toBe(0);
    fixture.detectChanges();
    const steps = fixture.nativeElement.querySelectorAll('app-mof-stepper button');
    expect(steps[0].getAttribute('aria-current')).toBe('step');
    expect(steps[1].querySelector('app-mof-icon')).not.toBeNull();
  });

  it('keeps a reserved error slot (no element added when an error appears)', () => {
    const fixture = TestBed.createComponent(AskQuestionComponent);
    const cmp = fixture.componentInstance;
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('app-mof-field-error.step-error')).not.toBeNull();
    cmp.next();
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelectorAll('app-mof-field-error.step-error').length).toBe(1);
    expect(fixture.nativeElement.querySelector('.step-error .mof-field-error.visible')).not.toBeNull();
  });
});
