/**
 * [INPUT]
 * - marketing-keys::BENTO_KEYS (engineering depth group ids)
 *
 * [OUTPUT]
 * - Shareable URL helpers for engineering depth groups (`?group=#engineering-depth`)
 *
 * [POS]
 * URL read/write for EngineeringDepthSection; no Bento card UI links.
 */
import { BENTO_KEYS, type BentoKey } from './marketing-keys';

export const ENGINEERING_DEPTH_SECTION_ID = 'engineering-depth';

function isBentoKey(value: string): value is BentoKey {
  return (BENTO_KEYS as readonly string[]).includes(value);
}

export function readDepthGroupFromLocation(): BentoKey | null {
  if (typeof window === 'undefined') return null;

  const fromSearch = new URLSearchParams(window.location.search).get('group');
  if (fromSearch && isBentoKey(fromSearch)) return fromSearch;

  const hash = window.location.hash.slice(1);
  const queryIndex = hash.indexOf('?');
  if (queryIndex === -1) return null;

  const fromHash = new URLSearchParams(hash.slice(queryIndex + 1)).get('group');
  if (fromHash && isBentoKey(fromHash)) return fromHash;

  return null;
}

export function writeDepthEvidenceLink(group: BentoKey): void {
  const nextUrl = `${window.location.pathname}?group=${group}#${ENGINEERING_DEPTH_SECTION_ID}`;
  window.history.replaceState(null, '', nextUrl);
}
