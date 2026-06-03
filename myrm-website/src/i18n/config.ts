export type Locale = (typeof locales)[number];

export const locales = ['zh', 'en'] as const;
export const defaultLocale: Locale = 'zh';
/** Fixed timezone avoids next-intl ENVIRONMENT_FALLBACK / SSR–CSR date mismatches. */
export const defaultTimeZone = 'Asia/Shanghai';
