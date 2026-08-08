/**
 * [INPUT]
 * - i18n/config.ts (POS: locale 配置单一入口)
 * - i18n/detectBrowserLocale.ts (POS: 首访浏览器语言检测 SSOT)
 * - locales/en.json、locales/zh.json、locales/ko.json
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
import koMessages from '#locales/ko.json';
import zhMessages from '#locales/zh.json';
import { defaultTimeZone, type Locale } from '@/i18n/config';
import { LOCALE_STORAGE_KEY, readInitialAppLocale } from '@/i18n/detectBrowserLocale';

const messagesByLocale = {
  en: enMessages,
  ko: koMessages,
  zh: zhMessages,
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
