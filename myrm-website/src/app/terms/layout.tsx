/**
 * [INPUT]
 * - next-intl metadata keys
 *
 * [OUTPUT]
 * - TermsLayout: 服务条款页 metadata 包装
 *
 * [POS]
 * `/terms` 路由布局（透传 children）。
 */
import type { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations('metadata');
  return {
    title: t('termsPageTitle'),
    description: t('termsPageDescription'),
  };
}

export default function TermsLayout({ children }: { children: React.ReactNode }) {
  return children;
}
