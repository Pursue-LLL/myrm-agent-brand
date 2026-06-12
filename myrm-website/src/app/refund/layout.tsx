/**
 * [INPUT]
 * - next-intl metadata keys
 *
 * [OUTPUT]
 * - RefundLayout: 退款页 metadata 包装（noindex）
 *
 * [POS]
 * `/refund` 路由布局（透传 children）。
 */
import type { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations('metadata');
  return {
    title: t('refundPageTitle'),
    description: t('refundPageDescription'),
    robots: { index: false, follow: false },
  };
}

export default function RefundLayout({ children }: { children: React.ReactNode }) {
  return children;
}
