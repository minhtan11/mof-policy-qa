import { SEED_DOSSIERS, SEED_OFFICERS, SEED_PARTIES, INCOMING_LINKS } from './dossier-seed';
import { USERS } from './demo-data';
import { tabCounts } from './workspace-overview.repository';
import { dossierToPublicQa } from './public-qa-fixtures';

describe('dossier seed (một bảng hồ sơ)', () => {
  it('mã và id không trùng; cán bộ thuộc đúng đơn vị; người gửi có trong bảng đối tác', () => {
    expect(new Set(SEED_DOSSIERS.map((d) => d.id)).size).toBe(SEED_DOSSIERS.length);
    expect(new Set(SEED_DOSSIERS.map((d) => d.code)).size).toBe(SEED_DOSSIERS.length);
    const parties = new Set(SEED_PARTIES.map((p) => p.id));
    for (const dossier of SEED_DOSSIERS) {
      expect(parties.has(dossier.senderId!)).toBe(true);
      if (!dossier.assigneeId) continue;
      const officer = SEED_OFFICERS.find((item) => item.id === dossier.assigneeId);
      const user = USERS.find((item) => item.id === dossier.assigneeId);
      expect(officer?.name).toBe(dossier.assignedTo);
      expect(officer?.unitId).toBe(dossier.handlingUnitId);
      expect(user?.name).toBe(dossier.assignedTo);
      expect(user?.organizationId).toBe(dossier.handlingUnitId);
    }
  });

  it('các tab trạng thái cộng lại đúng tổng', () => {
    const counts = tabCounts(SEED_DOSSIERS);
    expect(counts.new + counts.processing + counts['waiting-approval']).toBe(counts.all);
    expect(counts.new + counts.processing + counts['waiting-approval'] + counts.answered + counts.closed).toBe(SEED_DOSSIERS.length);
    for (const status of [
      'new',
      'received',
      'processing',
      'awaiting-clarification',
      'awaiting-collaboration',
      'waiting-approval',
      'returned',
      'approved',
      'answered',
      'published',
      'closed',
      'rejected',
    ] as const) {
      expect(SEED_DOSSIERS.some((d) => d.status === status)).toBe(true);
    }
  });

  it('kho công khai và sổ đến chỉ trỏ hồ sơ có thật', () => {
    const ids = new Set(SEED_DOSSIERS.map((d) => d.id));
    const listed = SEED_DOSSIERS.map(dossierToPublicQa).filter((row) => row !== null);
    expect(listed.length).toBeGreaterThan(0);
    expect(listed.every((row) => ids.has(row.id))).toBe(true);
    for (const link of INCOMING_LINKS) {
      const dossier = SEED_DOSSIERS.find((item) => item.id === link.dossierId);
      expect(dossier).toBeTruthy();
    }
  });
});
