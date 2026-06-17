/**
 * [INPUT]
 * - next-intl cloud.howItWorks.*
 * - cloud/cloud-marketing-keys::CLOUD_STEP_KEYS
 * - landing/interactive::TiltCard
 *
 * [OUTPUT]
 * - CloudHowItWorksSection: SaaS 页三步上手（TiltCard + 图标）
 *
 * [POS]
 * `/cloud` 上手流程区块；键契约由 cloud-marketing-keys 驱动。
 */
'use client';

import { useTranslations } from 'next-intl';
import { Login01Icon, PlayCircleIcon, TaskDone01Icon } from 'hugeicons-react';
import type { ComponentType } from 'react';
import { cn } from '@/lib/utils/classnameUtils';
import { TiltCard } from '../landing/interactive';
import { CLOUD_STEP_KEYS, type CloudStepKey } from './cloud-marketing-keys';

type IconProps = { className?: string; style?: React.CSSProperties };

const STEP_ICONS: Record<CloudStepKey, ComponentType<IconProps>> = {
  step1: Login01Icon,
  step2: PlayCircleIcon,
  step3: TaskDone01Icon,
};

export default function CloudHowItWorksSection() {
  const t = useTranslations('cloud');

  return (
    <section id="how-it-works" className="border-y py-20 sm:py-32" style={{ borderColor: 'var(--ed-border)', background: 'var(--ed-bg)' }}>
      <div className="mx-auto max-w-[1080px] px-6">
        <div className="ed-reveal text-center">
          <h2 className="text-[clamp(1.8rem,4vw,2.6rem)] font-semibold tracking-[-0.02em]">{t('howItWorks.title')}</h2>
          <p className="mt-4 text-[15px] font-light" style={{ color: 'var(--ed-dim)' }}>{t('howItWorks.subtitle')}</p>
        </div>
        <div className="mt-12 grid gap-6 md:grid-cols-3 sm:mt-16">
          {CLOUD_STEP_KEYS.map((stepKey, index) => {
            const Icon = STEP_ICONS[stepKey];
            return (
              <TiltCard
                key={stepKey}
                className={cn('ed-reveal ed-card relative rounded-2xl p-7 text-center', `ed-stagger-${(index % 3) + 1}`)}
                style={{ border: '1px solid var(--ed-border)', background: 'var(--ed-surface)' }}
              >
                <span className="ed-num" aria-hidden>{t(`howItWorks.steps.${stepKey}.num`)}</span>
                <div
                  className="ed-icon mx-auto inline-flex h-11 w-11 items-center justify-center rounded-xl"
                  style={{ background: 'var(--ed-accent-soft)', color: 'var(--ed-accent)' }}
                >
                  <Icon className="h-5 w-5" />
                </div>
                <h3 className="mt-5 text-lg font-semibold">{t(`howItWorks.steps.${stepKey}.title`)}</h3>
                <p className="mt-2 text-[14px] font-light leading-relaxed" style={{ color: 'var(--ed-dim)' }}>
                  {t(`howItWorks.steps.${stepKey}.description`)}
                </p>
              </TiltCard>
            );
          })}
        </div>
      </div>
    </section>
  );
}
