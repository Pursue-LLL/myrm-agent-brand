import { describe, expect, test } from 'bun:test';
import {
  assertWorkingTreeClean,
  mapTagRevParseExitCode,
  normalizeWebsiteTag,
  resolveTagReleaseAction,
  WEBSITE_TAG_PATTERN,
} from './release-website';

describe('WEBSITE_TAG_PATTERN', () => {
  test('accepts semver website tags', () => {
    expect(WEBSITE_TAG_PATTERN.test('website-v1.2.0')).toBe(true);
    expect(WEBSITE_TAG_PATTERN.test('website-v0.1.0-stripe')).toBe(true);
  });

  test('rejects invalid tags', () => {
    expect(WEBSITE_TAG_PATTERN.test('v1.2.0')).toBe(false);
    expect(WEBSITE_TAG_PATTERN.test('website-v')).toBe(false);
  });
});

describe('normalizeWebsiteTag', () => {
  test('trims and returns valid tag', () => {
    expect(normalizeWebsiteTag('  website-v1.0.0  ')).toBe('website-v1.0.0');
  });

  test('throws on empty tag', () => {
    expect(() => normalizeWebsiteTag('')).toThrow('Missing tag argument');
  });

  test('throws on invalid format', () => {
    expect(() => normalizeWebsiteTag('bad-tag')).toThrow('Invalid tag');
  });
});

describe('resolveTagReleaseAction', () => {
  const head = 'abc1234567890abcdef1234567890abcdef123456';
  const other = 'def1234567890abcdef1234567890abcdef123456';

  test('returns create when tag is absent', () => {
    expect(resolveTagReleaseAction(null, head, 'website-v1.0.0')).toBe('create');
  });

  test('returns redeploy when tag matches HEAD', () => {
    expect(resolveTagReleaseAction(head, head, 'website-v1.0.0')).toBe('redeploy');
  });

  test('throws when tag points to a different commit', () => {
    expect(() => resolveTagReleaseAction(other, head, 'website-v1.0.0')).toThrow(
      'Tag website-v1.0.0 points to def1234 but HEAD is abc1234',
    );
  });
});

describe('assertWorkingTreeClean', () => {
  test('accepts empty porcelain output', () => {
    expect(() => assertWorkingTreeClean('')).not.toThrow();
    expect(() => assertWorkingTreeClean('  \n  ')).not.toThrow();
  });

  test('throws when porcelain has changes', () => {
    expect(() => assertWorkingTreeClean(' M README.md')).toThrow('Working tree is not clean');
    expect(() => assertWorkingTreeClean('?? temp.txt')).toThrow('Working tree is not clean');
  });
});

describe('mapTagRevParseExitCode', () => {
  test('returns missing for git unknown revision', () => {
    expect(mapTagRevParseExitCode(128)).toBe('missing');
  });

  test('returns rethrow for other exit codes', () => {
    expect(mapTagRevParseExitCode(1)).toBe('rethrow');
    expect(mapTagRevParseExitCode(undefined)).toBe('rethrow');
  });
});
