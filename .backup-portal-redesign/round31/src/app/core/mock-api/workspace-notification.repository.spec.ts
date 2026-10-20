import { TestBed } from '@angular/core/testing';
import { WorkspaceNotificationRepository } from './workspace-notification.repository';

describe('WorkspaceNotificationRepository', () => {
  beforeEach(() => localStorage.clear());

  it('tracks unread and persists read ids separately from the portal', () => {
    const repo = TestBed.inject(WorkspaceNotificationRepository);
    expect(repo.unread()).toBe(3);
    repo.markRead('w1');
    expect(repo.unread()).toBe(2);
    expect(JSON.parse(localStorage.getItem('mof.ws.notif.read')!)).toEqual(['w1']);
    expect(localStorage.getItem('mof.portal.notif.read')).toBeNull();
    repo.markAllRead();
    expect(repo.unread()).toBe(0);
  });
});
