/**
 * [INPUT]
 * - NEXT_PUBLIC_GITHUB_RELEASE_REPO 环境变量（默认 Pursue-LLL/myrm-agent）
 *
 * [OUTPUT]
 * - Desktop release manifest parsing, platform detection, embedded/live fetch, file size formatting
 *
 * [POS]
 * 桌面端安装包元数据单一入口；与 Tauri updater latest.json 共用同一数据源。
 */

export const DESKTOP_RELEASE_REPO =
  process.env.NEXT_PUBLIC_GITHUB_RELEASE_REPO ?? 'Pursue-LLL/myrm-agent';

export const EMBEDDED_RELEASE_PATH = '/desktop-release.json';

export type DesktopPlatformId =
  | 'macos-aarch64'
  | 'macos-x86_64'
  | 'windows-x86_64'
  | 'windows-aarch64'
  | 'linux-x86_64'
  | 'linux-aarch64';

export interface DesktopDownloadTarget {
  id: DesktopPlatformId;
  url: string;
  fileName: string;
  sha256Url: string | null;
  sha256: string | null;
  sizeBytes: number | null;
}

export interface DesktopReleaseInfo {
  version: string;
  pubDate: string | null;
  releaseNotes: string | null;
  targets: DesktopDownloadTarget[];
  source: 'embedded' | 'tauri-manifest' | 'github-api';
}

interface TauriPlatformArtifact {
  url: string;
  signature?: string;
}

interface TauriLatestManifest {
  version: string;
  notes?: string;
  pub_date?: string;
  platforms?: Record<string, TauriPlatformArtifact>;
}

interface GitHubReleaseAsset {
  name: string;
  browser_download_url: string;
  size?: number;
}

interface GitHubLatestRelease {
  tag_name: string;
  published_at: string;
  body: string | null;
  assets: GitHubReleaseAsset[];
}

const TAURI_PLATFORM_MAP: Record<string, DesktopPlatformId> = {
  'darwin-aarch64': 'macos-aarch64',
  'darwin-x86_64': 'macos-x86_64',
  'windows-x86_64': 'windows-x86_64',
  'windows-aarch64': 'windows-aarch64',
  'linux-x86_64': 'linux-x86_64',
  'linux-aarch64': 'linux-aarch64',
};

const PLATFORM_ORDER: DesktopPlatformId[] = [
  'macos-aarch64',
  'macos-x86_64',
  'windows-x86_64',
  'windows-aarch64',
  'linux-x86_64',
  'linux-aarch64',
];

export function getGitHubReleasesPageUrl(): string {
  return `https://github.com/${DESKTOP_RELEASE_REPO}/releases/latest`;
}

export function getDesktopManifestUrl(): string {
  return `${getGitHubReleasesPageUrl()}/download/latest.json`;
}

export function getGitHubLatestReleaseApiUrl(): string {
  return `https://api.github.com/repos/${DESKTOP_RELEASE_REPO}/releases/latest`;
}

export function formatFileSize(bytes: number | null): string {
  if (bytes === null || bytes <= 0) return '';
  const units = ['B', 'KB', 'MB', 'GB'] as const;
  let index = 0;
  let value = bytes;
  while (value >= 1024 && index < units.length - 1) {
    value /= 1024;
    index += 1;
  }
  const precision = index === 0 ? 0 : 1;
  return `${value.toFixed(precision)} ${units[index]}`;
}

function fileNameFromUrl(url: string): string {
  const segment = url.split('/').pop() ?? 'download';
  return segment.split('?')[0] ?? segment;
}

function sortTargets(targets: DesktopDownloadTarget[]): DesktopDownloadTarget[] {
  const order = new Map(PLATFORM_ORDER.map((id, index) => [id, index]));
  return [...targets].sort(
    (a, b) => (order.get(a.id) ?? 99) - (order.get(b.id) ?? 99),
  );
}

function dedupeTargets(targets: DesktopDownloadTarget[]): DesktopDownloadTarget[] {
  const seen = new Set<DesktopPlatformId>();
  const result: DesktopDownloadTarget[] = [];
  for (const target of targets) {
    if (seen.has(target.id)) continue;
    seen.add(target.id);
    result.push(target);
  }
  return sortTargets(result);
}

function findSha256AssetUrl(assets: GitHubReleaseAsset[], fileName: string): string | null {
  const checksumName = `${fileName}.sha256`;
  const match = assets.find((asset) => asset.name === checksumName);
  return match?.browser_download_url ?? null;
}

