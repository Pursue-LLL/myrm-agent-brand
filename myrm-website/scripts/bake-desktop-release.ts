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

async function fetchReleaseFromGitHub(token?: string): Promise<DesktopReleaseInfo | null> {
  const headers: Record<string, string> = { Accept: 'application/vnd.github+json' };
  if (token) headers.Authorization = `Bearer ${token}`;

  const response = await fetch(getGitHubLatestReleaseApiUrl(), { headers });
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

  mkdirSync(path.dirname(outputPath), { recursive: true });
  writeFileSync(outputPath, `${JSON.stringify(release, null, 2)}\n`, 'utf8');
  console.info(`[bake-desktop-release] Wrote ${outputPath}`);
}

void main();
