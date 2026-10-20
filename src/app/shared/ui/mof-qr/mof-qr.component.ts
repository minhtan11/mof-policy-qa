import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';

/**
 * Mã QR MINH HOẠ (không quét được): sinh ma trận giả lập xác định từ `payload` (3 ô định vị + đường timing
 * + điểm ngẫu nhiên theo hash) — đủ để mô phỏng luồng VNeID mà không cần thư viện. Khi nối adapter thật,
 * thay bằng ảnh/SVG QR do máy chủ SSO trả về. Màu qua token `--mof-qr-ink/--mof-qr-bg` (giữ tương phản cả dark).
 */
@Component({
  selector: 'app-mof-qr',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <svg [attr.viewBox]="'0 0 ' + (n + 4) + ' ' + (n + 4)" shape-rendering="crispEdges" role="img" [attr.aria-label]="label()">
      <rect width="100%" height="100%" class="bg" />
      <path [attr.d]="path()" class="ink" transform="translate(2 2)" />
    </svg>
  `,
  styles: `
    :host { display: block; aspect-ratio: 1; }
    svg { display: block; width: 100%; height: 100%; border-radius: 8px; }
    .bg { fill: var(--mof-qr-bg); }
    .ink { fill: var(--mof-qr-ink); }
  `,
})
export class MofQrComponent {
  readonly payload = input('');
  readonly label = input('QR');
  readonly n = 29;

  readonly path = computed(() => {
    const n = this.n;
    const rnd = mulberry32(hash(this.payload() || 'mof'));
    const cells: boolean[][] = Array.from({ length: n }, () => Array<boolean>(n).fill(false));
    const reserved = (x: number, y: number) => (x < 8 && y < 8) || (x >= n - 8 && y < 8) || (x < 8 && y >= n - 8);
    for (let y = 0; y < n; y++) {
      for (let x = 0; x < n; x++) {
        if (reserved(x, y)) continue;
        cells[y][x] = x === 6 || y === 6 ? (x + y) % 2 === 0 : rnd() > 0.52;
      }
    }
    const finder = (ox: number, oy: number) => {
      for (let y = 0; y < 7; y++) {
        for (let x = 0; x < 7; x++) {
          const edge = x === 0 || y === 0 || x === 6 || y === 6;
          const core = x >= 2 && x <= 4 && y >= 2 && y <= 4;
          cells[oy + y][ox + x] = edge || core;
        }
      }
    };
    finder(0, 0);
    finder(n - 7, 0);
    finder(0, n - 7);
    let d = '';
    cells.forEach((row, y) => row.forEach((on, x) => (d += on ? `M${x} ${y}h1v1h-1z` : '')));
    return d;
  });
}

function hash(s: string): number {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) {
    h = Math.imul(h ^ s.charCodeAt(i), 16777619);
  }
  return h >>> 0;
}

function mulberry32(a: number): () => number {
  return () => {
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
