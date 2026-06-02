'use client';

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { NextIntlClientProvider } from 'next-intl';

import enMessages from '#locales/en.json';
import zhMessages from '#locales/zh.json';
import { defaultLocale, type Locale } from '@/i18n/config';

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
      <NextIntlClientProvider locale={activeLocale} messages={messagesByLocale[activeLocale]}>
        {children}
      </NextIntlClientProvider>
    </LocaleContext.Provider>
  );
}
