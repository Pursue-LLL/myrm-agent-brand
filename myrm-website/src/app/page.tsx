/**
 * [INPUT]
 * - components/marketing/LandingEditorial.tsx (POS: 开源首页编排)
 * - next-intl metadata keys
 *
 * [OUTPUT]
 * - HomePage: `/` 开源 Landing 路由
 *
 * [POS]
 * App Router 首页入口。
 */
import type { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';
import LandingEditorial from '@/components/marketing/LandingEditorial';
import '@/components/marketing/landing/landing-editorial.css';

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations('metadata');
  return {
    title: t('landingPageTitle'),
    description: t('landingPageDescription'),
  };
}

export default function HomePage() {
  return <LandingEditorial />;
}
