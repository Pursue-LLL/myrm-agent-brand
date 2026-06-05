import { describe, expect, test } from 'bun:test';
import {
  DOCS_ZH_URL_PREFIX,
  LOCAL_DEPLOY_DOCS_PATH,
  localizedDocsPath,
  appLocaleToDocsLocale,
} from '../src/lib/docs-contract';
import { getDocsUrl } from '../src/lib/deploy-mode';

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
});

describe('appLocaleToDocsLocale', () => {
  test('maps zh app locale to zh docs locale', () => {
    expect(appLocaleToDocsLocale('zh')).toBe('zh');
  });

  test('maps non-zh app locales to en', () => {
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

  test('does not double-prefix zh paths', () => {
    const url = getDocsUrl('/zh/getting-started/quickstart', 'zh');
    expect(url).toContain('/zh/getting-started/quickstart');
    expect(url).not.toContain('/zh/zh/');
  });
});
