/**
 * [INPUT]
 * - cloud/CloudShell.tsx (POS: SaaS 页顶栏与页脚)
 * - landing/WorkspacePreview.tsx (POS: 双页共用产品预览)
 * - lib/cloud-paths.ts (POS: 云页 App 跳转助手)
 * - cloud/cloud-marketing-keys.ts (POS: 云页 i18n 键契约)
 *
 * [OUTPUT]
 * - LandingCloud: `/cloud` SaaS 页区块编排
 *
 * [POS]
 * SaaS 营销页主编排组件。详见 DUAL_PAGE_SYSTEM.md。
 */
'use client';

import Link from 'next/link';
import { useTranslations } from 'next-intl';
import { ArrowRight02Icon } from 'hugeicons-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils/classnameUtils';
import { useDocsLocale } from '@/hooks/useDocsLocale';
import { getCloudBillingHref, getCloudRegisterHref } from '@/lib/cloud-paths';
import { MultilineHeading } from '../landing/HeroTypography';
import WorkspacePreview from '../landing/WorkspacePreview';
import CloudShell from './CloudShell';
import {
  CLOUD_FAQ_KEYS,
  CLOUD_PLAN_KEYS,
  CLOUD_STEP_KEYS,
  HIGHLIGHT_CLOUD_PLAN,
} from './cloud-marketing-keys';

function readPlanFeatures(raw: unknown): string[] {
  if (!Array.isArray(raw)) return [];
  return raw.filter((item): item is string => typeof item === 'string');
}

