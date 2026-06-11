import { describe, expect, test, afterEach } from 'bun:test';
import {
  detectUserPlatform,
  formatFileSize,
  getGitHubReleaseByTagApiUrl,
  normalizeDesktopReleaseTag,
  parseDesktopVersionFromWebsiteTag,
  parseGitHubRelease,
  parseSha256FileContent,
  parseTauriManifest,
  resolveTargetForPlatform,
} from '../src/lib/desktop-release';

describe('desktop release tag helpers', () => {
  test('normalizes semver to v-prefixed tag', () => {
    expect(normalizeDesktopReleaseTag('0.1.27')).toBe('v0.1.27');
    expect(normalizeDesktopReleaseTag('v0.1.27')).toBe('v0.1.27');
  });

  test('parses desktop version from website tag', () => {
    expect(parseDesktopVersionFromWebsiteTag('website-v0.1.27')).toBe('0.1.27');
  });

  test('builds GitHub release-by-tag API URL', () => {
    expect(getGitHubReleaseByTagApiUrl('0.1.27')).toContain('/releases/tags/v0.1.27');
  });
});

describe('parseTauriManifest', () => {
  test('maps tauri platform keys to desktop targets', () => {
    const release = parseTauriManifest({
      version: '0.2.0',
      pub_date: '2026-06-01T00:00:00Z',
      platforms: {
        'darwin-aarch64': { url: 'https://example.com/MyrmAgent_0.2.0_aarch64.dmg' },
        'windows-x86_64': { url: 'https://example.com/MyrmAgent_0.2.0_x64-setup.exe' },
      },
    });

    expect(release.version).toBe('0.2.0');
    expect(release.targets).toHaveLength(2);
    expect(release.targets[0]?.id).toBe('macos-aarch64');
    expect(release.targets[1]?.id).toBe('windows-x86_64');
  });
});

describe('parseGitHubRelease', () => {
  test('classifies assets and attaches sha256 sidecars', () => {
    const release = parseGitHubRelease({
      tag_name: 'v0.2.1',
      published_at: '2026-06-02T00:00:00Z',
      body: 'Release notes',
      assets: [
        {
          name: 'MyrmAgent_0.2.1_aarch64.dmg',
          browser_download_url: 'https://github.com/example/app/releases/download/v0.2.1/MyrmAgent_0.2.1_aarch64.dmg',
          size: 120_000_000,
        },
        {
          name: 'MyrmAgent_0.2.1_aarch64.dmg.sha256',
          browser_download_url: 'https://github.com/example/app/releases/download/v0.2.1/MyrmAgent_0.2.1_aarch64.dmg.sha256',
        },
        {
          name: 'MyrmAgent_0.2.1_x64-setup.exe',
          browser_download_url: 'https://github.com/example/app/releases/download/v0.2.1/MyrmAgent_0.2.1_x64-setup.exe',
        },
      ],
    });

    expect(release.version).toBe('0.2.1');
    expect(release.targets).toHaveLength(2);
    expect(release.targets[0]?.sha256Url).toContain('.sha256');
    expect(release.targets[0]?.sizeBytes).toBe(120_000_000);
  });

  test('classifies Tauri Linux AppImage.tar.gz without linux in filename', () => {
    const release = parseGitHubRelease({
      tag_name: 'v0.2.2',
      published_at: '2026-06-03T00:00:00Z',
      body: null,
      assets: [
        {
          name: 'MyrmAgent_0.2.2_amd64.AppImage.tar.gz',
          browser_download_url: 'https://github.com/example/app/releases/download/v0.2.2/MyrmAgent_0.2.2_amd64.AppImage.tar.gz',
        },
      ],
    });

    expect(release.targets).toHaveLength(1);
    expect(release.targets[0]?.id).toBe('linux-x86_64');
  });
});

describe('resolveTargetForPlatform', () => {
  test('falls back within the same OS family', () => {
    const release = parseGitHubRelease({
      tag_name: 'v0.2.1',
      published_at: '2026-06-02T00:00:00Z',
      body: null,
      assets: [
        {
          name: 'MyrmAgent_0.2.1_x64.dmg',
          browser_download_url: 'https://example.com/intel.dmg',
        },
      ],
    });

    const target = resolveTargetForPlatform(release, 'macos-aarch64');
    expect(target?.id).toBe('macos-x86_64');
  });
});

describe('parseSha256FileContent', () => {
  test('extracts hash from checksum file line', () => {
    const expected = 'a'.repeat(64);
    const hash = parseSha256FileContent(`${expected}  file.dmg\n`);
    expect(hash).toBe(expected);
  });
});

describe('formatFileSize', () => {
  test('formats megabytes', () => {
    expect(formatFileSize(120_000_000)).toBe('114.4 MB');
  });
});

describe('detectUserPlatform', () => {
  const originalNavigator = globalThis.navigator;
  const originalDocument = globalThis.document;

  afterEach(() => {
    globalThis.navigator = originalNavigator;
    globalThis.document = originalDocument;
  });

  test('returns a platform detection shape', () => {
    const detection = detectUserPlatform();
    expect(typeof detection.platform).toBe('string');
    expect(typeof detection.macArchConfirmed).toBe('boolean');
  });

  test('detects iPadOS spoofing macOS and returns unknown', () => {
    globalThis.navigator = {
      userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/15.0 Safari/605.1.15',
      platform: 'MacIntel',
      maxTouchPoints: 5,
    } as any;

    const detection = detectUserPlatform();
    expect(detection.platform).toBe('unknown');
    expect(detection.macArchConfirmed).toBe(true);
  });

  test('detects Mac Apple Silicon via WebGL even if UA says Intel Mac OS X', () => {
    globalThis.navigator = {
      userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)',
      platform: 'MacIntel',
      maxTouchPoints: 0,
    } as any;

    globalThis.document = {
      createElement: () => ({
        getContext: () => ({
          getExtension: () => ({ UNMASKED_RENDERER_WEBGL: 37446 }),
          getParameter: () => 'Apple M1',
        }),
      }),
    } as any;

    const detection = detectUserPlatform();
    expect(detection.platform).toBe('macos-aarch64');
    expect(detection.macArchConfirmed).toBe(true);
  });
});
