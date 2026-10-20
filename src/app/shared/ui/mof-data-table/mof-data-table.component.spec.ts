import { Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { MofDataTableComponent } from './mof-data-table.component';

@Component({
  imports: [MofDataTableComponent],
  template: `
    <app-mof-data-table>
      <table class="mof-tbl">
        <tbody>
          <tr class="is-late"><td>A</td></tr>
        </tbody>
      </table>
      <div mofTableFoot class="foot-slot">pager</div>
    </app-mof-data-table>
  `,
})
class WithFootHost {}

@Component({
  imports: [MofDataTableComponent],
  template: `
    <app-mof-data-table>
      <table class="mof-tbl"><tbody><tr><td>only</td></tr></tbody></table>
    </app-mof-data-table>
  `,
})
class NoFootHost {}

describe('MofDataTableComponent', () => {
  it('chiếu table vào scroll và foot vào mof-dt__foot', () => {
    const f = TestBed.createComponent(WithFootHost);
    f.detectChanges();
    const host = f.nativeElement as HTMLElement;
    const scroll = host.querySelector('.mof-dt__scroll');
    const foot = host.querySelector('.mof-dt__foot');
    expect(scroll?.querySelector('table.mof-tbl')).toBeTruthy();
    expect(foot?.querySelector('.foot-slot')?.textContent).toContain('pager');
    expect(scroll?.querySelector('tr.is-late')).toBeTruthy();
  });

  it('không chiếu foot khi thiếu [mofTableFoot]', () => {
    const f = TestBed.createComponent(NoFootHost);
    f.detectChanges();
    const foot = (f.nativeElement as HTMLElement).querySelector('.mof-dt__foot');
    expect(foot?.childElementCount ?? 0).toBe(0);
  });
});
