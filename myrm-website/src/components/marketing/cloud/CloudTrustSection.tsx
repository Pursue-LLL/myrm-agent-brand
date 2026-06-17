/**
 * [INPUT]
 * - next-intl cloud.trust.*
 * - cloud/cloud-marketing-keys::CLOUD_TRUST_KEYS
 *
 * [OUTPUT]
 * - CloudTrustSection: Creem MoR / 安全 / 支持信任条
 *
 * [POS]
 * `/cloud` 商户过审与转化信任区；键契约由 cloud-marketing-keys 驱动。
 */
'use client';

import Link from 'next/link';
import { useTranslations } from 'next-intl';
import { CreditCardIcon, CustomerSupportIcon, SecurityIcon } from 'hugeicons-react';
import type { ComponentType } from 'react';
import { cn } from '@/lib/utils/classnameUtils';
import { CLOUD_TRUST_KEYS, type CloudTrustKey } from './cloud-marketing-keys';

type IconProps = { className?: string; style?: React.CSSProperties };

const TRUST_ICONS: Record<CloudTrustKey, ComponentType<IconProps>> = {
  creem: CreditCardIcon,
  security: SecurityIcon,
  support: CustomerSupportIcon,
};

export default function CloudTrustSection() {
  const t = useTranslations('cloud');

  return (
    <section className="ed-section-alt border-y py-16 sm:py-24" style={{ borderColor: 'var(--ed-border)' }}>
      <div className="mx-auto max-w-[1080px] px-6">
        <div className="ed-reveal mx-auto max-w-lg text-center">
          <h2 className="text-[clamp(1.6rem,3.5vw,2.2rem)] font-semibold tracking-[-0.02em]">
            {t('trust.title')}
          </h2>
          <p className="mt-4 text-[14px] font-light leading-relaxed" style={{ color: 'var(--ed-dim)' }}>
            {t('trust.subtitle')}
          </p>
        </div>
        <div className="mt-12 grid gap-6 sm:grid-cols-3">
          {CLOUD_TRUST_KEYS.map((key, index) => {
            const Icon = TRUST_ICONS[key];
            return (
              <div
                key={key}
                className={cn('ed-reveal rounded-2xl p-6 text-center', `ed-stagger-${(index % 3) + 1}`)}
                style={{ border: '1px solid var(--ed-border)', background: 'var(--ed-surface)' }}
              >
                <div
                  className="mx-auto inline-flex h-11 w-11 items-center justify-center rounded-xl"
                  style={{ background: 'var(--ed-accent-soft)', color: 'var(--ed-accent)' }}
                >
                  <Icon className="h-5 w-5" />
                </div>
                <h3 className="mt-4 text-[15px] font-semibold">{t(`trust.items.${key}.title`)}</h3>
                <p className="mt-2 text-[13px] font-light leading-relaxed" style={{ color: 'var(--ed-dim)' }}>
                  {t(`trust.items.${key}.description`)}
                </p>
              </div>
            );
          })}
        </div>
        <div className="ed-reveal mt-10 flex flex-wrap items-center justify-center gap-4 text-[13px]" style={{ color: 'var(--ed-dim)' }}>
          <Link href="/privacy" className="font-medium transition-colors hover:text-[var(--ed-accent)]">
            {t('footer.privacy')}
          </Link>
          <span aria-hidden>·</span>
          <Link href="/terms" className="font-medium transition-colors hover:text-[var(--ed-accent)]">
            {t('footer.terms')}
          </Link>
          <span aria-hidden>·</span>
          <Link href="/refund" className="font-medium transition-colors hover:text-[var(--ed-accent)]">
            {t('footer.refund')}
          </Link>
        </div>
      </div>
    </section>
  );
}