export function parseSha256FileContent(raw: string): string | null {
  const line = raw.trim().split('\n')[0]?.trim() ?? '';
  const token = line.split(/\s+/)[0] ?? '';
  if (/^[a-f0-9]{64}$/i.test(token)) return token.toLowerCase();
  return null;
}

export function parseTauriManifest(raw: TauriLatestManifest): DesktopReleaseInfo {
  const targets: DesktopDownloadTarget[] = [];
  const platforms = raw.platforms ?? {};

  for (const [tauriKey, artifact] of Object.entries(platforms)) {
    const id = TAURI_PLATFORM_MAP[tauriKey];
    if (!id || !artifact.url) continue;
    targets.push({
      id,
      url: artifact.url,
      fileName: fileNameFromUrl(artifact.url),
      sha256Url: null,
      sha256: null,
      sizeBytes: null,
    });
  }

  return {
    version: raw.version,
    pubDate: raw.pub_date ?? null,
    releaseNotes: raw.notes ?? null,
    targets: dedupeTargets(targets),
    source: 'tauri-manifest',
  };
}

function classifyGitHubAsset(name: string): DesktopPlatformId | null {
  const lower = name.toLowerCase();

  if (lower.endsWith('.dmg')) {
    if (lower.includes('aarch64') || lower.includes('arm64') || lower.includes('universal')) {
      return 'macos-aarch64';
    }
    if (lower.includes('x64') || lower.includes('x86_64') || lower.includes('intel')) {
      return 'macos-x86_64';
    }
    return 'macos-aarch64';
  }

  if (lower.endsWith('.msi') || lower.endsWith('.exe') || lower.endsWith('.nsis.zip')) {
    if (lower.includes('aarch64') || lower.includes('arm64')) {
      return 'windows-aarch64';
    }
    return 'windows-x86_64';
  }

  if (lower.endsWith('.appimage') || lower.endsWith('.deb') || lower.endsWith('.rpm')) {
    if (lower.includes('aarch64') || lower.includes('arm64')) {
      return 'linux-aarch64';
    }
    return 'linux-x86_64';
  }

  if (lower.endsWith('.tar.gz') && lower.includes('linux')) {
    if (lower.includes('aarch64') || lower.includes('arm64')) {
      return 'linux-aarch64';
    }
    return 'linux-x86_64';
  }

  return null;
}

export function parseGitHubRelease(raw: GitHubLatestRelease): DesktopReleaseInfo {
  const version = raw.tag_name.replace(/^v/i, '');
  const targets: DesktopDownloadTarget[] = [];

  for (const asset of raw.assets) {
    if (asset.name.endsWith('.sha256')) continue;
    const id = classifyGitHubAsset(asset.name);
    if (!id) continue;
    targets.push({
      id,
      url: asset.browser_download_url,
      fileName: asset.name,
      sha256Url: findSha256AssetUrl(raw.assets, asset.name),
      sha256: null,
      sizeBytes: typeof asset.size === 'number' ? asset.size : null,
    });
  }

  return {
    version,
    pubDate: raw.published_at,
    releaseNotes: raw.body,
    targets: dedupeTargets(targets),
    source: 'github-api',
  };
}

export interface PlatformDetection {
  platform: DesktopPlatformId | 'unknown';
  /** False when macOS is detected but Apple Silicon vs Intel cannot be determined reliably. */
  macArchConfirmed: boolean;
}

