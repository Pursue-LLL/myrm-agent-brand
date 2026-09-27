/**
 * [INPUT]
 * - i18n/config.ts (POS: locale 配置单一入口)
 * - locales/en.json、locales/zh.json、locales/ko.json、locales/ja.json
 *
 * [OUTPUT]
 * - getRequestConfig: next-intl 服务端消息加载（静态 export 固定 defaultLocale）
 *
 * [POS]
 * next-intl 构建时请求配置。运行时切换由 LocaleRootProvider 负责。
 */
import { getRequestConfig } from 'next-intl/server';

import enMessages from '#locales/en.json';
import jaMessages from '#locales/ja.json';
import koMessages from '#locales/ko.json';
import zhMessages from '#locales/zh.json';

import { defaultLocale, defaultTimeZone, type Locale } from './config';

type Messages = typeof zhMessages;

const messagesByLocale: Record<Locale, Messages> = {
  en: enMessages as unknown as Messages,
  ko: koMessages as unknown as Messages,
  zh: zhMessages,
  ja: jaMessages as unknown as Messages,
};

/** Static export: build-time locale only; runtime switching is client-side (LocaleRootProvider). */
export default getRequestConfig(async () => ({
  locale: defaultLocale,
  messages: messagesByLocale[defaultLocale],
  timeZone: defaultTimeZone,
}));
