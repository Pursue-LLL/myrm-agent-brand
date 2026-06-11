/**
 * Cloud marketing site URL helpers (SaaS page only).
 */
import type { DocsLocale } from '@/lib/docs-contract';
import { getAppUrl } from '@/lib/deploy-mode';

function withCloudUtm(base: string, medium: string): string {
  const separator = base.includes('?') ? '&' : '?';
  return `${base}${separator}utm_source=website&utm_medium=${medium}&utm_campaign=cloud`;
}

export function getCloudLoginHref(appLocale: DocsLocale = 'en'): string {
  return withCloudUtm(getAppUrl('/auth/login', appLocale), 'cloud_nav');
}

export function getCloudRegisterHref(appLocale: DocsLocale = 'en'): string {
  return withCloudUtm(getAppUrl('/auth/login', appLocale), 'cloud_cta');
}

export function getCloudBillingHref(appLocale: DocsLocale = 'en'): string {
  return withCloudUtm(getAppUrl('/pricing', appLocale), 'cloud_billing');
}
