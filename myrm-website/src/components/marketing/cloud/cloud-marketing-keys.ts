/**
 * [INPUT]
 * - locales cloud.* keys（由 validate-marketing-locales 校验）
 *
 * [OUTPUT]
 * - CLOUD_PLAN_KEYS / CLOUD_FAQ_KEYS / CLOUD_STEP_KEYS: 云页 i18n 键契约
 *
 * [POS]
 * 云页定价/FAQ/步骤 i18n 键 SSOT，供 LandingCloud 与 validate 脚本共用。
 * 定价 USD/WU 须与 CP billing/catalog.py + plans.py 保持一致；`validate-marketing-locales.ts` 在 build 前自动校验。
 */
export const CLOUD_PLAN_KEYS = ['free', 'companion', 'plus', 'pro', 'max'] as const;

export type CloudPlanKey = (typeof CLOUD_PLAN_KEYS)[number];

export const HIGHLIGHT_CLOUD_PLAN: CloudPlanKey = 'pro';

export const CLOUD_FAQ_KEYS = ['billing', 'data', 'cancel', 'selfHost'] as const;

export type CloudFaqKey = (typeof CLOUD_FAQ_KEYS)[number];

export const CLOUD_STEP_KEYS = ['step1', 'step2', 'step3'] as const;
