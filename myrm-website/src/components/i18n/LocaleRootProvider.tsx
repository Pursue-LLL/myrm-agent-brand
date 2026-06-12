/**
 * [INPUT]
 * - i18n/config.ts (POS: locale 配置单一入口)
 * - locales/en.json、locales/zh.json
 *
 * [OUTPUT]
 * - LocaleRootProvider: 客户端 locale 切换与 NextIntlClientProvider 注入
 * - useAppLocale: 子组件切换 locale
 *
 * [POS]
 * 静态 export 下的运行时 i18n 根。持久化 NEXT_LOCALE 至 localStorage。
 */
'use client';

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { NextIntlClientProvider } from 'next-intl';

import enMessages from '#locales/en.json';
import zhMessages from '#locales/zh.json';
import { defaultLocale, defaultTimeZone, type Locale } from '@/i18n/config';

const STORAGE_KEY = 'NEXT_LOCALE';

const messagesByLocale = {
  en: enMessages,
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
  const [locale, setLocale] = useState<Locale>(defaultLocale);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored === 'en' || stored === 'zh') {
      setLocale(stored);
      document.documentElement.lang = stored;
    }
    setHydrated(true);
  }, []);

  const setAppLocale = useCallback((next: Locale) => {
    localStorage.setItem(STORAGE_KEY, next);
    setLocale(next);
    document.documentElement.lang = next;
  }, []);

  const value = useMemo(() => ({ setAppLocale }), [setAppLocale]);
  const activeLocale = hydrated ? locale : defaultLocale;

  return (
    <LocaleContext.Provider value={value}>
      <NextIntlClientProvider
        locale={activeLocale}
        messages={messagesByLocale[activeLocale]}
        timeZone={defaultTimeZone}
      >
        {children}
      </NextIntlClientProvider>
    </LocaleContext.Provider>
  );
}
