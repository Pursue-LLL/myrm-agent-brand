/**
 * [INPUT]
 * - src/components/marketing/landing/marketing-keys.ts (POS: 落地页 i18n 键清单)
 * - locales/zh.json, locales/en.json：`marketing` + `cloud` 命名空间
 *
 * [OUTPUT]
 * - CI 校验：manifest 键存在、Bento/对比/轮播/用例/FAQ/集成键完整、integration chip 长度、legal 法务键、cloud 全键契约与 CP catalog/plans 对齐、notFound 键、locales 无 legacy URL
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
  FAQ_ITEM_KEYS,
  HIGHLIGHT_SLIDE_KEYS,
  USE_CASE_KEYS,
  highlightSlideBasePath,
} from '../src/components/marketing/landing/marketing-keys';
import {
  CLOUD_ADVANTAGE_KEYS,
  CLOUD_FAQ_KEYS,
  CLOUD_PLAN_KEYS,
  CLOUD_STEP_KEYS,
  CLOUD_TRUST_KEYS,
  CLOUD_USE_CASE_KEYS,
} from '../src/components/marketing/cloud/cloud-marketing-keys';
import { appendLegacyUrlViolations } from './brand-url-patterns';

const ROOT = join(import.meta.dir, '..');
const CP_BILLING_ROOT = join(ROOT, '../../myrm-control-plane/src/myrm_control_plane/billing');
const LOCALES = ['zh', 'en'] as const;
const HIGHLIGHT_TAG_COUNT = 3;
const HIGHLIGHT_DESC_MAX_CHARS = 140;
/** Max chars per Integrations chip segment (` · ` split); keeps mobile pills scannable. */
const INTEGRATION_CHIP_MAX_CHARS = 48;
const INTEGRATION_LIST_DELIMITER = ' · ';

/** Keys referenced by legal pages and cloud footer links — must stay in sync across locales. */
const NOT_FOUND_PATHS = ['title', 'description', 'backHome'] as const;

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

