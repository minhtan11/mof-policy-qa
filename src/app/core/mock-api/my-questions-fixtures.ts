/**
 * Tương thích import cũ. Hồ sơ của tài khoản demo là các dòng trong `SEED_DOSSIERS`
 * có `senderEmail` = `MY_QUESTIONS_DEMO_EMAIL`, không phải một fixture riêng.
 */
import { SEED_DOSSIERS } from './dossier-seed';

export { MY_QUESTIONS_DEMO_EMAIL, MY_QUESTIONS_FIXTURE_NOW } from './dossier-seed';
import { MY_QUESTIONS_DEMO_EMAIL } from './dossier-seed';

export const MY_QUESTIONS_FIXTURES = SEED_DOSSIERS.filter((d) => d.senderEmail === MY_QUESTIONS_DEMO_EMAIL);
