/**
 * Seed nội dung trang Hướng dẫn cổng công khai (`/portal/huong-dan`).
 * Chuỗi hiển thị qua i18n keys — không hard-code copy trong component.
 */

export interface GuideStep {
  id: string;
  titleKey: string;
  bodyKey: string;
}

export interface GuideSection {
  id: 'ask' | 'track' | 'evaluate';
  icon: string;
  titleKey: string;
  bodyKey: string;
  ctaKey: string;
  route: string;
  steps: GuideStep[];
}

export interface GuideFaq {
  id: string;
  questionKey: string;
  answerKey: string;
}

export const GUIDE_SECTIONS: GuideSection[] = [
  {
    id: 'ask',
    icon: 'comment-question',
    titleKey: 'guide.section.askTitle',
    bodyKey: 'guide.section.askBody',
    ctaKey: 'nav.ask',
    route: '/portal/hoi-dap',
    steps: [
      { id: 'ask-1', titleKey: 'guide.ask.s1Title', bodyKey: 'guide.ask.s1Body' },
      { id: 'ask-2', titleKey: 'guide.ask.s2Title', bodyKey: 'guide.ask.s2Body' },
      { id: 'ask-3', titleKey: 'guide.ask.s3Title', bodyKey: 'guide.ask.s3Body' },
    ],
  },
  {
    id: 'track',
    icon: 'search',
    titleKey: 'guide.section.trackTitle',
    bodyKey: 'guide.section.trackBody',
    ctaKey: 'nav.myQuestions',
    route: '/portal/cau-hoi-cua-toi',
    steps: [
      { id: 'track-1', titleKey: 'guide.track.s1Title', bodyKey: 'guide.track.s1Body' },
      { id: 'track-2', titleKey: 'guide.track.s2Title', bodyKey: 'guide.track.s2Body' },
      { id: 'track-3', titleKey: 'guide.track.s3Title', bodyKey: 'guide.track.s3Body' },
    ],
  },
  {
    id: 'evaluate',
    icon: 'star',
    titleKey: 'guide.section.evalTitle',
    bodyKey: 'guide.section.evalBody',
    ctaKey: 'guide.section.evalCta',
    route: '/portal/cau-hoi-cua-toi',
    steps: [
      { id: 'eval-1', titleKey: 'guide.eval.s1Title', bodyKey: 'guide.eval.s1Body' },
      { id: 'eval-2', titleKey: 'guide.eval.s2Title', bodyKey: 'guide.eval.s2Body' },
      { id: 'eval-3', titleKey: 'guide.eval.s3Title', bodyKey: 'guide.eval.s3Body' },
    ],
  },
];

export const GUIDE_FAQS: GuideFaq[] = [
  { id: 'faq-1', questionKey: 'guide.faq.q1', answerKey: 'guide.faq.a1' },
  { id: 'faq-2', questionKey: 'guide.faq.q2', answerKey: 'guide.faq.a2' },
  { id: 'faq-3', questionKey: 'guide.faq.q3', answerKey: 'guide.faq.a3' },
  { id: 'faq-4', questionKey: 'guide.faq.q4', answerKey: 'guide.faq.a4' },
  { id: 'faq-5', questionKey: 'guide.faq.q5', answerKey: 'guide.faq.a5' },
];
