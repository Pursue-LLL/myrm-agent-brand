/**
 * Cloud page navigation links.
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
