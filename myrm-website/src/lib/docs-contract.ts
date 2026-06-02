/**
 * [INPUT]
 * - myrm-docs/docs.json navigation pages (validated by scripts/validate-docs-slugs.ts)
 *
 * [OUTPUT]
 * - MARKETING_DOC_PATHS: URL paths on docs.myrmagent.ai linked from the marketing site
 *
 * [POS]
 * Single source of truth for marketing → Mintlify slug contract.
 */

/** Paths appended to NEXT_PUBLIC_DOCS_URL (no trailing slash on base). */
export const MARKETING_DOC_PATHS = [
  '/getting-started/quickstart',
  '/getting-started/competitor-comparison',
] as const;

export type MarketingDocPath = (typeof MARKETING_DOC_PATHS)[number];

export const LOCAL_DEPLOY_DOCS_PATH: MarketingDocPath = '/getting-started/quickstart';

export const COMPETITOR_COMPARISON_DOC_PATH: MarketingDocPath =
  '/getting-started/competitor-comparison';
