/**
 * Ensures zh/en marketing locale keys referenced by marketing-keys.ts stay in sync.
 */
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import {
  BENTO_KEYS,
  COMPARE_ROW_FIELDS,
  COMPARE_ROW_KEYS,
  COMPARE_TAB_KEYS,
  COMPARE_TAB_ROWS,
  DEPTH_GROUPS,
  depthAdvantageItemKeys,
  depthItemBasePath,
  PRICING_PAGE_PLAN_KEYS,
} from '../src/components/marketing/landing/marketing-keys';

const ROOT = join(import.meta.dir, '..');
const LOCALES = ['zh', 'en'] as const;

function loadMarketing(locale: (typeof LOCALES)[number]): Record<string, unknown> {
  const raw = readFileSync(join(ROOT, 'locales', `${locale}.json`), 'utf8');
  const json = JSON.parse(raw) as { marketing: Record<string, unknown> };
  return json.marketing;
}

function getAt(obj: Record<string, unknown>, path: string): unknown {
  let cur: unknown = obj;
  for (const part of path.split('.')) {
    if (cur === null || typeof cur !== 'object' || !(part in (cur as Record<string, unknown>))) {
      return undefined;
    }
    cur = (cur as Record<string, unknown>)[part];
  }
  return cur;
}

function assertKey(
  locale: string,
  marketing: Record<string, unknown>,
  path: string,
  errors: string[],
): void {
  if (getAt(marketing, path) === undefined) {
    errors.push(`[${locale}] missing marketing.${path}`);
  }
}

const errors: string[] = [];

const tabRowSet = new Set<string>();
for (const tabKey of COMPARE_TAB_KEYS) {
  if (tabKey === 'all') continue;
  for (const rowKey of COMPARE_TAB_ROWS[tabKey]) {
    if (tabRowSet.has(rowKey)) {
      errors.push(`[manifest] duplicate compare row "${rowKey}" in tabs`);
    }
    tabRowSet.add(rowKey);
  }
}
for (const rowKey of COMPARE_ROW_KEYS) {
  if (!tabRowSet.has(rowKey)) {
    errors.push(`[manifest] compare row "${rowKey}" missing from category tabs`);
  }
}
if (COMPARE_TAB_ROWS.all.length !== COMPARE_ROW_KEYS.length) {
  errors.push('[manifest] COMPARE_TAB_ROWS.all must list every COMPARE_ROW_KEYS entry');
}

for (const locale of LOCALES) {
  const marketing = loadMarketing(locale);

  const allowedAdvantageKeys = new Set<string>([
    ...BENTO_KEYS,
    ...depthAdvantageItemKeys(),
  ]);
  const advantageItems = getAt(marketing, 'advantages.items');
  if (advantageItems !== null && typeof advantageItems === 'object') {
    for (const key of Object.keys(advantageItems as Record<string, unknown>)) {
      if (!allowedAdvantageKeys.has(key)) {
        errors.push(`[${locale}] unexpected marketing.advantages.items.${key} (not in BENTO or depth refs)`);
      }
    }
  }

  for (const key of BENTO_KEYS) {
    assertKey(locale, marketing, `advantages.items.${key}.title`, errors);
    assertKey(locale, marketing, `advantages.items.${key}.desc`, errors);
    for (let n = 4; n <= 12; n++) {
      const path = `advantages.items.${key}.point${n}`;
      if (getAt(marketing, path) !== undefined) {
        errors.push(`[${locale}] ${path} exceeds max 3 bullets for Bento`);
      }
    }
  }

  for (const depthKey of depthAdvantageItemKeys()) {
    assertKey(locale, marketing, `advantages.items.${depthKey}.title`, errors);
    assertKey(locale, marketing, `advantages.items.${depthKey}.desc`, errors);
  }

  assertKey(locale, marketing, 'whyMyrmAgent.scrollHint', errors);

  for (const tabKey of COMPARE_TAB_KEYS) {
    assertKey(locale, marketing, `whyMyrmAgent.tabs.${tabKey}`, errors);
  }

  for (const rowKey of COMPARE_ROW_KEYS) {
    for (const field of COMPARE_ROW_FIELDS) {
      assertKey(locale, marketing, `whyMyrmAgent.rows.${rowKey}.${field}`, errors);
    }
  }

  for (const group of DEPTH_GROUPS) {
    assertKey(locale, marketing, `engineeringDepth.groups.${group.id}.title`, errors);
    assertKey(locale, marketing, `engineeringDepth.groups.${group.id}.summary`, errors);
    for (const ref of group.items) {
      const base = depthItemBasePath(ref.source, ref.itemKey);
      assertKey(locale, marketing, `${base}.title`, errors);
      assertKey(locale, marketing, `${base}.desc`, errors);
    }
  }

  assertKey(locale, marketing, 'pricingPage.period', errors);
  assertKey(locale, marketing, 'pricingPage.billingNote', errors);
  assertKey(locale, marketing, 'pricingPage.billingLink', errors);
  for (const planKey of PRICING_PAGE_PLAN_KEYS) {
    const base = `pricingPage.plans.${planKey}`;
    assertKey(locale, marketing, `${base}.name`, errors);
    assertKey(locale, marketing, `${base}.price`, errors);
    assertKey(locale, marketing, `${base}.wu`, errors);
    assertKey(locale, marketing, `${base}.features`, errors);
    const features = getAt(marketing, `${base}.features`);
    if (features !== undefined && !Array.isArray(features)) {
      errors.push(`[${locale}] marketing.${base}.features must be an array`);
    }
  }
}

if (errors.length > 0) {
  console.error('Marketing locale validation failed:\n' + errors.join('\n'));
  process.exit(1);
}

console.log(`Marketing locales OK (${LOCALES.join(', ')})`);
