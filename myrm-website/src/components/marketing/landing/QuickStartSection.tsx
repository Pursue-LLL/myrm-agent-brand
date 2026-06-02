/**
 * [INPUT]
 * - next-intl marketing.quickStart.*
 * - deploy-path-context (POS: 部署路径 Tab 单源状态)
 * - deploy-paths (POS: 部署路径 registry)
 * - QuickStartPanel (POS: OpenClaw 风格 code-block)
 *
 * [OUTPUT]
 * - QuickStartSection: 标题 + 统一 code-block 快速开始区
 *
 * [POS]
 * Landing 快速开始区块；深链格式 `?path=local#quickstart`。
 */
'use client';

import { useTranslations } from 'next-intl';
import { quickStartTabToDeployPath, type QuickStartTabKey } from '@/lib/deploy-paths';
import { useDeployPath } from '@/components/marketing/landing/deploy-path-context';
import QuickStartPanel from '@/components/marketing/landing/QuickStartPanel';

export default function QuickStartSection() {
  const t = useTranslations('marketing');
  const { activeTab, selectPath } = useDeployPath();

  const handleTabClick = (tab: QuickStartTabKey): void => {
    selectPath(quickStartTabToDeployPath(tab), 'quickstart');
  };

  return (
    <section id="quickstart" className="ed-section-main pt-6 pb-20 sm:pt-8 sm:pb-32">
      <div className="mx-auto max-w-[780px] px-6">
        <div className="ed-reveal mx-auto max-w-md text-center">
          <h2 className="text-[clamp(1.8rem,4vw,2.6rem)] font-semibold tracking-[-0.02em]">
            <span className="ed-quickstart-accent ed-mono mr-2" aria-hidden>
              ⟩
            </span>
            {t('quickStart.title')}
          </h2>
          <p className="mt-5 text-[15px] leading-relaxed font-light" style={{ color: 'var(--ed-dim)' }}>
            {t('quickStart.subtitle')}
          </p>
        </div>
        <div className="ed-reveal mt-8">
          <QuickStartPanel activeTab={activeTab} onTabClick={handleTabClick} />
          <p className="ed-quickstart-note mt-4 text-center text-[13px] leading-relaxed font-light" style={{ color: 'var(--ed-dim)' }}>
            {t('quickStart.note')}
          </p>
        </div>
      </div>
    </section>
  );
}
