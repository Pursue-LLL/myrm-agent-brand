/**
 * [INPUT]
 * - components/download/DownloadPageContent.tsx (POS: 下载页编排)
 * - components/download/DesktopReleaseProvider.tsx (POS: 桌面 release React 上下文边界)
 * - components/marketing/MarketingShell.tsx (POS: 非 Landing 营销页的共享壳层)
 *
 * [OUTPUT]
 * - DownloadPage: `/download` 桌面端下载路由
 *
 * [POS]
 * 桌面下载转化页路由入口。
 */
import type { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';
import DownloadPageContent from '@/components/download/DownloadPageContent';
import { DesktopReleaseProvider } from '@/components/download/DesktopReleaseProvider';
import MarketingShell from '@/components/marketing/MarketingShell';

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations('marketing.download');
  return {
    title: t('metaTitle'),
    description: t('metaDescription'),
  };
}

export default function DownloadPage() {
  return (
    <MarketingShell>
      <DesktopReleaseProvider>
        <DownloadPageContent />
      </DesktopReleaseProvider>
    </MarketingShell>
  );
}
