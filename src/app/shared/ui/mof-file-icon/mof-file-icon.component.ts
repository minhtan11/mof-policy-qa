import { ChangeDetectionStrategy, Component, computed, inject, input } from '@angular/core';
import { DomSanitizer, type SafeHtml } from '@angular/platform-browser';
import { MOF_FILE_ICON_MAP } from './mof-file-icon.svg';
import { MOF_FILE_ICON_DEFAULT_SIZE, buildFileIconSvg } from './mof-file-icon.builder';
import { fileKind, type MofFileKind } from './mof-file-kind';

let seq = 0;

/**
 * File-type icon (PDF, Word, Excel, PowerPoint, image, video, archive, text, CAD, generic).
 * Usage: `<app-mof-file-icon [fileName]="f.name" [mimeType]="f.type" [size]="28" />` or `[kind]="'pdf'"`.
 * Decorative by default; pass `ariaLabel` to expose it to screen readers.
 */
@Component({
  selector: 'app-mof-file-icon',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    class: 'mof-file-icon',
    '[attr.data-kind]': 'resolvedKind()',
    '[style.width.px]': 'px()',
    '[style.height.px]': 'px()',
    '[style.color]': 'color()',
    '[attr.role]': 'ariaLabel() ? "img" : null',
    '[attr.aria-label]': 'ariaLabel() || null',
    '[attr.aria-hidden]': 'ariaLabel() ? null : "true"',
  },
  template: `<span class="mfi-svg" [innerHTML]="svg()"></span>`,
  styles: `
    :host {
      display: inline-flex;
      flex: none;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
      line-height: 0;
      vertical-align: top;
    }
    .mfi-svg {
      display: block;
      width: 100%;
      height: 100%;
      line-height: 0;
    }
  `,
})
export class MofFileIconComponent {
  private readonly sanitizer = inject(DomSanitizer);
  /** Unique per instance - keeps gradient ids from colliding. */
  readonly instanceId = `mfi${++seq}`;

  readonly fileName = input<string | null | undefined>(null);
  readonly mimeType = input<string | null | undefined>(null);
  readonly kind = input<MofFileKind | null>(null);
  readonly size = input<number>(MOF_FILE_ICON_DEFAULT_SIZE);
  readonly ariaLabel = input<string | null>(null);

  readonly resolvedKind = computed<MofFileKind>(() => this.kind() ?? fileKind(this.fileName(), this.mimeType()));
  readonly px = computed(() => Math.max(1, Math.round(this.size() > 0 ? this.size() : MOF_FILE_ICON_DEFAULT_SIZE)));
  /** currentColor icons (generic/zip) follow theme tokens; full artwork keeps its colours. */
  readonly color = computed(() => MOF_FILE_ICON_MAP[this.resolvedKind()].color ?? null);

  /** Safe: markup is built only from static trusted constants + a numeric size + an internal id. */
  readonly svg = computed<SafeHtml>(() =>
    this.sanitizer.bypassSecurityTrustHtml(buildFileIconSvg(this.resolvedKind(), this.px(), this.instanceId)),
  );
}