import { describe, expect, test } from 'bun:test';
import {
  detectUserPlatform,
  formatFileSize,
  parseGitHubRelease,
  parseSha256FileContent,
  parseTauriManifest,
  resolveTargetForPlatform,
} from '../src/lib/desktop-release';

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
  test('returns a platform detection shape', () => {
    const detection = detectUserPlatform();
    expect(typeof detection.platform).toBe('string');
    expect(typeof detection.macArchConfirmed).toBe('boolean');
  });
});
