/**
 * [INPUT]
 * - src/components/marketing/landing/marketing-keys.ts (POS: 落地页 i18n 键清单)
 * - scripts/locale-files.ts (POS: locale 读取与键断言)
 * - scripts/cloud-pricing-contract.ts (POS: 云定价与控制面计费目录对账)
 * - scripts/brand-url-patterns.ts, scripts/retired-claim-patterns.ts (POS: locale 原文禁止项)
 *
 * [OUTPUT]
 * - CI 校验：manifest 键存在、Bento/对比/轮播/用例/FAQ/集成键完整、integration chip 长度、legal 法务键、cloud 全键契约与 CP catalog/plans 对齐、notFound 键、locales 无 legacy URL 与已撤回数字宣称
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
import { validateCloudPricingAgainstCp } from './cloud-pricing-contract';
import { LOCALES, ROOT, assertKey, getAt, loadCloud, loadMarketing, loadNotFound } from './locale-files';
import { appendRetiredClaimViolations } from './retired-claim-patterns';

/**
 * Tier-1 scoped locales (JA GTM pack): only download + metadata + notFound are
 * translated; all other namespaces fall back to en at runtime (LocaleRootProvider
 * deep-merge). Validated for scoped completeness instead of full parity.
 */
const PARTIAL_LOCALES = ['ja'] as const;
const PARTIAL_JA_NAMESPACES = ['marketing.download', 'metadata', 'notFound'] as const;
const HIGHLIGHT_TAG_COUNT = 3;
const HIGHLIGHT_DESC_MAX_CHARS = 1500;
/** Max chars per Integrations chip segment (` · ` split); keeps mobile pills scannable. */
const INTEGRATION_CHIP_MAX_CHARS = 96;
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

/** Raw-text policy scan shared by the full and the partial locales. */
function appendLocaleTextViolations(locale: string, raw: string, errors: string[]): void {
  const relPath = `myrm-website/locales/${locale}.json`;
  appendLegacyUrlViolations(raw, relPath, errors);
  appendRetiredClaimViolations(raw, relPath, errors);
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
  appendLocaleTextViolations(locale, localeRaw, errors);

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

  for (const col of ['feature', 'hermes', 'openclaw', 'myrmAgent'] as const) {
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

  // Every locale compare row must be registered in COMPARE_ROW_KEYS: unregistered
  // copy never renders, so it silently goes dark and drifts out of date.
  const registeredRows = new Set<string>(COMPARE_ROW_KEYS);
  const localeRows = getAt(marketing, 'whyMyrmAgent.rows');
  if (localeRows !== null && typeof localeRows === 'object') {
    for (const key of Object.keys(localeRows as Record<string, unknown>)) {
      if (!registeredRows.has(key)) {
        errors.push(
          `[${locale}] unregistered marketing.whyMyrmAgent.rows.${key} (register it in COMPARE_ROW_KEYS or delete the dead copy)`,
        );
      }
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

  const notFound = loadNotFound(locale);
  for (const path of NOT_FOUND_PATHS) {
    assertKey(locale, notFound, 'notFound', path, errors);
  }
}

validateCloudPricingAgainstCp(errors);

function collectLeafPaths(obj: unknown, prefix: string, out: string[]): void {
  if (obj === null || typeof obj !== 'object' || Array.isArray(obj)) {
    out.push(prefix);
    return;
  }
  for (const [key, value] of Object.entries(obj as Record<string, unknown>)) {
    collectLeafPaths(value, prefix === '' ? key : `${prefix}.${key}`, out);
  }
}

/** Scoped completeness for tier-1 partial locales: every en leaf under the JA namespaces must exist in ja. */
function validatePartialLocale(
  locale: (typeof PARTIAL_LOCALES)[number],
  namespaces: readonly string[],
  errors: string[],
): void {
  const localePath = join(ROOT, 'locales', `${locale}.json`);
  const localeRaw = readFileSync(localePath, 'utf8');
  appendLocaleTextViolations(locale, localeRaw, errors);
  const json = JSON.parse(localeRaw) as Record<string, unknown>;
  const enRaw = readFileSync(join(ROOT, 'locales', 'en.json'), 'utf8');
  const enJson = JSON.parse(enRaw) as Record<string, unknown>;
  for (const namespace of namespaces) {
    const enSub = getAt(enJson, namespace);
    const localeSub = getAt(json, namespace);
    if (enSub === undefined || enSub === null || typeof enSub !== 'object') {
      errors.push(`[${locale}] reference en.${namespace} missing (validator bug)`);
      continue;
    }
    if (localeSub === undefined) {
      errors.push(`[${locale}] missing namespace ${namespace}`);
      continue;
    }
    const expected: string[] = [];
    collectLeafPaths(enSub, '', expected);
    for (const leaf of expected) {
      assertKey(locale, localeSub as Record<string, unknown>, namespace, leaf, errors);
    }
  }
}

for (const locale of PARTIAL_LOCALES) {
  validatePartialLocale(locale, PARTIAL_JA_NAMESPACES, errors);
}

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

console.log(`Marketing locales OK (${LOCALES.join(', ')} + partial ${PARTIAL_LOCALES.join(', ')})`);
