import { TestBed } from '@angular/core/testing';
import { PortalNotificationRepository } from './portal-notification.repository';

describe('PortalNotificationRepository', () => {
  beforeEach(() => localStorage.clear());

  it('counts unread and marks read (persisted)', () => {
    const repo = TestBed.inject(PortalNotificationRepository);
    expect(repo.unread()).toBe(3);
    repo.markRead('n1');
    expect(repo.unread()).toBe(2);
    repo.markAllRead();
    expect(repo.unread()).toBe(0);
    expect(JSON.parse(localStorage.getItem('mof.portal.notif.read')!)).toContain('n2');
  });
});
