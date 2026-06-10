/**
 * [INPUT]
 * - src/components/marketing/landing/marketing-keys.ts (POS: 落地页 i18n 键清单)
 * - locales/zh.json, locales/en.json marketing namespace
 *
 * [OUTPUT]
 * - CI 校验：manifest 键存在、Bento/对比/深度/pricing 键完整、pricingPreview ↔ pricingPage 一致、locales 无 legacy URL
 *
 * [POS]
 * 营销文案 locale 契约校验；`bun run build` 前自动执行。
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
  DEPTH_ITEM_KEYS,
  depthItemBasePath,
  PRICING_PAGE_PLAN_KEYS,
  PRICING_PREVIEW_PLAN_KEYS,
} from '../src/components/marketing/landing/marketing-keys';
import { appendLegacyUrlViolations } from './brand-url-patterns';

const ROOT = join(import.meta.dir, '..');
const LOCALES = ['zh', 'en'] as const;
const DEPTH_POINT_COUNT = 3;
const DEPTH_DESC_MAX_CHARS = 120;

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

function normalizePreviewPrice(price: string): string {
  return price.replace(/\/(mo|month|月)$/i, '').trim();
}

function extractWuAmount(wu: string): string {
  const match = wu.match(/([\d,]+)\s*WU/i);
  return match ? match[1].replace(/,/g, '') : wu.trim();
}

function assertPricingPreviewMatchesPage(
  locale: string,
  marketing: Record<string, unknown>,
  errors: string[],
): void {
  for (const planKey of PRICING_PREVIEW_PLAN_KEYS) {
    const previewName = getAt(marketing, `pricingPreview.${planKey}.name`);
    const pageName = getAt(marketing, `pricingPage.plans.${planKey}.name`);
    if (typeof previewName === 'string' && typeof pageName === 'string' && previewName !== pageName) {
      errors.push(
        `[${locale}] pricingPreview.${planKey}.name (${previewName}) !== pricingPage.plans.${planKey}.name (${pageName})`,
      );
    }

    const previewPrice = getAt(marketing, `pricingPreview.${planKey}.price`);
    const pagePrice = getAt(marketing, `pricingPage.plans.${planKey}.price`);
    if (typeof previewPrice === 'string' && typeof pagePrice === 'string') {
      const normalizedPreview = normalizePreviewPrice(previewPrice);
      if (normalizedPreview !== pagePrice) {
        errors.push(
          `[${locale}] pricingPreview.${planKey}.price (${previewPrice}) !== pricingPage.plans.${planKey}.price (${pagePrice})`,
        );
      }
    }

    const previewWu = getAt(marketing, `pricingPreview.${planKey}.wu`);
    const pageWu = getAt(marketing, `pricingPage.plans.${planKey}.wu`);
    if (typeof previewWu === 'string' && typeof pageWu === 'string') {
      if (extractWuAmount(previewWu) !== extractWuAmount(pageWu)) {
        errors.push(
          `[${locale}] pricingPreview.${planKey}.wu (${previewWu}) WU amount !== pricingPage.plans.${planKey}.wu (${pageWu})`,
        );
      }
    }
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

const referencedDepthItems = new Set<string>();
for (const group of DEPTH_GROUPS) {
  for (const itemKey of group.items) {
    referencedDepthItems.add(itemKey);
  }
}
for (const itemKey of DEPTH_ITEM_KEYS) {
  if (!referencedDepthItems.has(itemKey)) {
    errors.push(`[manifest] DEPTH_ITEM_KEYS entry "${itemKey}" not assigned to any DEPTH_GROUPS`);
  }
}

for (const locale of LOCALES) {
  const localePath = join(ROOT, 'locales', `${locale}.json`);
  const localeRaw = readFileSync(localePath, 'utf8');
  appendLegacyUrlViolations(localeRaw, `myrm-website/locales/${locale}.json`, errors);

  const marketing = loadMarketing(locale);

  const advantageItems = getAt(marketing, 'advantages.items');
  if (advantageItems !== null && typeof advantageItems === 'object') {
    for (const key of Object.keys(advantageItems as Record<string, unknown>)) {
      if (!BENTO_KEYS.includes(key as (typeof BENTO_KEYS)[number])) {
        errors.push(`[${locale}] unexpected marketing.advantages.items.${key} (not in BENTO_KEYS)`);
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
    assertKey(locale, marketing, `engineeringDepth.groups.${group.id}.label`, errors);
    assertKey(locale, marketing, `engineeringDepth.groups.${group.id}.title`, errors);
    assertKey(locale, marketing, `engineeringDepth.groups.${group.id}.summary`, errors);
    for (const itemKey of group.items) {
      const base = depthItemBasePath(itemKey);
      assertKey(locale, marketing, `${base}.title`, errors);
      assertKey(locale, marketing, `${base}.desc`, errors);
      for (let n = 1; n <= DEPTH_POINT_COUNT; n++) {
        assertKey(locale, marketing, `${base}.point${n}`, errors);
      }
      for (let n = DEPTH_POINT_COUNT + 1; n <= 12; n++) {
        const path = `${base}.point${n}`;
        if (getAt(marketing, path) !== undefined) {
          errors.push(`[${locale}] ${path} exceeds max ${DEPTH_POINT_COUNT} bullets for engineering depth`);
        }
      }
      const desc = getAt(marketing, `${base}.desc`);
      if (typeof desc === 'string' && desc.length > DEPTH_DESC_MAX_CHARS) {
        errors.push(`[${locale}] ${base}.desc exceeds ${DEPTH_DESC_MAX_CHARS} chars (${desc.length})`);
      }
    }
  }

  const depthItems = getAt(marketing, 'engineeringDepth.items');
  if (depthItems !== null && typeof depthItems === 'object') {
    for (const key of Object.keys(depthItems as Record<string, unknown>)) {
      if (!referencedDepthItems.has(key)) {
        errors.push(`[${locale}] orphan marketing.engineeringDepth.items.${key} (not in DEPTH_GROUPS)`);
      }
    }
  }

  if (getAt(marketing, 'highlights') !== undefined) {
    errors.push(`[${locale}] legacy marketing.highlights must be removed (use engineeringDepth.items)`);
  }
  if (getAt(marketing, 'extendedHighlights') !== undefined) {
    errors.push(`[${locale}] legacy marketing.extendedHighlights must be removed (use engineeringDepth.items)`);
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

  assertPricingPreviewMatchesPage(locale, marketing, errors);
}

if (errors.length > 0) {
  console.error('Marketing locale validation failed:\n' + errors.join('\n'));
  process.exit(1);
}

console.log(`Marketing locales OK (${LOCALES.join(', ')})`);
