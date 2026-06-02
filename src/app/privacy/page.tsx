'use client';

import { useTranslations } from 'next-intl';
import LegalPage from '@/components/marketing/LegalPage';

const SECTION_KEYS = ['collection', 'usage', 'storage', 'sharing', 'rights', 'contact'] as const;

export default function PrivacyPage() {
  const t = useTranslations('marketing.legal.privacy');

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
