'use client';

import { useTranslations } from 'next-intl';
import LegalPage from '@/components/marketing/LegalPage';

const SECTION_KEYS = ['overview', 'trial', 'proTrial', 'cancellation', 'refunds', 'disputes', 'exceptions', 'contact'] as const;

export default function RefundPage() {
  const t = useTranslations('marketing.legal.refund');

  return (
    <LegalPage
      title={t('title')}
      updatedAt={t('updatedAt')}
      intro={t('intro')}
      sections={SECTION_KEYS.map((key) => ({
        title: t(`sections.${key}.title`),
        body: t(`sections.${key}.body`),
      }))}
    />
  );
}
