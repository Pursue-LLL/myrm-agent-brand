import { describe, expect, test } from 'bun:test';
import {
  DOCS_KO_URL_PREFIX,
  DOCS_ZH_URL_PREFIX,
  LOCAL_DEPLOY_DOCS_PATH,
  localizedDocsPath,
  appLocaleToDocsLocale,
} from '../src/lib/docs-contract';
import { getAppUrl, getDocsUrl } from '../src/lib/deploy-mode';

describe('localizedDocsPath', () => {
  test('keeps en paths unchanged', () => {
    expect(localizedDocsPath('/getting-started/quickstart', 'en')).toBe(
      '/getting-started/quickstart',
    );
  });

  test('prefixes zh paths with /zh', () => {
    expect(localizedDocsPath('/getting-started/quickstart', 'zh')).toBe(
      `${DOCS_ZH_URL_PREFIX}/getting-started/quickstart`,
    );
  });

  test('prefixes ko paths with /ko', () => {
    expect(localizedDocsPath('/getting-started/quickstart', 'ko')).toBe(
      `${DOCS_KO_URL_PREFIX}/getting-started/quickstart`,
    );
  });
});

describe('appLocaleToDocsLocale', () => {
  test('maps zh app locale to zh docs locale', () => {
    expect(appLocaleToDocsLocale('zh')).toBe('zh');
  });

  test('maps ko app locale to ko docs locale', () => {
    expect(appLocaleToDocsLocale('ko')).toBe('ko');
  });

  test('maps other app locales to en', () => {
    expect(appLocaleToDocsLocale('en')).toBe('en');
    expect(appLocaleToDocsLocale('ja')).toBe('en');
  });
});

describe('getDocsUrl locale', () => {
  test('returns en docs path by default', () => {
    expect(getDocsUrl(LOCAL_DEPLOY_DOCS_PATH)).toContain('/getting-started/quickstart');
    expect(getDocsUrl(LOCAL_DEPLOY_DOCS_PATH)).not.toContain('/zh/');
  });

  test('prefixes zh locale on docs base URL', () => {
    const url = getDocsUrl(LOCAL_DEPLOY_DOCS_PATH, 'zh');
    expect(url).toContain('docs.myrmagent.ai/zh/getting-started/quickstart');
  });

  test('prefixes ko locale on docs base URL', () => {
    const url = getDocsUrl(LOCAL_DEPLOY_DOCS_PATH, 'ko');
    expect(url).toContain('docs.myrmagent.ai/ko/getting-started/quickstart');
  });

  test('does not double-prefix zh paths', () => {
    const url = getDocsUrl('/zh/getting-started/quickstart', 'zh');
    expect(url).toContain('/zh/getting-started/quickstart');
    expect(url).not.toContain('/zh/zh/');
  });

  test('does not double-prefix ko paths', () => {
    const url = getDocsUrl('/ko/getting-started/quickstart', 'ko');
    expect(url).toContain('/ko/getting-started/quickstart');
    expect(url).not.toContain('/ko/ko/');
  });
});

describe('getAppUrl locale relay', () => {
  test('appends locale query for marketing → app handoff', () => {
    expect(getAppUrl('/auth/login', 'en')).toContain('locale=en');
    expect(getAppUrl('/auth/login', 'zh')).toContain('locale=zh');
    expect(getAppUrl('/auth/login', 'ko')).toContain('locale=ko');
  });

  test('merges locale with existing query params', () => {
    const url = getAppUrl('/auth/login?redirect=%2Fsettings', 'zh');
    expect(url).toContain('redirect=%2Fsettings');
    expect(url).toContain('locale=zh');
  });
});
