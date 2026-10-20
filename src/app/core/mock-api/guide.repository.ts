import { Injectable } from '@angular/core';
import { GUIDE_FAQS, GUIDE_SECTIONS, GuideFaq, GuideSection } from './guide-fixtures';

/** UC-162..UC-165 — nội dung hướng dẫn cổng công khai; adapter sau này thay bằng CMS. */
@Injectable({ providedIn: 'root' })
export class GuideRepository {
  sections(): GuideSection[] {
    return GUIDE_SECTIONS;
  }

  faqs(): GuideFaq[] {
    return GUIDE_FAQS;
  }
}
