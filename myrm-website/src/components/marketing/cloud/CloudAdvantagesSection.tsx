/**
 * [INPUT]
 * - next-intl cloud.advantages.*
 * - cloud/cloud-marketing-keys::CLOUD_ADVANTAGE_KEYS
 * - landing/interactive::TiltCard
 *
 * [OUTPUT]
 * - CloudAdvantagesSection: SaaS 页四项 Bento 优势卡
 *
 * [POS]
 * `/cloud` 转化能力区；键契约由 cloud-marketing-keys 驱动。
 */
'use client';

import { useTranslations } from 'next-intl';
import {
  Analytics01Icon,
  CloudIcon,
  SecurityIcon,
  TimeScheduleIcon,
} from 'hugeicons-react';
import type { ComponentType } from 'react';
import { cn } from '@/lib/utils/classnameUtils';
import { TiltCard } from '../landing/interactive';
import { CLOUD_ADVANTAGE_KEYS, type CloudAdvantageKey } from './cloud-marketing-keys';

type IconProps = { className?: string; style?: React.CSSProperties };

const ADVANTAGE_ICONS: Record<CloudAdvantageKey, ComponentType<IconProps>> = {
  zeroOps: CloudIcon,
  isolatedSandbox: SecurityIcon,
  wuBilling: Analytics01Icon,
  alwaysOn: TimeScheduleIcon,
};

const GLASS = {
  border: '1px solid color-mix(in oklch, var(--ed-border) 60%, transparent)',
  background: 'color-mix(in oklch, var(--ed-surface) 70%, transparent)',
  backdropFilter: 'blur(16px)',
  WebkitBackdropFilter: 'blur(16px)',
} as const;

export default function CloudAdvantagesSection() {
  const t = useTranslations('cloud');

  return (
    <section className="ed-section-alt py-20 sm:py-32">
      <div className="mx-auto max-w-[1080px] px-6">
        <div className="ed-reveal mx-auto max-w-md text-center">
          <h2 className="text-[clamp(1.8rem,4vw,2.6rem)] font-semibold tracking-[-0.02em]">
            {t('advantages.title')}
          </h2>
          <p className="mt-5 text-[15px] font-light leading-relaxed" style={{ color: 'var(--ed-dim)' }}>
            {t('advantages.subtitle')}
          </p>
        </div>
        <div className="mt-12 grid gap-6 sm:mt-16 sm:grid-cols-2">
          {CLOUD_ADVANTAGE_KEYS.map((key, index) => {
            const Icon = ADVANTAGE_ICONS[key];
            return (
              <TiltCard
                key={key}
                className={cn('ed-reveal ed-shimmer ed-card rounded-2xl overflow-hidden', `ed-stagger-${(index % 3) + 1}`)}
                style={GLASS}
              >
                <div className="relative flex min-h-[200px] flex-col p-6 sm:p-7">
                  <span className="ed-bento-idx ed-mono" aria-hidden>
                    {String(index + 1).padStart(2, '0')}
                  </span>
                  <div
                    className="ed-icon inline-flex h-10 w-10 items-center justify-center rounded-xl"
                    style={{ background: 'var(--ed-accent-soft)', color: 'var(--ed-accent)' }}
                  >
                    <Icon className="h-5 w-5" />
                  </div>
                  <p className="mt-4 text-[16px] font-semibold leading-snug sm:text-[17px]">
                    {t(`advantages.items.${key}.title`)}
                  </p>
                  <p className="mt-2 flex-1 text-[13px] font-light leading-relaxed" style={{ color: 'var(--ed-dim)' }}>
                    {t(`advantages.items.${key}.description`)}
                  </p>
                </div>
              </TiltCard>
            );
          })}
        </div>
      </div>
    </section>
  );
}
