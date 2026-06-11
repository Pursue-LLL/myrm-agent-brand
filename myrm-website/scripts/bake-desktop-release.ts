/**
 * CI build step: fetch latest GitHub release and write public/desktop-release.json
 * for instant same-origin load on the static marketing site.
 */
import { mkdirSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import {
  enrichReleaseWithInlineSha256,
  getGitHubLatestReleaseApiUrl,
  getGitHubReleaseByTagApiUrl,
  normalizeDesktopReleaseTag,
  parseDesktopVersionFromWebsiteTag,
  parseGitHubRelease,
  type DesktopReleaseInfo,
} from '../src/lib/desktop-release';

const rootDir = path.dirname(path.dirname(fileURLToPath(import.meta.url)));
const outputPath = path.join(rootDir, 'public', 'desktop-release.json');

const EMPTY_RELEASE: DesktopReleaseInfo = {
  version: '',
  pubDate: null,
  releaseNotes: null,
  targets: [],
  source: 'embedded',
};

function isBakeableRelease(release: DesktopReleaseInfo): boolean {
  return release.version.trim() !== '' && release.targets.length > 0;
}

function requireNonEmptyBake(): boolean {
  return process.env.REQUIRE_BAKED_RELEASE === '1';
}

function assertBakeableOrExit(release: DesktopReleaseInfo): void {
  if (isBakeableRelease(release) || !requireNonEmptyBake()) {
    return;
  }
  console.error(
    '[bake-desktop-release] REQUIRE_BAKED_RELEASE=1 but no bakeable GitHub release (empty version or targets).',
  );
  process.exit(1);
}

function resolvePinnedDesktopReleaseTag(): string | null {
  const explicitTag = process.env.DESKTOP_RELEASE_TAG?.trim();
  if (explicitTag) {
    return normalizeDesktopReleaseTag(explicitTag);
  }

  const desktopVersion = process.env.DESKTOP_VERSION?.trim();
  if (desktopVersion) {
    return normalizeDesktopReleaseTag(desktopVersion);
  }

  const websiteTag = process.env.WEBSITE_RELEASE_TAG?.trim();
  if (websiteTag) {
    return normalizeDesktopReleaseTag(parseDesktopVersionFromWebsiteTag(websiteTag));
  }

  return null;
}

async function fetchReleaseFromGitHub(token?: string): Promise<DesktopReleaseInfo | null> {
  const headers: Record<string, string> = { Accept: 'application/vnd.github+json' };
  if (token) headers.Authorization = `Bearer ${token}`;

  const pinnedTag = resolvePinnedDesktopReleaseTag();
  const apiUrl = pinnedTag
    ? getGitHubReleaseByTagApiUrl(pinnedTag)
    : getGitHubLatestReleaseApiUrl();
  if (pinnedTag) {
    console.info(`[bake-desktop-release] Pinning GitHub release tag: ${pinnedTag}`);
  }

  const response = await fetch(apiUrl, { headers });
  if (response.status === 404) {
    console.warn('[bake-desktop-release] No published GitHub release yet; writing empty manifest.');
    return null;
  }
  if (!response.ok) {
    throw new Error(`GitHub API failed: ${response.status} ${response.statusText}`);
  }

  const payload = await response.json();
  const release = parseGitHubRelease(payload as Parameters<typeof parseGitHubRelease>[0]);
  if (release.targets.length === 0) return null;
  return enrichReleaseWithInlineSha256(release);
}

async function main(): Promise<void> {
  const token = process.env.GITHUB_TOKEN ?? process.env.GH_TOKEN;
  let release: DesktopReleaseInfo = EMPTY_RELEASE;

  try {
    const fetched = await fetchReleaseFromGitHub(token);
    if (fetched) {
      release = { ...fetched, source: 'embedded' };
      console.info(
        `[bake-desktop-release] Baked v${release.version} with ${release.targets.length} targets.`,
      );
    } else {
      console.warn('[bake-desktop-release] No bakeable release yet; writing empty manifest.');
    }
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    console.error(`[bake-desktop-release] Failed: ${message}`);
    process.exit(1);
  }

  assertBakeableOrExit(release);

  mkdirSync(path.dirname(outputPath), { recursive: true });
  writeFileSync(outputPath, `${JSON.stringify(release, null, 2)}\n`, 'utf8');
  console.info(`[bake-desktop-release] Wrote ${outputPath}`);
}

void main();