function loadNotFound(locale: (typeof LOCALES)[number]): Record<string, unknown> {
  const raw = readFileSync(join(ROOT, 'locales', `${locale}.json`), 'utf8');
  const json = JSON.parse(raw) as { notFound: Record<string, unknown> };
  return json.notFound;
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

type CloudPlanKey = (typeof CLOUD_PLAN_KEYS)[number];

function billingPlanEnum(planKey: CloudPlanKey): string {
  return planKey.toUpperCase();
}

function parseCpMonthlyUsd(planKey: CloudPlanKey): number {
  const catalogText = readFileSync(join(CP_BILLING_ROOT, 'catalog.py'), 'utf8');
  const pattern = new RegExp(
    `BillingPlan\\.${billingPlanEnum(planKey)}:\\s*\\(\\s*(\\d+)\\s*,`,
  );
  const match = catalogText.match(pattern);
  if (!match) {
    throw new Error(`Could not parse PLAN_DISPLAY_USD for ${planKey} in catalog.py`);
  }
  return Number.parseInt(match[1] ?? '', 10);
}

function parseCpMonthlyWu(planKey: CloudPlanKey): number {
  const plansText = readFileSync(join(CP_BILLING_ROOT, 'plans.py'), 'utf8');
  const pattern = new RegExp(
    `BillingPlan\\.${billingPlanEnum(planKey)}:[\\s\\S]*?monthly_wu=(\\d+)`,
  );
  const match = plansText.match(pattern);
  if (!match) {
    throw new Error(`Could not parse monthly_wu for ${planKey} in plans.py`);
  }
  return Number.parseInt(match[1] ?? '', 10);
}

function parseLocalePriceUsd(raw: unknown): number | null {
  if (typeof raw !== 'string') return null;
  const match = raw.match(/\$?\s*(\d+)/);
  if (!match) return null;
  return Number.parseInt(match[1] ?? '', 10);
}

function parseLocaleWu(raw: unknown): number | null {
  if (typeof raw !== 'string') return null;
  const normalized = raw.replace(/,/g, '');
  const match = normalized.match(/(\d+)\s*WU/i);
  if (!match) return null;
  return Number.parseInt(match[1] ?? '', 10);
}

function validateCloudPricingAgainstCp(errors: string[]): void {
  for (const planKey of CLOUD_PLAN_KEYS) {
    let expectedUsd: number;
    let expectedWu: number;
    try {
      expectedUsd = parseCpMonthlyUsd(planKey);
      expectedWu = parseCpMonthlyWu(planKey);
    } catch (error) {
      errors.push(`[cp] ${error instanceof Error ? error.message : String(error)}`);
      continue;
    }

    for (const locale of LOCALES) {
      const cloud = loadCloud(locale);
      const priceRaw = getAt(cloud, `pricingPreview.plans.${planKey}.price`);
      const wuRaw = getAt(cloud, `pricingPreview.plans.${planKey}.wu`);
      const localeUsd = parseLocalePriceUsd(priceRaw);
      const localeWu = parseLocaleWu(wuRaw);

      if (localeUsd === null) {
        errors.push(`[${locale}] cloud.pricingPreview.plans.${planKey}.price is not parseable USD`);
      } else if (localeUsd !== expectedUsd) {
        errors.push(
          `[${locale}] cloud.pricingPreview.plans.${planKey}.price=$${localeUsd} != CP catalog $${expectedUsd}`,
        );
      }

      if (localeWu === null) {
        errors.push(`[${locale}] cloud.pricingPreview.plans.${planKey}.wu is not parseable WU`);
      } else if (localeWu !== expectedWu) {
        errors.push(
          `[${locale}] cloud.pricingPreview.plans.${planKey}.wu=${localeWu} != CP plans monthly_wu=${expectedWu}`,
        );
      }
    }
  }
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

function assertIntegrationChipList(
  locale: string,
  namespace: string,
  path: string,
  raw: unknown,
  errors: string[],
): void {
  if (typeof raw !== 'string' || raw.trim().length === 0) {
    errors.push(`[${locale}] ${namespace}.${path} must be a non-empty string`);
    return;
  }
  const segments = raw.split(INTEGRATION_LIST_DELIMITER).map((s) => s.trim()).filter(Boolean);
  if (segments.length === 0) {
    errors.push(`[${locale}] ${namespace}.${path} must contain at least one chip segment`);
    return;
  }
  for (const segment of segments) {
    if (segment.length > INTEGRATION_CHIP_MAX_CHARS) {
      errors.push(
        `[${locale}] ${namespace}.${path} chip "${segment.slice(0, 24)}…" exceeds ${INTEGRATION_CHIP_MAX_CHARS} chars (${segment.length})`,
      );
    }
  }
}

const errors: string[] = [];
const integrationChipCounts: Partial<Record<(typeof LOCALES)[number], { llm: number; tools: number }>> = {};

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

  for (const col of ['feature', 'hermes', 'openclaw', 'deerflow', 'myrmAgent'] as const) {
    assertKey(locale, marketing, 'marketing', `whyMyrmAgent.columns.${col}`, errors);
  }

  for (const tabKey of COMPARE_TAB_KEYS) {
    assertKey(locale, marketing, 'marketing', `whyMyrmAgent.tabs.${tabKey}`, errors);
  }

  for (const rowKey of COMPARE_ROW_KEYS) {
    for (const field of COMPARE_ROW_FIELDS) {
      assertKey(locale, marketing, 'marketing', `whyMyrmAgent.rows.${rowKey}.${field}`, errors);
    }
  }

  assertKey(locale, marketing, 'marketing', 'highlightsCarousel.eyebrow', errors);
  assertKey(locale, marketing, 'marketing', 'highlightsCarousel.title', errors);
  assertKey(locale, marketing, 'marketing', 'highlightsCarousel.subtitle', errors);
  assertKey(locale, marketing, 'marketing', 'highlightsCarousel.compareCta', errors);
  assertKey(locale, marketing, 'marketing', 'highlightsCarousel.prevAria', errors);
  assertKey(locale, marketing, 'marketing', 'highlightsCarousel.nextAria', errors);
  assertKey(locale, marketing, 'marketing', 'highlightsCarousel.gotoSlideAria', errors);

  for (const slideKey of HIGHLIGHT_SLIDE_KEYS) {
    const base = highlightSlideBasePath(slideKey);
    assertKey(locale, marketing, 'marketing', `${base}.label`, errors);
    assertKey(locale, marketing, 'marketing', `${base}.title`, errors);
    assertKey(locale, marketing, 'marketing', `${base}.desc`, errors);
    assertKey(locale, marketing, 'marketing', `${base}.stat`, errors);
    assertKey(locale, marketing, 'marketing', `${base}.statLabel`, errors);
    for (let n = 1; n <= HIGHLIGHT_TAG_COUNT; n++) {
      assertKey(locale, marketing, 'marketing', `${base}.tag${n}`, errors);
    }
    for (let n = HIGHLIGHT_TAG_COUNT + 1; n <= 12; n++) {
      const path = `${base}.tag${n}`;
      if (getAt(marketing, path) !== undefined) {
        errors.push(`[${locale}] ${path} exceeds max ${HIGHLIGHT_TAG_COUNT} tags for highlights carousel`);
      }
    }
    const desc = getAt(marketing, `${base}.desc`);
    if (typeof desc === 'string' && desc.length > HIGHLIGHT_DESC_MAX_CHARS) {
      errors.push(`[${locale}] ${base}.desc exceeds ${HIGHLIGHT_DESC_MAX_CHARS} chars (${desc.length})`);
    }
  }

  const carouselSlides = getAt(marketing, 'highlightsCarousel.slides');
  if (carouselSlides !== null && typeof carouselSlides === 'object') {
    for (const key of Object.keys(carouselSlides as Record<string, unknown>)) {
      if (!HIGHLIGHT_SLIDE_KEYS.includes(key as (typeof HIGHLIGHT_SLIDE_KEYS)[number])) {
        errors.push(`[${locale}] unexpected marketing.highlightsCarousel.slides.${key} (not in HIGHLIGHT_SLIDE_KEYS)`);
      }
    }
  }

  if (getAt(marketing, 'engineeringDepth') !== undefined) {
    errors.push(`[${locale}] legacy marketing.engineeringDepth must be removed (use highlightsCarousel)`);
  }
  if (getAt(marketing, 'highlights') !== undefined) {
    errors.push(`[${locale}] legacy marketing.highlights must be removed (use highlightsCarousel.slides)`);
  }
  if (getAt(marketing, 'extendedHighlights') !== undefined) {
    errors.push(`[${locale}] legacy marketing.extendedHighlights must be removed (use highlightsCarousel.slides)`);
  }

  assertKey(locale, marketing, 'marketing', 'useCases.title', errors);
  assertKey(locale, marketing, 'marketing', 'useCases.subtitle', errors);
  const useCaseItems = getAt(marketing, 'useCases.items');
  if (useCaseItems !== null && typeof useCaseItems === 'object') {
    for (const key of Object.keys(useCaseItems as Record<string, unknown>)) {
      if (!USE_CASE_KEYS.includes(key as (typeof USE_CASE_KEYS)[number])) {
        errors.push(`[${locale}] unexpected marketing.useCases.items.${key} (not in USE_CASE_KEYS)`);
      }
    }
  }
  for (const key of USE_CASE_KEYS) {
    assertKey(locale, marketing, 'marketing', `useCases.items.${key}.tag`, errors);
    assertKey(locale, marketing, 'marketing', `useCases.items.${key}.title`, errors);
    assertKey(locale, marketing, 'marketing', `useCases.items.${key}.description`, errors);
    assertKey(locale, marketing, 'marketing', `useCases.items.${key}.prompt`, errors);
  }

  assertKey(locale, marketing, 'marketing', 'integrations.title', errors);
  assertKey(locale, marketing, 'marketing', 'integrations.subtitle', errors);
  assertKey(locale, marketing, 'marketing', 'integrations.categories.llm', errors);
  assertKey(locale, marketing, 'marketing', 'integrations.categories.tools', errors);
  assertKey(locale, marketing, 'marketing', 'integrations.llmList', errors);
  assertKey(locale, marketing, 'marketing', 'integrations.toolsList', errors);
  assertKey(locale, marketing, 'marketing', 'integrations.more', errors);
  assertIntegrationChipList(locale, 'marketing', 'integrations.llmList', getAt(marketing, 'integrations.llmList'), errors);
  assertIntegrationChipList(locale, 'marketing', 'integrations.toolsList', getAt(marketing, 'integrations.toolsList'), errors);
  const llmRaw = getAt(marketing, 'integrations.llmList');
  const toolsRaw = getAt(marketing, 'integrations.toolsList');
  if (typeof llmRaw === 'string' && typeof toolsRaw === 'string') {
    integrationChipCounts[locale] = {
      llm: llmRaw.split(INTEGRATION_LIST_DELIMITER).map((s) => s.trim()).filter(Boolean).length,
      tools: toolsRaw.split(INTEGRATION_LIST_DELIMITER).map((s) => s.trim()).filter(Boolean).length,
    };
  }

  assertKey(locale, marketing, 'marketing', 'faq.title', errors);
  const faqItems = getAt(marketing, 'faq.items');
  if (faqItems !== null && typeof faqItems === 'object') {
    for (const key of Object.keys(faqItems as Record<string, unknown>)) {
      if (!FAQ_ITEM_KEYS.includes(key as (typeof FAQ_ITEM_KEYS)[number])) {
        errors.push(`[${locale}] unexpected marketing.faq.items.${key} (not in FAQ_ITEM_KEYS)`);
      }
    }
  }
  for (const key of FAQ_ITEM_KEYS) {
    assertKey(locale, marketing, 'marketing', `faq.items.${key}.question`, errors);
    assertKey(locale, marketing, 'marketing', `faq.items.${key}.answer`, errors);
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
    assertKey(locale, cloud, 'cloud', `howItWorks.steps.${stepKey}.num`, errors);
    assertKey(locale, cloud, 'cloud', `howItWorks.steps.${stepKey}.title`, errors);
    assertKey(locale, cloud, 'cloud', `howItWorks.steps.${stepKey}.description`, errors);
  }
  for (const faqKey of CLOUD_FAQ_KEYS) {
    assertKey(locale, cloud, 'cloud', `faq.items.${faqKey}.question`, errors);
    assertKey(locale, cloud, 'cloud', `faq.items.${faqKey}.answer`, errors);
  }
  for (const advantageKey of CLOUD_ADVANTAGE_KEYS) {
    assertKey(locale, cloud, 'cloud', `advantages.items.${advantageKey}.title`, errors);
    assertKey(locale, cloud, 'cloud', `advantages.items.${advantageKey}.description`, errors);
  }
  for (const useCaseKey of CLOUD_USE_CASE_KEYS) {
    assertKey(locale, cloud, 'cloud', `useCases.items.${useCaseKey}.tag`, errors);
    assertKey(locale, cloud, 'cloud', `useCases.items.${useCaseKey}.title`, errors);
    assertKey(locale, cloud, 'cloud', `useCases.items.${useCaseKey}.description`, errors);
  }
  for (const trustKey of CLOUD_TRUST_KEYS) {
    assertKey(locale, cloud, 'cloud', `trust.items.${trustKey}.title`, errors);
    assertKey(locale, cloud, 'cloud', `trust.items.${trustKey}.description`, errors);
  }
  assertKey(locale, cloud, 'cloud', 'hero.differentiator', errors);
  assertKey(locale, cloud, 'cloud', 'advantages.title', errors);
  assertKey(locale, cloud, 'cloud', 'advantages.subtitle', errors);
  assertKey(locale, cloud, 'cloud', 'useCases.title', errors);
  assertKey(locale, cloud, 'cloud', 'useCases.subtitle', errors);
  assertKey(locale, cloud, 'cloud', 'trust.title', errors);
  assertKey(locale, cloud, 'cloud', 'trust.subtitle', errors);
  assertKey(locale, cloud, 'cloud', 'pricingPreview.wuExplainer', errors);
  assertKey(locale, cloud, 'cloud', 'pricingPreview.recommended', errors);
  assertKey(locale, cloud, 'cloud', 'demo.preview.alt', errors);
  assertKey(locale, cloud, 'cloud', 'demo.caption', errors);

  const notFound = loadNotFound(locale);
  for (const path of NOT_FOUND_PATHS) {
    assertKey(locale, notFound, 'notFound', path, errors);
  }
}

validateCloudPricingAgainstCp(errors);

const enIntegrationCounts = integrationChipCounts.en;
const zhIntegrationCounts = integrationChipCounts.zh;
if (enIntegrationCounts && zhIntegrationCounts) {
  if (enIntegrationCounts.llm !== zhIntegrationCounts.llm) {
    errors.push(
      `[manifest] integrations.llmList chip count mismatch (en=${enIntegrationCounts.llm}, zh=${zhIntegrationCounts.llm})`,
    );
  }
  if (enIntegrationCounts.tools !== zhIntegrationCounts.tools) {
    errors.push(
      `[manifest] integrations.toolsList chip count mismatch (en=${enIntegrationCounts.tools}, zh=${zhIntegrationCounts.tools})`,
    );
  }
}

if (errors.length > 0) {
  console.error('Marketing locale validation failed:\n' + errors.join('\n'));
  process.exit(1);
}

console.log(`Marketing locales OK (${LOCALES.join(', ')})`);
