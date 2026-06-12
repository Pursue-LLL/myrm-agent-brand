/**
 * [INPUT]
 * - components/marketing/LegalPage.tsx (POS: 法务页通用排版)
 * - locales marketing.legal.terms keys
 *
 * [OUTPUT]
 * - TermsPage: `/terms` 服务条款
 *
 * [POS]
 * 服务条款路由页面。
 */
'use client';

import { useTranslations } from 'next-intl';
import LegalPage from '@/components/marketing/LegalPage';

const SECTION_KEYS = ['acceptance', 'service', 'accounts', 'billing', 'disputes', 'acceptableUse', 'liability', 'contact'] as const;

export default function TermsPage() {
  const t = useTranslations('marketing.legal.terms');

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
