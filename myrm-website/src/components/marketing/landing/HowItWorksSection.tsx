/**
 * [INPUT]
 * - next-intl marketing.howItWorks.*
 * - deploy-path-context (POS: 部署路径 Tab 单源状态)
 *
 * [OUTPUT]
 * - HowItWorksSection: 三部署路径 Tab + 各路径三步上手
 *
 * [POS]
 * Landing「三步开始」区块，与 QuickStart / Deploy 共用路径模型。
 */
'use client';

import { ArrowRight02Icon } from 'hugeicons-react';
import { useTranslations } from 'next-intl';
import { cn } from '@/lib/utils/classnameUtils';
import { DEPLOY_PATH_IDS } from '@/lib/deploy-paths';
import { useDeployPath } from '@/components/marketing/landing/deploy-path-context';

const STEP_KEYS = ['step1', 'step2', 'step3'] as const;

export default function HowItWorksSection() {
  const t = useTranslations('marketing');
  const { activePath, selectPath } = useDeployPath();

  return (
    <section id="how-it-works" className="ed-section-main pt-20 pb-8 sm:pt-32 sm:pb-10">
      <div className="mx-auto max-w-[1080px] px-6">
        <div className="ed-reveal mx-auto max-w-md text-center">
          <h2 className="text-[clamp(1.8rem,4vw,2.6rem)] font-semibold tracking-[-0.02em]">
            {t('howItWorks.title')}
          </h2>
          <p className="mt-5 text-[15px] leading-relaxed font-light" style={{ color: 'var(--ed-dim)' }}>
            {t('howItWorks.subtitle')}
          </p>
        </div>

        <div
          className="ed-reveal mt-8 flex flex-wrap items-center justify-center gap-1 overflow-x-auto"
          style={{ borderBottom: '1px solid var(--ed-border)' }}
          role="tablist"
          aria-label={t('howItWorks.title')}
        >
          {DEPLOY_PATH_IDS.map((pathId) => (
            <button
              key={pathId}
              type="button"
              role="tab"
              aria-selected={activePath === pathId}
              onClick={() => selectPath(pathId, 'how-it-works')}
              className={cn('ed-tab shrink-0 px-4 py-2.5 text-[12px] ed-mono', activePath === pathId ? 'ed-tab-active' : '')}
              style={{
                color: 'var(--ed-muted)',
                borderBottom: '2px solid transparent',
                borderBottomColor: activePath === pathId ? 'var(--ed-accent)' : 'transparent',
              }}
            >
              {t(`howItWorks.tabs.${pathId}`)}
            </button>
          ))}
        </div>

        <div
          className="mt-8 sm:mt-10 grid gap-6 md:grid-cols-3 md:gap-8"
          role="tabpanel"
          aria-live="polite"
        >
          {STEP_KEYS.map((stepKey, index) => (
            <div key={`${activePath}-${stepKey}`} className="relative">
              <div className="flex flex-col items-center text-center">
                <span
                  className="text-[64px] font-semibold leading-none tracking-tight"
                  style={{ fontFamily: 'var(--ed-serif)', color: 'var(--ed-border)' }}
                >
                  {t(`howItWorks.paths.${activePath}.steps.${stepKey}.num`)}
                </span>
                <h3 className="mt-5 text-[16px] font-semibold">
                  {t(`howItWorks.paths.${activePath}.steps.${stepKey}.title`)}
                </h3>
                <p className="mt-3 text-[14px] leading-[1.75] font-light" style={{ color: 'var(--ed-dim)' }}>
                  {t(`howItWorks.paths.${activePath}.steps.${stepKey}.description`)}
                </p>
              </div>
              {index < STEP_KEYS.length - 1 ? (
                <div
                  className="absolute right-0 top-[32px] hidden translate-x-1/2 md:block"
                  style={{ color: 'var(--ed-border)' }}
                >
                  <ArrowRight02Icon className="h-5 w-5" />
                </div>
              ) : null}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
