/**
 * [INPUT]
 * - 无运行时依赖
 *
 * [OUTPUT]
 * - locales / defaultLocale / defaultTimeZone: i18n 常量 SSOT
 *
 * [POS]
 * 营销站 locale 配置单一入口。
 */
export type Locale = (typeof locales)[number];

export const locales = ['zh', 'en'] as const;
export const defaultLocale: Locale = 'zh';
/** Fixed timezone avoids next-intl ENVIRONMENT_FALLBACK / SSR–CSR date mismatches. */
export const defaultTimeZone = 'Asia/Shanghai';
