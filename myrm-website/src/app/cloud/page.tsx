/**
 * [INPUT]
 * - components/marketing/cloud/LandingCloud.tsx (POS: SaaS 页编排)
 * - next-intl metadata keys
 *
 * [OUTPUT]
 * - CloudPage: `/cloud` SaaS Landing（indexable）
 *
 * [POS]
 * SaaS 营销页路由入口。详见 DUAL_PAGE_SYSTEM.md。
 */
import type { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';
import LandingCloud from '@/components/marketing/cloud/LandingCloud';

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations('metadata');
  return {
    title: t('cloudPageTitle'),
    description: t('cloudPageDescription'),
    robots: { index: true, follow: true },
  };
}

export default function CloudPage() {
  return <LandingCloud />;
}
