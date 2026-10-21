import { Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { MofFileIconComponent } from './mof-file-icon.component';
import { fileExtension, fileKind, fileKindFromMime } from './mof-file-kind';
import { buildFileIconSvg, uniquifySvgIds } from './mof-file-icon.builder';

@Component({
  imports: [MofFileIconComponent],
  template: `
    <app-mof-file-icon fileName="a.docx" />
    <app-mof-file-icon fileName="b.DOCX" [size]="28" />
    <app-mof-file-icon mimeType="application/pdf" ariaLabel="PDF" />
    <app-mof-file-icon fileName="unknown.xyz" />
    <app-mof-file-icon fileName="c.docx" />
  `,
})
class HostComponent {}

describe('MofFileIcon', () => {
  it('detects kind from extension', () => {
    expect(fileKind('Report.PDF')).toBe('pdf');
    expect(fileKind('to-trinh.docx')).toBe('doc');
    expect(fileKind('bang.xlsx')).toBe('xls');
    expect(fileKind('slide.pptx')).toBe('ppt');
    expect(fileKind('anh.jpeg')).toBe('image');
    expect(fileKind('clip.mp4')).toBe('video');
    expect(fileKind('ho-so.rar')).toBe('zip');
    expect(fileKind('ghi-chu.txt')).toBe('txt');
    expect(fileKind('ban-ve.dwg')).toBe('cad');
    expect(fileKind('noext')).toBe('generic');
    expect(fileKind(null)).toBe('generic');
    expect(fileExtension('a/b/c.v2.docx?x=1')).toBe('docx');
  });

  it('falls back to MIME type', () => {
    expect(fileKind('blob', 'application/pdf')).toBe('pdf');
    expect(fileKind('', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet')).toBe('xls');
    expect(fileKind('', 'image/png')).toBe('image');
    expect(fileKindFromMime('application/octet-stream')).toBeNull();
    expect(fileKind('x.pdf', 'image/png')).toBe('pdf');
  });

  it('uniquifies ids and url(#) references', () => {
    const out = uniquifySvgIds('<linearGradient id="g-a"/><path fill="url(#g-a)"/>', 'x1');
    expect(out).toBe('<linearGradient id="g-a__x1"/><path fill="url(#g-a__x1)"/>');
    expect(uniquifySvgIds('<path/>', 'x1')).toBe('<path/>');
  });

  it('always uses the original artwork with integer square size', () => {
    const small = buildFileIconSvg('pdf', 20.4);
    expect(small).toContain('viewBox="0 0 75.32 92.604"');
    expect(small).toContain('width="20" height="20"');
    expect(buildFileIconSvg('pdf', 36)).toContain('viewBox="0 0 75.32 92.604"');
  });

  it('renders icons with unique gradient ids per instance', () => {
    TestBed.configureTestingModule({ imports: [HostComponent] });
    const fixture = TestBed.createComponent(HostComponent);
    fixture.detectChanges();
    const el: HTMLElement = fixture.nativeElement;
    const hosts = el.querySelectorAll('app-mof-file-icon');
    expect(hosts[0].getAttribute('data-kind')).toBe('doc');
    expect(hosts[2].getAttribute('data-kind')).toBe('pdf');
    expect(hosts[2].getAttribute('role')).toBe('img');
    expect(hosts[0].getAttribute('aria-hidden')).toBe('true');
    expect(hosts[3].getAttribute('data-kind')).toBe('generic');
    expect(hosts[1].querySelector('svg')!.getAttribute('width')).toBe('28');
    const ids = Array.from(el.querySelectorAll('[id]')).map((n) => n.id);
    expect(ids.length).toBeGreaterThan(0);
    expect(new Set(ids).size).toBe(ids.length);
    const ref = hosts[0].querySelector('[fill^="url(#"]')!.getAttribute('fill')!;
    const refId = ref.slice(5, -1);
    expect(hosts[0].querySelector(`[id="${refId}"]`)).toBeTruthy();
  });
});