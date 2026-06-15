/**
 * [INPUT]
 * - next-intl marketing.useCases.*
 * - marketing-keys::USE_CASE_KEYS (POS: 落地页 i18n 键清单)
 * - landing/interactive::TiltCard (POS: 磁吸/倾斜卡片交互)
 *
 * [OUTPUT]
 * - UseCasesSection: OSS 首页场景卡片网格
 *
 * [POS]
 * Landing 用例展示区块；四张 TiltCard，键契约由 marketing-keys 驱动。
 */
'use client';

import { useTranslations } from 'next-intl';
import {
  PencilEdit01Icon,
  RepeatIcon,
  Search01Icon,
  SourceCodeIcon,
} from 'hugeicons-react';
import { cn } from '@/lib/utils/classnameUtils';
import { TiltCard } from './interactive';
import { USE_CASE_KEYS, type UseCaseKey } from './marketing-keys';

const USE_CASE_ICONS: Record<UseCaseKey, typeof Search01Icon> = {
  research: Search01Icon,
  coding: SourceCodeIcon,
  automation: RepeatIcon,
  content: PencilEdit01Icon,
};

export default function UseCasesSection() {
  const t = useTranslations('marketing');

  return (
    <section className="ed-section-alt py-20 sm:py-40">
      <div className="mx-auto max-w-[1080px] px-6">
        <div className="ed-reveal mx-auto max-w-md text-center">
          <h2 className="text-[clamp(1.8rem,4vw,2.6rem)] font-semibold tracking-[-0.02em]">{t('useCases.title')}</h2>
          <p className="mt-5 text-[15px] font-light leading-relaxed" style={{ color: 'var(--ed-dim)' }}>
            {t('useCases.subtitle')}
          </p>
        </div>
        <div className="mt-12 grid gap-6 sm:mt-20 sm:grid-cols-2">
          {USE_CASE_KEYS.map((key, i) => {
            const Icon = USE_CASE_ICONS[key];
            return (
              <TiltCard
                key={key}
                className={cn('ed-reveal ed-card rounded-2xl p-7', `ed-stagger-${(i % 3) + 1}`)}
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
                <p
                  className="mt-4 rounded-lg px-4 py-3 text-[12px] font-light italic leading-relaxed ed-mono"
                  style={{ background: 'var(--ed-bg)', color: 'var(--ed-muted)', border: '1px solid var(--ed-border)' }}
                >
                  {t(`useCases.items.${key}.prompt`)}
                </p>
              </TiltCard>
            );
          })}
        </div>
      </div>
    </section>
  );
}
