/**
 * [INPUT]
 * - i18n/config.ts (POS: locale 配置单一入口)
 * - i18n/detectBrowserLocale.ts (POS: 首访浏览器语言检测 SSOT)
 * - locales/en.json、locales/zh.json、locales/ko.json、locales/ja.json（部分键，缺键回退 en）
 *
 * [OUTPUT]
 * - LocaleRootProvider: 客户端 locale 切换与 NextIntlClientProvider 注入
 * - useAppLocale: 子组件切换 locale
 *
 * [POS]
 * 静态 export 下的运行时 i18n 根。?locale= > localStorage > navigator；显式切换才持久化。
 */
'use client';

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { NextIntlClientProvider } from 'next-intl';

import enMessages from '#locales/en.json';
import jaMessages from '#locales/ja.json';
import koMessages from '#locales/ko.json';
import zhMessages from '#locales/zh.json';
import { defaultTimeZone, type Locale } from '@/i18n/config';
import { LOCALE_STORAGE_KEY, readInitialAppLocale } from '@/i18n/detectBrowserLocale';

type Messages = typeof enMessages;
type DeepPartial<T> = { [K in keyof T]?: T[K] extends object ? DeepPartial<T[K]> : T[K] };

/** Deep-merge overlay onto base: partial locales (ja) fall back to en per key. */
function mergeMessages(base: Messages, overlay: DeepPartial<Messages>): Messages {
  const out: Record<string, unknown> = { ...base };
  for (const [key, value] of Object.entries(overlay)) {
    if (
      value !== null &&
      typeof value === 'object' &&
      !Array.isArray(value) &&
      typeof out[key] === 'object' &&
      out[key] !== null
    ) {
      out[key] = mergeMessages(
        out[key] as Messages,
        value as DeepPartial<Messages>,
      );
    } else if (value !== undefined) {
      out[key] = value;
    }
  }
  return out as Messages;
}

const messagesByLocale = {
  en: enMessages,
  ko: koMessages,
  zh: zhMessages,
  ja: mergeMessages(enMessages, jaMessages as DeepPartial<Messages>),
} as const;

type LocaleContextValue = {
  setAppLocale: (locale: Locale) => void;
};

const LocaleContext = createContext<LocaleContextValue | null>(null);

export function useAppLocale(): LocaleContextValue {
  const ctx = useContext(LocaleContext);
  if (ctx === null) {
    throw new Error('useAppLocale must be used within LocaleRootProvider');
  }
  return ctx;
}

export function LocaleRootProvider({ children }: { children: React.ReactNode }) {
  const [locale, setLocale] = useState<Locale>(readInitialAppLocale);

  useEffect(() => {
    document.documentElement.lang = locale;
  }, [locale]);

  const setAppLocale = useCallback((next: Locale) => {
    localStorage.setItem(LOCALE_STORAGE_KEY, next);
    setLocale(next);
    document.documentElement.lang = next;
  }, []);

  const value = useMemo(() => ({ setAppLocale }), [setAppLocale]);

  return (
    <LocaleContext.Provider value={value}>
      <NextIntlClientProvider
        locale={locale}
        messages={messagesByLocale[locale]}
        timeZone={defaultTimeZone}
      >
        {children}
      </NextIntlClientProvider>
    </LocaleContext.Provider>
  );
}