export function detectUserPlatform(): PlatformDetection {
  if (typeof navigator === 'undefined') {
    return { platform: 'unknown', macArchConfirmed: true };
  }

  const ua = navigator.userAgent.toLowerCase();
  const platform = (navigator.platform ?? '').toLowerCase();
  const uaData = (navigator as Navigator & {
    userAgentData?: { platform?: string; architecture?: string };
  }).userAgentData;

  if (uaData?.platform === 'macOS') {
    if (uaData.architecture === 'arm') {
      return { platform: 'macos-aarch64', macArchConfirmed: true };
    }
    if (uaData.architecture === 'x86') {
      return { platform: 'macos-x86_64', macArchConfirmed: true };
    }
    return { platform: 'macos-aarch64', macArchConfirmed: false };
  }

  if (ua.includes('win') || uaData?.platform === 'Windows') {
    if (ua.includes('arm64') || ua.includes('aarch64')) {
      return { platform: 'windows-aarch64', macArchConfirmed: true };
    }
    return { platform: 'windows-x86_64', macArchConfirmed: true };
  }

  if (ua.includes('mac') || platform.includes('mac')) {
    // Safari on Apple Silicon still reports "Intel Mac OS X" for compatibility.
    // If we reach here, userAgentData was unavailable, so we CANNOT reliably tell ARM vs Intel.
    // We must return false so the user is directed to the download page to choose manually.
    return { platform: 'macos-aarch64', macArchConfirmed: false };
  }

  if (ua.includes('linux') || ua.includes('x11') || platform.includes('linux')) {
    if (ua.includes('aarch64') || ua.includes('arm64')) {
      return { platform: 'linux-aarch64', macArchConfirmed: true };
    }
    return { platform: 'linux-x86_64', macArchConfirmed: true };
  }

  return { platform: 'unknown', macArchConfirmed: true };
}

export function resolveTargetForPlatform(
  release: DesktopReleaseInfo,
  platform: DesktopPlatformId | 'unknown',
): DesktopDownloadTarget | null {
  if (platform === 'unknown') return release.targets[0] ?? null;
  const exact = release.targets.find((target) => target.id === platform);
  if (exact) return exact;

  if (platform.startsWith('macos-')) {
    return release.targets.find((target) => target.id.startsWith('macos-')) ?? null;
  }
  if (platform.startsWith('windows-')) {
    return release.targets.find((target) => target.id.startsWith('windows-')) ?? null;
  }
  if (platform.startsWith('linux-')) {
    return release.targets.find((target) => target.id.startsWith('linux-')) ?? null;
  }

  return release.targets[0] ?? null;
}

async function fetchGitHubApiRelease(): Promise<DesktopReleaseInfo | null> {
  const apiResponse = await fetch(getGitHubLatestReleaseApiUrl(), {
    headers: { Accept: 'application/vnd.github+json' },
    cache: 'no-store',
  });

  if (!apiResponse.ok) return null;

  const release = (await apiResponse.json()) as GitHubLatestRelease;
  if (!release.assets?.length) return null;

  return parseGitHubRelease(release);
}

async function fetchTauriManifestRelease(): Promise<DesktopReleaseInfo | null> {
  try {
    const manifestResponse = await fetch(getDesktopManifestUrl(), {
      headers: { Accept: 'application/json' },
      cache: 'no-store',
    });
    if (!manifestResponse.ok) return null;

    const manifest = (await manifestResponse.json()) as TauriLatestManifest;
    if (!manifest.version || !manifest.platforms || Object.keys(manifest.platforms).length === 0) {
      return null;
    }
    return parseTauriManifest(manifest);
  } catch {
    return null;
  }
}

export async function fetchEmbeddedDesktopRelease(
  basePath: string = EMBEDDED_RELEASE_PATH,
): Promise<DesktopReleaseInfo | null> {
  try {
    const response = await fetch(basePath, { cache: 'no-store' });
    if (!response.ok) return null;
    const payload = (await response.json()) as DesktopReleaseInfo;
    if (!payload.version || !payload.targets?.length) return null;
    return { ...payload, source: 'embedded' };
  } catch {
    return null;
  }
}

export async function fetchDesktopRelease(): Promise<DesktopReleaseInfo> {
  const apiRelease = await fetchGitHubApiRelease();
  if (apiRelease) return apiRelease;

  const manifestRelease = await fetchTauriManifestRelease();
  if (manifestRelease) return manifestRelease;

  throw new Error('Failed to load desktop release');
}

export async function fetchSha256FromUrl(url: string): Promise<string | null> {
  try {
    const response = await fetch(url, { cache: 'no-store' });
    if (!response.ok) return null;
    const text = await response.text();
    return parseSha256FileContent(text);
  } catch {
    return null;
  }
}

export async function enrichReleaseWithInlineSha256(
  release: DesktopReleaseInfo,
): Promise<DesktopReleaseInfo> {
  const targets = await Promise.all(
    release.targets.map(async (target) => {
      if (target.sha256 || !target.sha256Url) return target;
      const sha256 = await fetchSha256FromUrl(target.sha256Url);
      return sha256 ? { ...target, sha256 } : target;
    }),
  );
  return { ...release, targets };
}
