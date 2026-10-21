/** File categories that have dedicated artwork. */
export type MofFileKind = 'pdf' | 'doc' | 'xls' | 'ppt' | 'image' | 'video' | 'zip' | 'txt' | 'cad' | 'generic';

const EXT_KIND: Readonly<Record<string, MofFileKind>> = {
  pdf: 'pdf',
  doc: 'doc', docx: 'doc', odt: 'doc', rtf: 'doc',
  xls: 'xls', xlsx: 'xls', csv: 'xls', ods: 'xls',
  ppt: 'ppt', pptx: 'ppt', odp: 'ppt',
  png: 'image', jpg: 'image', jpeg: 'image', gif: 'image', webp: 'image', svg: 'image', bmp: 'image', heic: 'image',
  mp4: 'video', avi: 'video', mov: 'video', mkv: 'video', webm: 'video',
  zip: 'zip', rar: 'zip', '7z': 'zip', tar: 'zip', gz: 'zip',
  txt: 'txt', md: 'txt', log: 'txt',
  dwg: 'cad', dxf: 'cad', dwt: 'cad',
};

/** Extension of a file name or a bare extension ('.pdf', 'PDF', 'a/b/report.v2.docx'). */
export function fileExtension(nameOrExt: string | null | undefined): string {
  const raw = (nameOrExt ?? '').trim().split(/[?#]/)[0];
  const base = raw.split(/[\\/]/).pop() ?? '';
  const dot = base.lastIndexOf('.');
  return (dot >= 0 ? base.slice(dot + 1) : base).toLowerCase();
}

/** Kind from a MIME type, or null when the MIME is unknown/empty. */
export function fileKindFromMime(mime: string | null | undefined): MofFileKind | null {
  const m = (mime ?? '').trim().toLowerCase();
  if (!m) return null;
  if (m === 'application/pdf') return 'pdf';
  if (m.startsWith('image/')) return 'image';
  if (m.startsWith('video/')) return 'video';
  if (m.includes('wordprocessingml') || m === 'application/msword' || m.includes('opendocument.text') || m === 'application/rtf') return 'doc';
  if (m.includes('spreadsheetml') || m === 'application/vnd.ms-excel' || m === 'text/csv' || m.includes('opendocument.spreadsheet')) return 'xls';
  if (m.includes('presentationml') || m === 'application/vnd.ms-powerpoint' || m.includes('opendocument.presentation')) return 'ppt';
  if (/zip|rar|7z|x-tar|gzip|compressed/.test(m)) return 'zip';
  if (m.includes('dwg') || m.includes('dxf')) return 'cad';
  if (m.startsWith('text/')) return 'txt';
  return null;
}

/** Kind of a file by name/extension, falling back to MIME, else 'generic'. */
export function fileKind(fileName: string | null | undefined, mimeType?: string | null): MofFileKind {
  return EXT_KIND[fileExtension(fileName)] ?? fileKindFromMime(mimeType) ?? 'generic';
}