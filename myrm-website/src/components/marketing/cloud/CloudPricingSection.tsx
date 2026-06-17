/**
 * [INPUT]
 * - next-intl cloud.pricingPreview.*
 * - cloud/cloud-marketing-keys::CLOUD_PLAN_KEYS / HIGHLIGHT_CLOUD_PLAN
 * - lib/cloud-paths.ts (POS: 云页 App 跳转助手)
 *
 * [OUTPUT]
 * - CloudPricingSection: SaaS 页定价预览卡 + WU 说明条
 *
 * [POS]
 * `/cloud` 定价区块；静态 i18n 须与 CP catalog 对齐（validate-marketing-locales）。
 */
'use client';

import { useTranslations } from 'next-intl';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils/classnameUtils';
import { useDocsLocale } from '@/hooks/useDocsLocale';
import { getCloudBillingHref, getCloudRegisterHref } from '@/lib/cloud-paths';
import {
  CLOUD_PLAN_KEYS,
  HIGHLIGHT_CLOUD_PLAN,
} from './cloud-marketing-keys';

function readPlanFeatures(raw: unknown): string[] {
  if (!Array.isArray(raw)) return [];
  return raw.filter((item): item is string => typeof item === 'string');
}

export default function CloudPricingSection() {
  const t = useTranslations('cloud');
  const docsLocale = useDocsLocale();
  const registerHref = getCloudRegisterHref(docsLocale);

  return (
    <section id="pricing" className="py-20 sm:py-32">
      <div className="mx-auto max-w-[1200px] px-6">
        <div className="ed-reveal mb-10 text-center sm:mb-12">
          <h2 className="text-[clamp(1.8rem,4vw,2.6rem)] font-semibold tracking-[-0.02em]">
            {t('pricingPreview.title')}
          </h2>
          <p className="mt-4 text-[15px] font-light" style={{ color: 'var(--ed-dim)' }}>
            {t('pricingPreview.subtitle')}
          </p>
        </div>

        <div
          className="ed-reveal mx-auto mb-10 max-w-3xl rounded-2xl px-5 py-4 text-center text-[13px] font-light leading-relaxed sm:mb-12"
          style={{ border: '1px solid var(--ed-border)', background: 'var(--ed-accent-soft)', color: 'var(--ed-dim)' }}
        >
          {t('pricingPreview.wuExplainer')}
        </div>

        <div className="ed-reveal -mx-2 flex snap-x snap-mandatory gap-4 overflow-x-auto pb-4 md:mx-0 md:snap-none md:grid md:grid-cols-2 md:overflow-visible md:pb-0 lg:grid-cols-3 2xl:grid-cols-5">
          {CLOUD_PLAN_KEYS.map((planKey) => {
            const highlight = planKey === HIGHLIGHT_CLOUD_PLAN;
            const features = readPlanFeatures(t.raw(`pricingPreview.plans.${planKey}.features`));

            return (
              <div
                key={planKey}
                className={cn(
                  'relative flex min-w-[240px] snap-center flex-col rounded-2xl p-6 md:min-w-0',
                  highlight
                    ? 'border-2 shadow-lg'
                    : 'border',
                )}
                style={{
                  borderColor: highlight ? 'var(--ed-accent)' : 'var(--ed-border)',
                  background: highlight ? 'color-mix(in oklch, var(--ed-accent-soft) 60%, var(--ed-surface))' : 'var(--ed-surface)',
                  boxShadow: highlight ? '0 16px 40px var(--ed-accent-glow)' : undefined,
                }}
              >
                {highlight ? (
                  <span
                    className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full px-3 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-white ed-mono"
                    style={{ background: 'var(--ed-accent-gradient)' }}
                  >
                    {t('pricingPreview.recommended')}
                  </span>
                ) : null}
                <h3 className="font-bold">{t(`pricingPreview.plans.${planKey}.name`)}</h3>
                <div className="mt-4 flex items-baseline gap-1">
                  <span className="text-4xl font-black tracking-tight">
                    {t(`pricingPreview.plans.${planKey}.price`)}
                  </span>
                  <span className="text-sm" style={{ color: 'var(--ed-dim)' }}>{t('pricingPreview.period')}</span>
                </div>
                <p
                  className="mt-3 rounded-lg px-3 py-2 text-sm font-semibold ed-mono"
                  style={{ background: 'var(--ed-bg)', border: '1px solid var(--ed-border)' }}
                >
                  {t(`pricingPreview.plans.${planKey}.wu`)}
                </p>
                <ul className="mt-5 flex-1 space-y-2 text-sm" style={{ color: 'var(--ed-dim)' }}>
                  {features.map((feature) => (
                    <li key={feature} className="flex items-start gap-2">
                      <svg className="mt-0.5 h-3.5 w-3.5 shrink-0" style={{ color: 'var(--ed-accent)' }} fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      {feature}
                    </li>
                  ))}
                </ul>
                <Button
                  asChild
                  className={cn('mt-6 w-full rounded-full', highlight && 'ed-cta border-0 text-white')}
                  variant={highlight ? 'default' : 'outline'}
                >
                  <a href={registerHref}>{t('nav.getStarted')}</a>
                </Button>
              </div>
            );
          })}
        </div>

        <p className="ed-reveal mt-10 text-center text-sm" style={{ color: 'var(--ed-dim)' }}>
          {t('pricingPreview.billingNote')}{' '}
          <a href={getCloudBillingHref(docsLocale)} className="font-medium transition-colors hover:text-[var(--ed-accent)]" style={{ color: 'var(--ed-accent)' }}>
            {t('pricingPreview.billingLink')} →
          </a>
        </p>
      </div>
    </section>
  );
}
