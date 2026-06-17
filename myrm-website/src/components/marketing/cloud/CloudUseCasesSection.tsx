/**
 * [INPUT]
 * - next-intl cloud.useCases.*
 * - cloud/cloud-marketing-keys::CLOUD_USE_CASE_KEYS
 * - landing/interactive::TiltCard
 *
 * [OUTPUT]
 * - CloudUseCasesSection: SaaS 页三场景用例卡
 *
 * [POS]
 * `/cloud` 场景展示区块；键契约由 cloud-marketing-keys 驱动。
 */
'use client';

import { useTranslations } from 'next-intl';
import { PencilEdit01Icon, RepeatIcon, Search01Icon } from 'hugeicons-react';
import { cn } from '@/lib/utils/classnameUtils';
import { TiltCard } from '../landing/interactive';
import { CLOUD_USE_CASE_KEYS, type CloudUseCaseKey } from './cloud-marketing-keys';

const USE_CASE_ICONS: Record<CloudUseCaseKey, typeof Search01Icon> = {
  research: Search01Icon,
  coding: PencilEdit01Icon,
  automation: RepeatIcon,
};

export default function CloudUseCasesSection() {
  const t = useTranslations('cloud');

  return (
    <section className="py-20 sm:py-32">
      <div className="mx-auto max-w-[1080px] px-6">
        <div className="ed-reveal mx-auto max-w-md text-center">
          <h2 className="text-[clamp(1.8rem,4vw,2.6rem)] font-semibold tracking-[-0.02em]">
            {t('useCases.title')}
          </h2>
          <p className="mt-5 text-[15px] font-light leading-relaxed" style={{ color: 'var(--ed-dim)' }}>
            {t('useCases.subtitle')}
          </p>
        </div>
        <div className="mt-12 grid gap-6 sm:mt-16 md:grid-cols-3">
          {CLOUD_USE_CASE_KEYS.map((key, index) => {
            const Icon = USE_CASE_ICONS[key];
            return (
              <TiltCard
                key={key}
                className={cn('ed-reveal ed-card rounded-2xl p-7', `ed-stagger-${(index % 3) + 1}`)}
                style={{ border: '1px solid var(--ed-border)', background: 'var(--ed-surface)' }}
              >
                <div className="mb-4 flex items-center gap-3">
                  <div
                    className="ed-icon inline-flex h-9 w-9 items-center justify-center rounded-lg"
                    style={{ background: 'var(--ed-accent-soft)' }}
                  >
                    <Icon className="h-[16px] w-[16px]" style={{ color: 'var(--ed-accent)' }} />
                  </div>
                  <span
                    className="text-[10px] font-medium uppercase tracking-[0.2em] ed-mono"
                    style={{ color: 'var(--ed-accent)' }}
                  >
                    {t(`useCases.items.${key}.tag`)}
                  </span>
                </div>
                <h3 className="text-[15px] font-semibold">{t(`useCases.items.${key}.title`)}</h3>
                <p className="mt-2 text-[14px] font-light leading-[1.75]" style={{ color: 'var(--ed-dim)' }}>
                  {t(`useCases.items.${key}.description`)}
                </p>
              </TiltCard>
            );
          })}
        </div>
      </div>
    </section>
  );
}
