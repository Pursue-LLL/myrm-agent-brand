import { getRequestConfig } from 'next-intl/server';

import enMessages from '#locales/en.json';
import zhMessages from '#locales/zh.json';

import { defaultLocale, defaultTimeZone, type Locale } from './config';

type Messages = typeof zhMessages;

const messagesByLocale: Record<Locale, Messages> = {
  en: enMessages as unknown as Messages,
  zh: zhMessages,
};

/** Static export: build-time locale only; runtime switching is client-side (LocaleRootProvider). */
export default getRequestConfig(async () => ({
  locale: defaultLocale,
  messages: messagesByLocale[defaultLocale],
  timeZone: defaultTimeZone,
}));
