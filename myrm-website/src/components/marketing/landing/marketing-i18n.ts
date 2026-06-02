/**
 * [INPUT]
 * - next-intl useTranslations('marketing')
 *
 * [OUTPUT]
 * - marketingHas: type-safe marketing namespace key existence check
 *
 * [POS]
 * 落地页动态 point 索引的 i18n 辅助，避免 any 断言。
 */
import type { useTranslations } from 'next-intl';

type MarketingTranslator = ReturnType<typeof useTranslations<'marketing'>>;
type MarketingMessageKey = Parameters<MarketingTranslator['has']>[0];

export function marketingHas(t: MarketingTranslator, key: string): boolean {
  return t.has(key as MarketingMessageKey);
}
