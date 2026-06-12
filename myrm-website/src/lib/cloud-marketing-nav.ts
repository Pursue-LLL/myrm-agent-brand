/**
 * [INPUT]
 * - next-intl cloud.nav keys
 *
 * [OUTPUT]
 * - buildCloudNavLinks: SaaS 页 Nav 链接列表
 *
 * [POS]
 * 云页 Nav DRY 定义，防止 LandingCloud / CloudShell 漂移。
 */
export type CloudNavLink = {
  href: string;
  label: string;
  external?: true;
};

type NavTranslate = (key: string) => string;

export function buildCloudNavLinks(t: NavTranslate, homePrefix = ''): CloudNavLink[] {
  return [
    { href: `${homePrefix}#how-it-works`, label: t('nav.howItWorks') },
    { href: `${homePrefix}#pricing`, label: t('nav.pricing') },
    { href: `${homePrefix}#faq`, label: t('nav.faq') },
    { href: '/', label: t('nav.selfHost') },
  ];
}
