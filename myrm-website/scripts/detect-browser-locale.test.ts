import { describe, expect, test } from 'bun:test';

import { defaultLocale } from '../src/i18n/config';
import {
  detectBrowserLocale,
  parseUrlLocaleParam,
  resolveInitialAppLocale,
} from '../src/i18n/detectBrowserLocale';

describe('detectBrowserLocale', () => {
  test('maps ko-KR and ko to ko', () => {
    expect(detectBrowserLocale('ko-KR')).toBe('ko');
    expect(detectBrowserLocale('ko')).toBe('ko');
    expect(detectBrowserLocale('ko-KR,ko;q=0.9,en-US;q=0.8')).toBe('ko');
  });

  test('maps zh variants to zh', () => {
    expect(detectBrowserLocale('zh-CN')).toBe('zh');
    expect(detectBrowserLocale('zh-TW')).toBe('zh');
    expect(detectBrowserLocale('zh-HK,en;q=0.8')).toBe('zh');
  });

  test('maps en variants to en', () => {
    expect(detectBrowserLocale('en-US')).toBe('en');
    expect(detectBrowserLocale('en-GB,en;q=0.9')).toBe('en');
  });

  test('falls back to defaultLocale for unsupported languages', () => {
    expect(detectBrowserLocale('ja-JP')).toBe(defaultLocale);
    expect(detectBrowserLocale('fr-FR,fr;q=0.9')).toBe(defaultLocale);
    expect(detectBrowserLocale(null)).toBe(defaultLocale);
    expect(detectBrowserLocale('')).toBe(defaultLocale);
  });

  test('respects tag priority order', () => {
    expect(detectBrowserLocale('fr-FR,ko;q=0.9,en;q=0.8')).toBe('ko');
  });
});

describe('parseUrlLocaleParam', () => {
  test('parses supported locale values', () => {
    expect(parseUrlLocaleParam('?locale=ko')).toBe('ko');
    expect(parseUrlLocaleParam('?locale=en&utm_source=email')).toBe('en');
    expect(parseUrlLocaleParam('locale=zh')).toBe('zh');
  });

  test('rejects unsupported locale values', () => {
    expect(parseUrlLocaleParam('?locale=fr')).toBeNull();
    expect(parseUrlLocaleParam('?locale=')).toBeNull();
    expect(parseUrlLocaleParam(null)).toBeNull();
  });
});

describe('resolveInitialAppLocale', () => {
  test('prefers url locale over stored locale and browser detection', () => {
    expect(resolveInitialAppLocale('en', 'ko-KR', 'ko')).toBe('ko');
    expect(resolveInitialAppLocale('zh', 'en-US', 'en')).toBe('en');
  });

  test('prefers stored locale over browser detection when url is absent', () => {
    expect(resolveInitialAppLocale('en', 'ko-KR', null)).toBe('en');
    expect(resolveInitialAppLocale('ko', 'en-US', null)).toBe('ko');
  });

  test('detects browser locale when storage and url are empty', () => {
    expect(resolveInitialAppLocale(null, 'ko-KR', null)).toBe('ko');
    expect(resolveInitialAppLocale(null, 'en-US', null)).toBe('en');
  });

  test('ignores invalid stored locale and falls back to browser detection', () => {
    expect(resolveInitialAppLocale('ja', 'ko-KR', null)).toBe('ko');
    expect(resolveInitialAppLocale('invalid', null, null)).toBe(defaultLocale);
  });
});
