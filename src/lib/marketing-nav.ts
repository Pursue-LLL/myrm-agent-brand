/**
 * [INPUT]
 * - next-intl marketing.nav keys
 * - deploy-mode URL helpers (POS: 营销站外部链接统一入口)
 * - deploy-paths::getDeployPathLoginHref, getDeployPathRegisterHref (POS: 部署路径 registry)
 *
 * [OUTPUT]
 * - buildMarketingNavLinks(): shared header navigation for landing + shell pages
 *
 * [POS]
 * DRY nav definition — prevents LandingEditorial / MarketingShell drift.
 */
import { getDesktopDownloadPath, getDocsUrl } from '@/lib/deploy-mode';
import { getDeployPathLoginHref, getDeployPathRegisterHref } from '@/lib/deploy-paths';

export type MarketingNavLink = {
  href: string;
  label: string;
  external?: true;
  icon?: 'github';
};

type NavTranslate = (key: string) => string;

export function buildMarketingNavLinks(
  t: NavTranslate,
  options?: { homePrefix?: string },
): MarketingNavLink[] {
  const prefix = options?.homePrefix ?? '';

  return [
    { href: `${prefix}#features`, label: t('nav.features') },
    { href: `${prefix}#deploy`, label: t('nav.deploy') },
    { href: getDocsUrl(), label: t('nav.docs'), external: true },
    { href: getDesktopDownloadPath(), label: t('nav.desktopDownload') },
    {
      href: 'https://github.com/myrmagent-ai',
      label: t('nav.openSource'),
      external: true,
      icon: 'github',
    },
    { href: '/pricing', label: t('nav.pricing') },
    { href: `${prefix}#faq`, label: t('nav.faq') },
  ];
}

export function getMarketingRegisterHref(): string {
  return getDeployPathRegisterHref();
}

export function getMarketingLoginHref(): string {
  return getDeployPathLoginHref();
}
