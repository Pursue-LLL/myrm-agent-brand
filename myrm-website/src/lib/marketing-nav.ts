/**
 * [INPUT]
 * - next-intl marketing.nav keys
 * - deploy-mode URL helpers (POS: 营销站外部链接统一入口)
 * - deploy-paths::getDeployPathHref (POS: 部署路径 registry)
 *
 * [OUTPUT]
 * - buildMarketingNavLinks: shared header navigation（桌面入口仅 ed-cta，无重复文字链）
 * - getMarketingRegisterHref / getMarketingQuickStartHref: Header vs Hero 次 CTA 深链
 *
 * [POS]
 * DRY nav definition — prevents LandingEditorial / MarketingShell drift.
 */
import type { DocsLocale } from '@/lib/docs-contract';
import { getDocsUrl } from '@/lib/deploy-mode';
import { getDeployPathHref, getDeployPathSectionLink } from '@/lib/deploy-paths';

export type MarketingNavLink = {
  href: string;
  label: string;
  external?: true;
  icon?: 'github';
};

type NavTranslate = (key: string) => string;

export function buildMarketingNavLinks(
  t: NavTranslate,
  options?: { homePrefix?: string; docsLocale?: DocsLocale },
): MarketingNavLink[] {
  const prefix = options?.homePrefix ?? '';
  const docsLocale = options?.docsLocale ?? 'en';

  return [
    { href: `${prefix}#features`, label: t('nav.features') },
    { href: `${prefix}#deploy`, label: t('nav.deploy') },
    { href: getDocsUrl('/', docsLocale), label: t('nav.docs'), external: true },
    {
      href: 'https://github.com/Pursue-LLL/myrm-agent',
      label: t('nav.openSource'),
      external: true,
      icon: 'github',
    },
    { href: '/cloud#pricing', label: t('nav.cloudPricing') },
    { href: `${prefix}#faq`, label: t('nav.faq') },
  ];
}

export function getMarketingRegisterHref(_appLocale: DocsLocale = 'en'): string {
  return getDeployPathHref('tauri');
}

export function getMarketingQuickStartHref(_appLocale: DocsLocale = 'en'): string {
  return getDeployPathSectionLink('quickstart', 'localWebui');
}

export function getMarketingLoginHref(appLocale: DocsLocale = 'en'): string {
  return getDeployPathHref('localWebui', appLocale);
}
