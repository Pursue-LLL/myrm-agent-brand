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
