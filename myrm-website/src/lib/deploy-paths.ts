/**
 * [INPUT]
 * - deploy-mode URL helpers (POS: 营销站外部链接统一入口)
 *
 * [OUTPUT]
 * - DeployPathId, DEPLOY_PATH_IDS, path href/section-link/analytics helpers
 * - getLocalInstallOneliner / getLocalInstallOnelinerWindows (curl|bash / irm|iex)
 *
 * [POS]
 * Single source of truth for Local WebUI / Tauri deployment paths on the marketing site.
 * Cloud-hosted (SaaS) paths removed until launch — see docs/CLOUD_HOSTING_RESTORE.md.
 */
import { LOCAL_DEPLOY_DOCS_PATH, type DocsLocale } from '@/lib/docs-contract';
import { getDesktopDownloadPath, getDocsUrl } from '@/lib/deploy-mode';

export { LOCAL_DEPLOY_DOCS_PATH };

export const DEPLOY_PATH_IDS = ['localWebui', 'tauri'] as const;

export type DeployPathId = (typeof DEPLOY_PATH_IDS)[number];

export const DEFAULT_DEPLOY_PATH_ID: DeployPathId = 'localWebui';

/** i18n card keys under `marketing.deploy.{key}`. */
export type DeployCardKey = 'local' | 'tauri';

export type QuickStartTabKey = 'local' | 'desktop';

export const QUICK_START_TABS: readonly QuickStartTabKey[] = ['local', 'desktop'];

const QUICK_START_TAB_BY_PATH: Record<DeployPathId, QuickStartTabKey> = {
  localWebui: 'local',
  tauri: 'desktop',
};

const PATH_BY_QUICK_START_TAB: Record<QuickStartTabKey, DeployPathId> = {
  local: 'localWebui',
  desktop: 'tauri',
};

const CARD_KEY_BY_PATH: Record<DeployPathId, DeployCardKey> = {
  localWebui: 'local',
  tauri: 'tauri',
};

/** Public installer URL (Cloudflare Pages `_redirects` 307 → myrm-agent install-remote.sh on GitHub). */
export const LOCAL_INSTALL_SCRIPT_URL = 'https://myrmagent.ai/install.sh';

/** Windows installer (Cloudflare Pages `_redirects` 307 → install-remote.ps1). */
export const LOCAL_INSTALL_SCRIPT_PS1_URL = 'https://myrmagent.ai/install.ps1';

/** Raw GitHub fallback (same script as LOCAL_INSTALL_SCRIPT_URL). */
export const LOCAL_INSTALL_SCRIPT_RAW =
  'https://raw.githubusercontent.com/Pursue-LLL/myrm-agent/main/scripts/install-remote.sh';

export const LOCAL_INSTALL_SCRIPT_PS1_RAW =
  'https://raw.githubusercontent.com/Pursue-LLL/myrm-agent/main/scripts/install-remote.ps1';

export function getLocalInstallOneliner(): string {
  return `curl -fsSL ${LOCAL_INSTALL_SCRIPT_URL} | bash`;
}

export function getLocalInstallOnelinerWindows(): string {
  return `irm ${LOCAL_INSTALL_SCRIPT_PS1_URL} | iex`;
}

export const LOCAL_START_COMMAND = 'myrm start';

function withUtm(base: string, campaign: DeployPathId, medium: string): string {
  const separator = base.includes('?') ? '&' : '?';
  return `${base}${separator}utm_source=website&utm_medium=${medium}&utm_campaign=${campaign}`;
}

export function deployPathToQuickStartTab(pathId: DeployPathId): QuickStartTabKey {
  return QUICK_START_TAB_BY_PATH[pathId];
}

export function quickStartTabToDeployPath(tab: QuickStartTabKey): DeployPathId {
  return PATH_BY_QUICK_START_TAB[tab];
}

export function deployPathToCardKey(pathId: DeployPathId): DeployCardKey {
  return CARD_KEY_BY_PATH[pathId];
}

export function parseDeployPathFromQuery(value: string | null): DeployPathId | null {
  if (!value) return null;
  if (value === 'local') return 'localWebui';
  if (value === 'desktop') return 'tauri';
  if (value === 'localWebui' || value === 'tauri') {
    return value;
  }
  return null;
}

export function readDeployPathFromLocation(): DeployPathId | null {
  if (typeof window === 'undefined') return null;

  const fromSearch = parseDeployPathFromQuery(new URLSearchParams(window.location.search).get('path'));
  if (fromSearch) return fromSearch;

  const { hash } = window.location;
  const queryIndex = hash.indexOf('?');
  if (queryIndex === -1) return null;

  return parseDeployPathFromQuery(new URLSearchParams(hash.slice(queryIndex + 1)).get('path'));
}

export function getDeployPathHref(pathId: DeployPathId, docsLocale: DocsLocale = 'en'): string {
  switch (pathId) {
    case 'localWebui':
      return withUtm(getDocsUrl(LOCAL_DEPLOY_DOCS_PATH, docsLocale), pathId, 'deploy_path');
    case 'tauri':
      return getDesktopDownloadPath();
  }
}

/** In-page section link: `?path=local#quickstart` — hash id scrolls; search param selects tab. */
export function getDeployPathSectionLink(sectionId: string, pathId: DeployPathId): string {
  const tab = deployPathToQuickStartTab(pathId);
  return `?path=${tab}#${sectionId}`;
}

export function writeDeployPathSectionLink(sectionId: string, pathId: DeployPathId): void {
  const tab = deployPathToQuickStartTab(pathId);
  const nextUrl = `${window.location.pathname}?path=${tab}#${sectionId}`;
  window.history.replaceState(null, '', nextUrl);
}

export function scrollToSection(sectionId: string): void {
  document.getElementById(sectionId)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
}
