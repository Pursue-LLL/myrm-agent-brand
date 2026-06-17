/**
 * [INPUT]
 * - locales cloud.* keys（由 validate-marketing-locales 校验）
 *
 * [OUTPUT]
 * - CLOUD_*_KEYS: 云页 i18n 键契约
 *
 * [POS]
 * 云页定价/FAQ/步骤/优势/场景/信任 i18n 键 SSOT，供 LandingCloud 与 validate 脚本共用。
 * 定价 USD/WU 须与 CP billing/catalog.py + plans.py 保持一致；`validate-marketing-locales.ts` 在 build 前自动校验。
 */
export const CLOUD_PLAN_KEYS = ['free', 'companion', 'plus', 'pro', 'max'] as const;

export type CloudPlanKey = (typeof CLOUD_PLAN_KEYS)[number];

export const HIGHLIGHT_CLOUD_PLAN: CloudPlanKey = 'companion';

export const CLOUD_FAQ_KEYS = [
  'billing',
  'data',
  'cancel',
  'selfHost',
  'topup',
  'byok',
  'sandboxSpec',
] as const;

export type CloudFaqKey = (typeof CLOUD_FAQ_KEYS)[number];

export const CLOUD_STEP_KEYS = ['step1', 'step2', 'step3'] as const;

export type CloudStepKey = (typeof CLOUD_STEP_KEYS)[number];

export const CLOUD_ADVANTAGE_KEYS = ['zeroOps', 'isolatedSandbox', 'wuBilling', 'alwaysOn'] as const;

export type CloudAdvantageKey = (typeof CLOUD_ADVANTAGE_KEYS)[number];

export const CLOUD_USE_CASE_KEYS = ['research', 'coding', 'automation'] as const;

export type CloudUseCaseKey = (typeof CLOUD_USE_CASE_KEYS)[number];

export const CLOUD_TRUST_KEYS = ['creem', 'security', 'support'] as const;

export type CloudTrustKey = (typeof CLOUD_TRUST_KEYS)[number];
