/**
 * Cloud landing i18n plan keys under `cloud.pricingPreview.plans.*`.
 */
export const CLOUD_PLAN_KEYS = ['free', 'companion', 'pro', 'max'] as const;

export type CloudPlanKey = (typeof CLOUD_PLAN_KEYS)[number];

export const HIGHLIGHT_CLOUD_PLAN: CloudPlanKey = 'pro';

export const CLOUD_FAQ_KEYS = ['billing', 'data', 'cancel', 'selfHost'] as const;

export type CloudFaqKey = (typeof CLOUD_FAQ_KEYS)[number];

export const CLOUD_STEP_KEYS = ['step1', 'step2', 'step3'] as const;
