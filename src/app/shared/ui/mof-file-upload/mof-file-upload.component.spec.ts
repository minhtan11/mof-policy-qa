import { TestBed } from '@angular/core/testing';
import { MofFileUploadComponent } from './mof-file-upload.component';

describe('MofFileUploadComponent', () => {
  it('adds files with size, dedupes, removes via the icon button', () => {
    const f = TestBed.createComponent(MofFileUploadComponent);
    const cmp = f.componentInstance;
    const seen: string[][] = [];
    cmp.registerOnChange((v) => seen.push(v));
    cmp.addFiles([new File(['x'.repeat(2048)], 'to-trinh.pdf'), new File(['y'], 'anh.png')]);
    cmp.addFiles([new File(['x'], 'to-trinh.pdf')]);
    f.detectChanges();
    expect(cmp.files()).toEqual(['to-trinh.pdf', 'anh.png']);
    expect(cmp.sizeLabel('to-trinh.pdf')).toBe('1 B');
    expect(cmp.iconFor('to-trinh.pdf')).toBe('file-pdf');
    const chips = f.nativeElement.querySelectorAll('.chip');
    expect(chips.length).toBe(2);
    (chips[1].querySelector('app-mof-icon-button button') as HTMLButtonElement).click();
    expect(cmp.files()).toEqual(['to-trinh.pdf']);
    expect(seen.at(-1)).toEqual(['to-trinh.pdf']);
  });

  it('rejects wrong type and oversize files', () => {
    const f = TestBed.createComponent(MofFileUploadComponent);
    const cmp = f.componentInstance;
    const out: string[] = [];
    cmp.rejected.subscribe((r) => out.push(r.reason + ':' + r.name));
    cmp.addFiles([new File(['x'], 'virus.exe'), new File([new Uint8Array(11 * 1024 * 1024)], 'big.pdf'), new File(['ok'], 'ok.pdf')]);
    expect(out).toEqual(['type:virus.exe', 'size:big.pdf']);
    expect(cmp.files()).toEqual(['ok.pdf']);
  });
});
