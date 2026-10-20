import { TestBed } from '@angular/core/testing';
import { MofPaginationComponent, pageItems } from './mof-pagination.component';

describe('MofPaginationComponent', () => {
  it('builds page items with ellipsis', () => {
    expect(pageItems(1, 5)).toEqual([1, 2, 3, 4, 5]);
    expect(pageItems(1, 20)).toEqual([1, 2, 3, 4, 5, 'gap-r', 20]);
    expect(pageItems(10, 20)).toEqual([1, 'gap-l', 9, 10, 11, 'gap-r', 20]);
    expect(pageItems(20, 20)).toEqual([1, 'gap-l', 16, 17, 18, 19, 20]);
  });

  it('shows the x–y / N range and emits page changes (not for disabled/current)', () => {
    const f = TestBed.createComponent(MofPaginationComponent);
    f.componentRef.setInput('total', 24);
    f.componentRef.setInput('pageSize', 6);
    f.componentRef.setInput('page', 2);
    f.detectChanges();
    const el: HTMLElement = f.nativeElement;
    expect(el.querySelector('.range')?.textContent?.replace(/\s+/g, ' ')).toContain('7–12 / 24');
    const out: number[] = [];
    f.componentInstance.pageChange.subscribe((p) => out.push(p));
    el.querySelectorAll<HTMLButtonElement>('.pg.nav')[1].click();
    f.componentInstance.go(2);
    expect(out).toEqual([3]);
    expect(el.querySelector('.pg.on')?.getAttribute('aria-current')).toBe('page');
  });
});
