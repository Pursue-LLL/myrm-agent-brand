/**
 * [INPUT]
 * - next-intl metadata keys
 *
 * [OUTPUT]
 * - PrivacyLayout: 隐私页 metadata 包装
 *
 * [POS]
 * `/privacy` 路由布局（透传 children）。
 */
import type { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations('metadata');
  return {
    title: t('privacyPageTitle'),
    description: t('privacyPageDescription'),
  };
}

export default function PrivacyLayout({ children }: { children: React.ReactNode }) {
  return children;
}
