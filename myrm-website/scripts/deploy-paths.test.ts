import { describe, expect, test, beforeEach, afterEach } from 'bun:test';
import {
  deployPathToCardKey,
  deployPathToQuickStartTab,
  getDeployPathHref,
  getDeployPathSectionLink,
  parseDeployPathFromQuery,
  quickStartTabToDeployPath,
  readDeployPathFromLocation,
} from '../src/lib/deploy-paths';

describe('parseDeployPathFromQuery', () => {
  test('maps quick-start tab aliases to deploy path ids', () => {
    expect(parseDeployPathFromQuery('local')).toBe('localWebui');
    expect(parseDeployPathFromQuery('desktop')).toBe('tauri');
    expect(parseDeployPathFromQuery('saas')).toBe('saas');
    expect(parseDeployPathFromQuery('localWebui')).toBe('localWebui');
    expect(parseDeployPathFromQuery('tauri')).toBe('tauri');
  });

  test('returns null for unknown values', () => {
    expect(parseDeployPathFromQuery(null)).toBeNull();
    expect(parseDeployPathFromQuery('')).toBeNull();
    expect(parseDeployPathFromQuery('cli')).toBeNull();
  });
});

describe('deploy path tab mapping', () => {
  test('round-trips between path ids and quick start tabs', () => {
    expect(deployPathToQuickStartTab('localWebui')).toBe('local');
    expect(quickStartTabToDeployPath('local')).toBe('localWebui');
    expect(deployPathToCardKey('tauri')).toBe('tauri');
  });
});

describe('getDeployPathSectionLink', () => {
  test('uses search param before hash for in-page deep links', () => {
    expect(getDeployPathSectionLink('quickstart', 'localWebui')).toBe('?path=local#quickstart');
    expect(getDeployPathSectionLink('how-it-works', 'saas')).toBe('?path=saas#how-it-works');
  });
});

describe('getDeployPathHref', () => {
  test('includes UTM params for SaaS and local docs links', () => {
    const saasHref = getDeployPathHref('saas');
    expect(saasHref).toContain('utm_source=website');
    expect(saasHref).toContain('utm_campaign=saas');
    expect(saasHref).toContain('locale=en');

    const localHref = getDeployPathHref('localWebui');
    expect(localHref).toContain('utm_campaign=localWebui');
    expect(localHref).toContain('/getting-started/quickstart');
  });

  test('appends zh locale for SaaS deploy path', () => {
    const saasZh = getDeployPathHref('saas', 'zh');
    expect(saasZh).toContain('locale=zh');
    expect(saasZh).toContain('utm_campaign=saas');
  });

  test('uses desktop download path for tauri', () => {
    expect(getDeployPathHref('tauri')).toBe('/download');
  });

  test('prefixes zh locale for local docs links', () => {
    const localZh = getDeployPathHref('localWebui', 'zh');
    expect(localZh).toContain('/zh/getting-started/quickstart');
    expect(localZh).toContain('utm_campaign=localWebui');
  });
});

describe('readDeployPathFromLocation', () => {
  const originalWindow = globalThis.window;

  beforeEach(() => {
    globalThis.window = {
      location: {
        search: '',
        hash: '',
        pathname: '/',
      },
    } as Window & typeof globalThis.window;
  });

  afterEach(() => {
    globalThis.window = originalWindow;
  });

  test('reads path from search params first', () => {
    (globalThis.window as Window).location.search = '?path=local';
    expect(readDeployPathFromLocation()).toBe('localWebui');
  });

  test('falls back to hash query when search param is absent', () => {
    (globalThis.window as Window).location.hash = '#quickstart?path=desktop';
    expect(readDeployPathFromLocation()).toBe('tauri');
  });

  test('returns null when no path is present', () => {
    expect(readDeployPathFromLocation()).toBeNull();
  });
});
