import { describe, expect, test } from 'bun:test';
import { normalizeWebsiteTag, WEBSITE_TAG_PATTERN } from './release-website';

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
