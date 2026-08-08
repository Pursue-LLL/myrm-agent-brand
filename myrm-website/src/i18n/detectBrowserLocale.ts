/**
 * [INPUT]
 * - i18n/config.ts (POS: locale 配置单一入口)
 *
 * [OUTPUT]
 * - detectBrowserLocale(): 首访浏览器语言 → 支持的 marketing locale
 * - readNavigatorLanguage(): 读取 navigator.languages / navigator.language
 * - parseUrlLocaleParam(): 解析 `?locale=` 查询参数
 * - resolveInitialAppLocale(): URL > localStorage > navigator 优先级链
 * - readInitialAppLocale(): 客户端首 render locale SSOT
 * - LOCALE_STORAGE_KEY: localStorage 键名（与 App NEXT_LOCALE cookie 同名）
 *
 * [POS]
 * 静态 export 无法读 HTTP Accept-Language；客户端首访检测 SSOT。
 * 优先级：?locale= > localStorage > navigator。LocaleRootProvider 首 render 经 readInitialAppLocale 读取。
 */
import { defaultLocale, locales, type Locale } from '@/i18n/config';

export const LOCALE_STORAGE_KEY = 'NEXT_LOCALE';

const supportedSet = new Set<string>(locales);

function isSupportedLocale(value: string): value is Locale {
  return supportedSet.has(value);
}

/**
 * Match browser language tags to a supported marketing locale.
 * Accepts a comma-separated tag list (navigator.languages or Accept-Language shape).
 */
export function detectBrowserLocale(
  browserLanguage: string | null | undefined,
  supported: readonly Locale[] = locales,
  fallback: Locale = defaultLocale,
): Locale {
  if (!browserLanguage) {
    return fallback;
  }

  const tags = browserLanguage
    .split(',')
    .map((part) => part.trim().split(';')[0]?.trim().toLowerCase())
    .filter((tag): tag is string => Boolean(tag));

  for (const tag of tags) {
    if (tag === '*') {
      continue;
    }

    const exact = supported.find((locale) => locale.toLowerCase() === tag);
    if (exact) {
      return exact;
    }

    const prefix = tag.split('-')[0];
    const prefixMatch = supported.find((locale) => locale.toLowerCase() === prefix);
    if (prefixMatch) {
      return prefixMatch;
    }
  }

  return fallback;
}

export function readNavigatorLanguage(): string | null {
  if (typeof navigator === 'undefined') {
    return null;
  }

  const { languages, language } = navigator;
  if (languages.length > 0) {
    return languages.join(',');
  }

  return language ?? null;
}

/** Parse `?locale=` from a search string such as `?locale=ko&utm=...`. */
export function parseUrlLocaleParam(search: string | null | undefined): Locale | null {
  if (!search) {
    return null;
  }

  const normalized = search.startsWith('?') ? search : `?${search}`;
  const value = new URLSearchParams(normalized).get('locale');
  if (value === null || !isSupportedLocale(value)) {
    return null;
  }

  return value;
}

export function readUrlLocaleParam(): Locale | null {
  if (typeof window === 'undefined') {
    return null;
  }

  return parseUrlLocaleParam(window.location.search);
}

export function resolveInitialAppLocale(
  storedLocale: string | null,
  browserLanguage: string | null | undefined = readNavigatorLanguage(),
  urlLocale: Locale | null = readUrlLocaleParam(),
): Locale {
  if (urlLocale !== null) {
    return urlLocale;
  }

  if (storedLocale !== null && isSupportedLocale(storedLocale)) {
    return storedLocale;
  }

  return detectBrowserLocale(browserLanguage);
}

export function readInitialAppLocale(): Locale {
  if (typeof window === 'undefined') {
    return defaultLocale;
  }

  try {
    return resolveInitialAppLocale(localStorage.getItem(LOCALE_STORAGE_KEY));
  } catch {
    return resolveInitialAppLocale(null);
  }
}
