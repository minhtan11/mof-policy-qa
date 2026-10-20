import { TestBed } from '@angular/core/testing';
import { MofToasterComponent } from './mof-toaster.component';
import { ToastService } from '../../../core/toast/toast.service';

describe('MofToasterComponent', () => {
  it('renders role/aria-live per type, pauses on hover and closes via the icon button', () => {
    const f = TestBed.createComponent(MofToasterComponent);
    const svc = TestBed.inject(ToastService);
    svc.error('Sai mật khẩu', { title: 'Đăng nhập thất bại' });
    svc.success('OK');
    f.detectChanges();
    const items = f.nativeElement.querySelectorAll('.toast') as NodeListOf<HTMLElement>;
    expect(items[0].getAttribute('role')).toBe('alert');
    expect(items[0].getAttribute('aria-live')).toBe('assertive');
    expect(items[1].getAttribute('role')).toBe('status');
    items[0].dispatchEvent(new MouseEvent('mouseenter'));
    expect(svc.toasts()[0].paused).toBe(true);
    (items[0].querySelector('.close button') as HTMLButtonElement).click();
    expect(svc.toasts()[0].leaving).toBe(true);
    svc.clear();
  });
});
