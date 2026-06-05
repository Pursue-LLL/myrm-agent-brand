/**
 * [INPUT]
 * - NEXT_PUBLIC_APP_URL / NEXT_PUBLIC_DOCS_URL 环境变量
 * - lib/desktop-release.ts (POS: 桌面端安装包元数据单一入口)
 *
 * [OUTPUT]
 * - getAppUrl, getDocsUrl, getAppLoginRedirectUrl, getDesktopDownloadPath
 * - re-export: DESKTOP_RELEASE_REPO, getDesktopManifestUrl, getGitHubLatestReleaseApiUrl, getGitHubReleasesPageUrl
 * - deploy-paths.ts (POS: 部署路径 registry) builds on getAppUrl/getDocsUrl/getDesktopDownloadPath
 *
 * [POS]
 * 营销站外部链接统一入口。默认文档域名为 docs.myrmagent.ai（Mintlify 子域，非 Next 同构部署）。
 */
import type { DocsLocale } from '@/lib/docs-contract';
import {
  DESKTOP_RELEASE_REPO,
  getDesktopManifestUrl,
  getGitHubLatestReleaseApiUrl,
  getGitHubReleasesPageUrl,
} from '@/lib/desktop-release';

const APP_BASE_URL = process.env.NEXT_PUBLIC_APP_URL ?? 'https://app.myrmagent.ai';
const DOCS_BASE_URL = process.env.NEXT_PUBLIC_DOCS_URL ?? 'https://docs.myrmagent.ai';

export const DESKTOP_DOWNLOAD_PATH = '/download';

export function getAppUrl(path: string = '/'): string {
  return `${APP_BASE_URL}${path}`;
}

export function getDocsUrl(path: string = '/', locale: DocsLocale = 'en'): string {
  const normalized = path.startsWith('/') ? path : `/${path}`;
  const localized =
    locale === 'zh' && !normalized.startsWith('/zh/')
      ? `/zh${normalized}`
      : normalized;
  return `${DOCS_BASE_URL}${localized}`;
}

export function getDesktopDownloadPath(): string {
  return DESKTOP_DOWNLOAD_PATH;
}

export {
  DESKTOP_RELEASE_REPO,
  getDesktopManifestUrl,
  getGitHubLatestReleaseApiUrl,
  getGitHubReleasesPageUrl,
};

/** In-app path for Local/Tauri only (opens memory migration tab). Marketing site uses desktop download CTA instead. */
export const APP_MIGRATION_WIZARD_PATH = '/settings/memory?sub=migration';

/** Login URL that returns to an internal path after authentication. */
export function getAppLoginRedirectUrl(returnPath: string): string {
  const normalized = returnPath.startsWith('/') ? returnPath : `/${returnPath}`;
  if (normalized.startsWith('//') || normalized.includes('://')) {
    return getAppUrl('/auth/login');
  }
  return getAppUrl(`/auth/login?redirect=${encodeURIComponent(normalized)}`);
}
