import { MOF_FILE_ICON_MAP, type MofFileIconDefinition } from './mof-file-icon.svg';
import type { MofFileKind } from './mof-file-kind';


export const MOF_FILE_ICON_DEFAULT_SIZE = 32;

/**
 * Suffix every `id="..."` and `url(#...)` reference with the instance id, so several icons of the
 * same kind on one page do not share gradient ids (duplicate ids break/blur the gradients).
 */
export function uniquifySvgIds(innerHtml: string, instanceId: string | null | undefined): string {
  const suffix = (instanceId ?? '').trim();
  if (!suffix || !innerHtml.includes('id="')) {
    return innerHtml;
  }
  const ids = new Set<string>();
  for (const match of innerHtml.matchAll(/\bid="([^"]+)"/g)) {
    ids.add(match[1]);
  }
  let result = innerHtml;
  for (const id of ids) {
    const unique = `${id}__${suffix}`;
    result = result.split(`id="${id}"`).join(`id="${unique}"`).split(`url(#${id})`).join(`url(#${unique})`);
  }
  return result;
}

/** Build the full <svg> markup for a kind from trusted constants only (size is a sanitized number). */
export function buildFileIconSvg(kind: MofFileKind, size: number, instanceId?: string): string {
  const px = Math.max(1, Math.round(Number.isFinite(size) && size > 0 ? size : MOF_FILE_ICON_DEFAULT_SIZE));
  const def: MofFileIconDefinition = MOF_FILE_ICON_MAP[kind] ?? MOF_FILE_ICON_MAP.generic;
  return (
    `<svg xmlns="http://www.w3.org/2000/svg" width="${px}" height="${px}" viewBox="${def.viewBox}"` +
    ` fill="${def.fill}" preserveAspectRatio="xMidYMid meet" shape-rendering="geometricPrecision" text-rendering="geometricPrecision" aria-hidden="true" focusable="false"` +
    ` style="display:block;flex:none;width:${px}px;height:${px}px">${uniquifySvgIds(def.innerHtml, instanceId)}</svg>`
  );
}