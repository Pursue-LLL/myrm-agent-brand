/**
 * [INPUT]
 * - next-intl::useLocale (POS: 营销站应用 locale)
 * - lib/docs-contract::appLocaleToDocsLocale (POS: 营销站 → Mintlify 路径契约)
 *
 * [OUTPUT]
 * - useDocsLocale(): Mintlify docs locale (`en` | `zh`) for outbound doc links
 *
 * [POS]
 * Client hook bridging next-intl app locale to docs.myrmagent.ai URL locale prefix.
 */
'use client';

import { useLocale } from 'next-intl';
import { appLocaleToDocsLocale, type DocsLocale } from '@/lib/docs-contract';

export function useDocsLocale(): DocsLocale {
  return appLocaleToDocsLocale(useLocale());
}
