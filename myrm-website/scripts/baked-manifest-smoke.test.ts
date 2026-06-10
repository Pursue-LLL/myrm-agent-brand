/**
 * Post-bake smoke: ensure public/desktop-release.json is non-empty when a GitHub release exists.
 * Set REQUIRE_BAKED_RELEASE=1 in CI (website-release.yml) to fail on empty manifests.
 */
import { existsSync, readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, expect, test } from 'bun:test';
import type { DesktopReleaseInfo } from '../src/lib/desktop-release';

const manifestPath = path.join(
  path.dirname(path.dirname(fileURLToPath(import.meta.url))),
  'public',
  'desktop-release.json',
);

function readBakedManifest(): DesktopReleaseInfo | null {
  if (!existsSync(manifestPath)) return null;
  try {
    return JSON.parse(readFileSync(manifestPath, 'utf8')) as DesktopReleaseInfo;
  } catch {
    return null;
  }
}

describe('baked desktop-release.json smoke', () => {
  test('manifest file exists after bake step in build pipeline', () => {
    expect(existsSync(manifestPath)).toBe(true);
  });

  test('manifest has version and targets when REQUIRE_BAKED_RELEASE=1', () => {
    const manifest = readBakedManifest();
    expect(manifest).not.toBeNull();

    const requireNonEmpty = process.env.REQUIRE_BAKED_RELEASE === '1';
    if (!requireNonEmpty) {
      return;
    }

    expect(manifest?.version?.trim()).not.toBe('');
    expect(manifest?.targets?.length ?? 0).toBeGreaterThan(0);
    for (const target of manifest?.targets ?? []) {
      expect(target.url).toMatch(/^https:\/\//);
    }
  });
});