export default function LandingCloud() {
  const t = useTranslations('cloud');
  const docsLocale = useDocsLocale();
  const registerHref = getCloudRegisterHref(docsLocale);

  return (
    <CloudShell>
      {/* Hero */}
      <section className="relative mx-auto max-w-4xl px-4 pt-20 pb-8 sm:px-6 sm:pt-28 sm:pb-10 text-center">
        <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-primary/40 to-transparent" />
        <p className="inline-flex rounded-full border border-primary/25 bg-primary/[0.06] px-4 py-1 text-[11px] uppercase tracking-[0.28em] font-medium text-primary font-mono">
          {t('hero.badge')}
        </p>
        <h1 className="mt-8 text-[clamp(2.4rem,6vw,3.8rem)] font-bold tracking-tight leading-[1.12] bg-gradient-to-b from-foreground to-foreground/65 bg-clip-text text-transparent">
          <MultilineHeading text={t('hero.title')} />
        </h1>
        <p className="mx-auto mt-6 max-w-xl text-[17px] leading-relaxed text-muted-foreground">
          {t('hero.subtitle')}
        </p>
        <div className="mt-10 flex flex-col items-center justify-center gap-3 sm:flex-row">
          <Button asChild size="lg" className="rounded-full px-8">
            <a href={registerHref}>
              {t('hero.ctaPrimary')}
              <ArrowRight02Icon className="ml-2 h-4 w-4" />
            </a>
          </Button>
          <Button asChild variant="outline" size="lg" className="rounded-full px-8">
            <a href="#pricing">{t('hero.ctaSecondary')}</a>
          </Button>
        </div>
      </section>

      <section
        className="relative mx-auto max-w-[900px] px-4 pb-10 sm:px-6 sm:pb-14"
        aria-label={t('demo.preview.alt')}
      >
        <WorkspacePreview messagesNamespace="cloud" shell="shell" />
        <p className="mt-4 text-center text-sm leading-relaxed text-muted-foreground">{t('demo.caption')}</p>
      </section>

      {/* How it works */}
      <section id="how-it-works" className="border-y border-border/60 bg-muted/15 py-16 sm:py-24">
        <div className="mx-auto max-w-5xl px-4 sm:px-6">
          <div className="text-center">
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">{t('howItWorks.title')}</h2>
            <p className="mt-3 text-muted-foreground">{t('howItWorks.subtitle')}</p>
          </div>
          <div className="mt-12 grid gap-8 md:grid-cols-3">
            {CLOUD_STEP_KEYS.map((stepKey) => (
              <div
                key={stepKey}
                className="rounded-2xl border border-border/70 bg-card/80 p-6 text-center shadow-sm backdrop-blur-sm"
              >
                <span className="text-5xl font-bold text-border">{t(`howItWorks.steps.${stepKey}.num`)}</span>
                <h3 className="mt-4 text-lg font-semibold">{t(`howItWorks.steps.${stepKey}.title`)}</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                  {t(`howItWorks.steps.${stepKey}.description`)}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="py-16 sm:py-24">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <div className="mb-12 text-center">
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">{t('pricingPreview.title')}</h2>
            <p className="mt-3 text-muted-foreground">{t('pricingPreview.subtitle')}</p>
          </div>

          <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
            {CLOUD_PLAN_KEYS.map((planKey) => {
              const highlight = planKey === HIGHLIGHT_CLOUD_PLAN;
              const features = readPlanFeatures(t.raw(`pricingPreview.plans.${planKey}.features`));

              return (
                <div
                  key={planKey}
                  className={cn(
                    'flex flex-col rounded-2xl border p-6',
                    highlight ? 'border-primary shadow-lg shadow-primary/10 bg-primary/[0.03]' : 'border-border bg-card',
                  )}
                >
                  <h3 className="font-bold">{t(`pricingPreview.plans.${planKey}.name`)}</h3>
                  <div className="mt-4 flex items-baseline gap-1">
                    <span className="text-4xl font-black tracking-tight">
                      {t(`pricingPreview.plans.${planKey}.price`)}
                    </span>
                    <span className="text-sm text-muted-foreground">{t('pricingPreview.period')}</span>
                  </div>
                  <p className="mt-3 rounded-lg bg-muted/50 px-3 py-2 text-sm font-semibold">
                    {t(`pricingPreview.plans.${planKey}.wu`)}
                  </p>
                  <ul className="mt-5 flex-1 space-y-2 text-sm text-muted-foreground">
                    {features.map((feature) => (
                      <li key={feature} className="flex items-start gap-2">
                        <svg className="mt-0.5 h-3.5 w-3.5 shrink-0 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                        {feature}
                      </li>
                    ))}
                  </ul>
                  <Button asChild className="mt-6 w-full rounded-full" variant={highlight ? 'default' : 'outline'}>
                    <a href={registerHref}>{t('nav.getStarted')}</a>
                  </Button>
                </div>
              );
            })}
          </div>

          <p className="mt-10 text-center text-sm text-muted-foreground">
            {t('pricingPreview.billingNote')}{' '}
            <a href={getCloudBillingHref(docsLocale)} className="font-medium text-primary hover:underline">
              {t('pricingPreview.billingLink')} →
            </a>
          </p>
        </div>
      </section>

      {/* FAQ */}
      <section id="faq" className="border-t border-border/60 bg-muted/15 py-16 sm:py-24">
        <div className="mx-auto max-w-2xl px-4 sm:px-6">
          <h2 className="text-center text-3xl font-bold tracking-tight">{t('faq.title')}</h2>
          <div className="mt-10 space-y-0">
            {CLOUD_FAQ_KEYS.map((key) => (
              <details key={key} className="border-b border-border py-5 group">
                <summary className="cursor-pointer list-none text-[15px] font-medium flex justify-between gap-4">
                  {t(`faq.items.${key}.question`)}
                  <span className="text-muted-foreground group-open:rotate-45 transition-transform">+</span>
                </summary>
                <p className="mt-3 pb-2 text-sm leading-relaxed text-muted-foreground">
                  {t(`faq.items.${key}.answer`)}
                </p>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-16 sm:py-24 text-center">
        <div className="mx-auto max-w-lg px-4">
          <h2 className="text-2xl font-bold sm:text-3xl">{t('hero.title').replace('\n', ' ')}</h2>
          <p className="mt-4 text-muted-foreground">{t('hero.subtitle')}</p>
          <Button asChild size="lg" className="mt-8 rounded-full px-10">
            <a href={registerHref}>
              {t('hero.ctaPrimary')}
              <ArrowRight02Icon className="ml-2 h-4 w-4" />
            </a>
          </Button>
          <p className="mt-6 text-sm text-muted-foreground">
            <Link href="/" className="text-primary hover:underline">{t('footer.selfHostLink')}</Link>
          </p>
        </div>
      </section>
    </CloudShell>
  );
}
