/**
 * [INPUT]
 * - next-intl cloud.hero.*
 * - lib/cloud-paths.ts (POS: 云页 App 跳转助手)
 * - landing/HeroTypography::MultilineHeading / DifferentiatorStrip
 * - landing/interactive::MagneticButton
 *
 * [OUTPUT]
 * - CloudHeroSection: SaaS 页 Hero（editorial 动效 + CTA）
 *
 * [POS]
 * `/cloud` 首屏转化区。
 */
'use client';

import { useLocale, useTranslations } from 'next-intl';
import { ArrowRight02Icon } from 'hugeicons-react';
import { Button } from '@/components/ui/button';
import type { Locale } from '@/i18n/config';
import { getCloudRegisterHref } from '@/lib/cloud-paths';
import { DifferentiatorStrip, MultilineHeading } from '../landing/HeroTypography';
import { MagneticButton } from '../landing/interactive';

export default function CloudHeroSection() {
  const t = useTranslations('cloud');
  const appLocale = useLocale() as Locale;
  const registerHref = getCloudRegisterHref(appLocale);

  return (
    <section className="relative mx-auto max-w-[1080px] px-6 pt-24 pb-10 sm:pt-32 sm:pb-14">
      <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-primary/40 to-transparent" />
      <div className="relative mx-auto max-w-[620px] text-center">
        <p
          className="mb-6 text-[10px] uppercase tracking-[0.25em] font-medium ed-mono ed-hero-sub"
          style={{ color: 'var(--ed-accent)' }}
        >
          {t('hero.badge')}
        </p>
        <h1 className="ed-hero-title ed-text-gradient text-[clamp(2.4rem,6vw,3.8rem)] font-semibold leading-[1.12] tracking-[-0.03em]">
          <MultilineHeading text={t('hero.title')} />
        </h1>
        <p className="ed-hero-sub mt-8 text-[17px] leading-relaxed font-light" style={{ color: 'var(--ed-dim)' }}>
          {t('hero.subtitle')}
        </p>
        <DifferentiatorStrip text={t('hero.differentiator')} />
        <div className="ed-hero-cta mt-10 flex flex-col items-center justify-center gap-3 sm:flex-row">
          <MagneticButton>
            <Button asChild size="lg" className="ed-cta rounded-full border-0 px-8 text-white" style={{ background: 'var(--ed-accent-gradient)' }}>
              <a href={registerHref}>
                {t('hero.ctaPrimary')}
                <ArrowRight02Icon className="ml-2 h-4 w-4" />
              </a>
            </Button>
          </MagneticButton>
          <MagneticButton>
            <Button asChild variant="outline" size="lg" className="ed-secondary-cta rounded-full px-8">
              <a href="#pricing">{t('hero.ctaSecondary')}</a>
            </Button>
          </MagneticButton>
        </div>
      </div>
    </section>
  );
}
