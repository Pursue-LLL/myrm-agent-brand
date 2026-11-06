/**
 * [INPUT]
 * - locales/{zh,en,ko}.json
 *
 * [OUTPUT]
 * - ROOT, LOCALES, loadMarketing, loadCloud, loadNotFound, getAt, assertKey
 *
 * [POS]
 * locale JSON 的读取与点路径断言；validate-marketing-locales.ts 与 cloud-pricing-contract.ts 共用。
 */
import { readFileSync } from 'node:fs';
import { join } from 'node:path';

export const ROOT = join(import.meta.dir, '..');
export const LOCALES = ['zh', 'en', 'ko'] as const;

export function loadMarketing(locale: (typeof LOCALES)[number]): Record<string, unknown> {
  const raw = readFileSync(join(ROOT, 'locales', `${locale}.json`), 'utf8');
  const json = JSON.parse(raw) as { marketing: Record<string, unknown> };
  return json.marketing;
}

export function loadCloud(locale: (typeof LOCALES)[number]): Record<string, unknown> {
  const raw = readFileSync(join(ROOT, 'locales', `${locale}.json`), 'utf8');
  const json = JSON.parse(raw) as { cloud: Record<string, unknown> };
  return json.cloud;
}

export function loadNotFound(locale: (typeof LOCALES)[number]): Record<string, unknown> {
  const raw = readFileSync(join(ROOT, 'locales', `${locale}.json`), 'utf8');
  const json = JSON.parse(raw) as { notFound: Record<string, unknown> };
  return json.notFound;
}

export function getAt(obj: Record<string, unknown>, path: string): unknown {
  let cur: unknown = obj;
  for (const part of path.split('.')) {
    if (cur === null || typeof cur !== 'object' || !(part in (cur as Record<string, unknown>))) {
      return undefined;
    }
    cur = (cur as Record<string, unknown>)[part];
  }
  return cur;
}

export function assertKey(
  locale: string,
  root: Record<string, unknown>,
  namespace: string,
  path: string,
  errors: string[],
): void {
  if (getAt(root, path) === undefined) {
    errors.push(`[${locale}] missing ${namespace}.${path}`);
  }
}
