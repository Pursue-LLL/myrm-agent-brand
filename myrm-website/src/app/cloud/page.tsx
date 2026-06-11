import type { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';
import LandingCloud from '@/components/marketing/cloud/LandingCloud';

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations('metadata');
  return {
    title: t('cloudPageTitle'),
    description: t('cloudPageDescription'),
    robots: { index: false, follow: false },
  };
}

export default function CloudPage() {
  return <LandingCloud />;
}
