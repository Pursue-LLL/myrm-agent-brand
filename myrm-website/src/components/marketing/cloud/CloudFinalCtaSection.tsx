/**
 * [INPUT]
 * - next-intl cloud.hero.* / cloud.footer.selfHostLink
 * - lib/cloud-paths.ts (POS: 云页 App 跳转助手)
 * - landing/HeroTypography::MultilineHeading
 * - landing/interactive::MagneticButton
 *
 * [OUTPUT]
 * - CloudFinalCtaSection: SaaS 页尾 Final CTA
 *
 * [POS]
 * `/cloud` 底部转化区块。
 */
'use client';

import Link from 'next/link';
import { useTranslations } from 'next-intl';
import { ArrowRight02Icon } from 'hugeicons-react';
import { Button } from '@/components/ui/button';
import { useDocsLocale } from '@/hooks/useDocsLocale';
import { getCloudRegisterHref } from '@/lib/cloud-paths';
import { MultilineHeading } from '../landing/HeroTypography';
import { MagneticButton } from '../landing/interactive';

export default function CloudFinalCtaSection() {
  const t = useTranslations('cloud');
  const docsLocale = useDocsLocale();
  const registerHref = getCloudRegisterHref(docsLocale);

  return (
    <section className="py-20 text-center sm:py-32" style={{ borderTop: '1px solid var(--ed-border)' }}>
      <div className="ed-reveal mx-auto max-w-[480px] px-6">
        <h2
          className="text-[clamp(1.8rem,4vw,2.8rem)] font-semibold tracking-[-0.02em]"
          style={{ fontFamily: 'var(--ed-serif)' }}
        >
          <MultilineHeading text={t('hero.title')} />
        </h2>
        <p className="mt-5 text-[15px] font-light leading-relaxed" style={{ color: 'var(--ed-dim)' }}>
          {t('hero.subtitle')}
        </p>
        <MagneticButton className="mt-8 inline-block">
          <Button asChild size="lg" className="ed-cta rounded-full border-0 px-10 text-white" style={{ background: 'var(--ed-accent-gradient)' }}>
            <a href={registerHref}>
              {t('hero.ctaPrimary')}
              <ArrowRight02Icon className="ml-2 h-4 w-4" />
            </a>
          </Button>
        </MagneticButton>
        <p className="mt-6 text-sm" style={{ color: 'var(--ed-dim)' }}>
          <Link href="/" className="font-medium transition-colors hover:text-[var(--ed-accent)]" style={{ color: 'var(--ed-accent)' }}>
            {t('footer.selfHostLink')} →
          </Link>
        </p>
      </div>
    </section>
  );
}
