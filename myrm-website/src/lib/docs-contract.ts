/**
 * [INPUT]
 * - myrm-docs/docs.json navigation pages (validated by scripts/validate-docs-slugs.ts)
 *
 * [OUTPUT]
 * - MARKETING_DOC_PATHS, localizedDocsPath, appLocaleToDocsLocale (en | zh | ko | ja)
 *
 * [POS]
 * Single source of truth for marketing → Mintlify slug contract.
 */

/** Paths appended to NEXT_PUBLIC_DOCS_URL (no trailing slash on base). */
export const MARKETING_DOC_PATHS = [
  '/getting-started/quickstart',
  '/getting-started/competitor-comparison',
  '/getting-started/desktop-app',
] as const;

export type MarketingDocPath = (typeof MARKETING_DOC_PATHS)[number];

export const LOCAL_DEPLOY_DOCS_PATH: MarketingDocPath = '/getting-started/quickstart';

export const COMPETITOR_COMPARISON_DOC_PATH: MarketingDocPath =
  '/getting-started/competitor-comparison';

export const DESKTOP_APP_DOC_PATH: MarketingDocPath =
  '/getting-started/desktop-app';

/** Mintlify zh locale prefix on docs.myrmagent.ai (see myrm-docs/docs/zh/). */
export const DOCS_ZH_URL_PREFIX = '/zh';

/** Mintlify ko locale prefix on docs.myrmagent.ai (see myrm-docs/docs/ko/). */
export const DOCS_KO_URL_PREFIX = '/ko';

/** Mintlify ja locale prefix on docs.myrmagent.ai (see myrm-docs/docs/ja/). */
export const DOCS_JA_URL_PREFIX = '/ja';

export type DocsLocale = 'en' | 'zh' | 'ko' | 'ja';

const DOCS_LOCALE_PREFIX: Record<Exclude<DocsLocale, 'en'>, string> = {
  zh: DOCS_ZH_URL_PREFIX,
  ko: DOCS_KO_URL_PREFIX,
  ja: DOCS_JA_URL_PREFIX,
};

/** Map canonical marketing doc path to docs.myrmagent.ai URL path for the given locale. */
export function localizedDocsPath(path: MarketingDocPath, locale: DocsLocale): string {
  if (locale === 'en') return path;
  return `${DOCS_LOCALE_PREFIX[locale]}${path}`;
}

/** Map next-intl app locale to Mintlify docs locale. */
export function appLocaleToDocsLocale(appLocale: string): DocsLocale {
  if (appLocale === 'zh') return 'zh';
  if (appLocale === 'ko') return 'ko';
  if (appLocale === 'ja') return 'ja';
  return 'en';
}
