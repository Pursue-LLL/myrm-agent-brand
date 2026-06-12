/**
 * [INPUT]
 * - lib/deploy-mode.ts::getAppUrl (POS: 营销站外部链接统一入口)
 *
 * [OUTPUT]
 * - getCloudLoginHref / getCloudRegisterHref / getCloudBillingHref: SaaS App URL + UTM
 *
 * [POS]
 * 云页 App 跳转助手。仅 `/cloud` 使用，与 deploy-paths 隔离。
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
