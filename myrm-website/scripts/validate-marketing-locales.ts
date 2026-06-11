/**
 * [INPUT]
 * - src/components/marketing/landing/marketing-keys.ts (POS: 落地页 i18n 键清单)
 * - locales/zh.json, locales/en.json：`marketing` + `cloud` 命名空间
 *
 * [OUTPUT]
 * - CI 校验：manifest 键存在、Bento/对比/深度键完整、locales 无 legacy URL
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
} from '../src/components/marketing/landing/marketing-keys';
import {
  CLOUD_FAQ_KEYS,
  CLOUD_PLAN_KEYS,
  CLOUD_STEP_KEYS,
} from '../src/components/marketing/cloud/cloud-marketing-keys';
import { appendLegacyUrlViolations } from './brand-url-patterns';

const ROOT = join(import.meta.dir, '..');
const LOCALES = ['zh', 'en'] as const;
const DEPTH_POINT_COUNT = 3;
const DEPTH_DESC_MAX_CHARS = 120;

/** Keys referenced by legal pages and cloud footer links — must stay in sync across locales. */
const LEGAL_REQUIRED_PATHS = [
  'legal.privacy.title',
  'legal.privacy.updatedAt',
  'legal.privacy.intro',
  'legal.privacy.sections.storage.body',
  'legal.terms.title',
  'legal.terms.updatedAt',
  'legal.terms.intro',
  'legal.terms.sections.service.body',
  'legal.terms.sections.billing.body',
  'legal.refund.title',
  'legal.refund.updatedAt',
  'legal.refund.intro',
] as const;

function loadMarketing(locale: (typeof LOCALES)[number]): Record<string, unknown> {
  const raw = readFileSync(join(ROOT, 'locales', `${locale}.json`), 'utf8');
  const json = JSON.parse(raw) as { marketing: Record<string, unknown> };
  return json.marketing;
}

function loadCloud(locale: (typeof LOCALES)[number]): Record<string, unknown> {
  const raw = readFileSync(join(ROOT, 'locales', `${locale}.json`), 'utf8');
  const json = JSON.parse(raw) as { cloud: Record<string, unknown> };
  return json.cloud;
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
  root: Record<string, unknown>,
  namespace: string,
  path: string,
  errors: string[],
): void {
  if (getAt(root, path) === undefined) {
    errors.push(`[${locale}] missing ${namespace}.${path}`);
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
    assertKey(locale, marketing, 'marketing', `advantages.items.${key}.title`, errors);
    assertKey(locale, marketing, 'marketing', `advantages.items.${key}.desc`, errors);
    for (let n = 4; n <= 12; n++) {
      const path = `advantages.items.${key}.point${n}`;
      if (getAt(marketing, path) !== undefined) {
        errors.push(`[${locale}] ${path} exceeds max 3 bullets for Bento`);
      }
    }
  }

  assertKey(locale, marketing, 'marketing', 'whyMyrmAgent.scrollHint', errors);

  for (const tabKey of COMPARE_TAB_KEYS) {
    assertKey(locale, marketing, 'marketing', `whyMyrmAgent.tabs.${tabKey}`, errors);
  }

  for (const rowKey of COMPARE_ROW_KEYS) {
    for (const field of COMPARE_ROW_FIELDS) {
      assertKey(locale, marketing, 'marketing', `whyMyrmAgent.rows.${rowKey}.${field}`, errors);
    }
  }

  for (const group of DEPTH_GROUPS) {
    assertKey(locale, marketing, 'marketing', `engineeringDepth.groups.${group.id}.label`, errors);
    assertKey(locale, marketing, 'marketing', `engineeringDepth.groups.${group.id}.title`, errors);
    assertKey(locale, marketing, 'marketing', `engineeringDepth.groups.${group.id}.summary`, errors);
    for (const itemKey of group.items) {
      const base = depthItemBasePath(itemKey);
      assertKey(locale, marketing, 'marketing', `${base}.title`, errors);
      assertKey(locale, marketing, 'marketing', `${base}.desc`, errors);
      for (let n = 1; n <= DEPTH_POINT_COUNT; n++) {
        assertKey(locale, marketing, 'marketing', `${base}.point${n}`, errors);
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

  for (const path of LEGAL_REQUIRED_PATHS) {
    assertKey(locale, marketing, 'marketing', path, errors);
  }

  const cloud = loadCloud(locale);
  for (const planKey of CLOUD_PLAN_KEYS) {
    const base = `pricingPreview.plans.${planKey}`;
    assertKey(locale, cloud, 'cloud', `${base}.name`, errors);
    assertKey(locale, cloud, 'cloud', `${base}.price`, errors);
    assertKey(locale, cloud, 'cloud', `${base}.wu`, errors);
    assertKey(locale, cloud, 'cloud', `${base}.features`, errors);
  }
  for (const stepKey of CLOUD_STEP_KEYS) {
    assertKey(locale, cloud, 'cloud', `howItWorks.steps.${stepKey}.title`, errors);
    assertKey(locale, cloud, 'cloud', `howItWorks.steps.${stepKey}.description`, errors);
  }
  for (const faqKey of CLOUD_FAQ_KEYS) {
    assertKey(locale, cloud, 'cloud', `faq.items.${faqKey}.question`, errors);
    assertKey(locale, cloud, 'cloud', `faq.items.${faqKey}.answer`, errors);
  }
  assertKey(locale, cloud, 'cloud', 'demo.preview.alt', errors);
  assertKey(locale, cloud, 'cloud', 'demo.caption', errors);
}

if (errors.length > 0) {
  console.error('Marketing locale validation failed:\n' + errors.join('\n'));
  process.exit(1);
}

console.log(`Marketing locales OK (${LOCALES.join(', ')})`);
