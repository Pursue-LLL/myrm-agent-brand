/**
 * [INPUT]
 * - cloud/CloudShell.tsx (POS: SaaS 页顶栏与页脚)
 * - cloud/*Section 各区块 (POS: SaaS 页分区展示)
 * - landing/landing-interaction.ts (POS: 滚动显现 / 进度条)
 *
 * [OUTPUT]
 * - LandingCloud: `/cloud` SaaS 页区块编排
 *
 * [POS]
 * SaaS 营销页主编排组件。详见 DUAL_PAGE_SYSTEM.md。
 */
'use client';

import { useRevealOnScroll, useScrollProgress } from '../landing/landing-interaction';
import MouseGlowLayer from '../MouseGlowLayer';
import CloudAdvantagesSection from './CloudAdvantagesSection';
import CloudFinalCtaSection from './CloudFinalCtaSection';
import CloudFaqSection from './CloudFaqSection';
import CloudHeroSection from './CloudHeroSection';
import CloudHowItWorksSection from './CloudHowItWorksSection';
import CloudPricingSection from './CloudPricingSection';
import CloudShell from './CloudShell';
import CloudTrustSection from './CloudTrustSection';
import CloudUseCasesSection from './CloudUseCasesSection';

export default function LandingCloud() {
  const containerRef = useRevealOnScroll();
  const scrollProgress = useScrollProgress();

  return (
    <CloudShell scrollProgress={scrollProgress}>
      <MouseGlowLayer />
      <div
        ref={containerRef}
        className="relative overflow-x-hidden"
      >
        <CloudHeroSection />

        {/* TODO: 正式产品截图就绪后恢复 WorkspacePreview 示意区块
            import WorkspacePreview from '../landing/WorkspacePreview';
            import { useTranslations } from 'next-intl';
            const t = useTranslations('cloud');
            <section className="relative mx-auto max-w-[900px] px-6 pb-10 sm:pb-14" aria-label={t('demo.preview.alt')}>
              <div className="ed-reveal">
                <WorkspacePreview messagesNamespace="cloud" shell="shell" />
              </div>
              <p className="ed-reveal mt-4 text-center text-sm leading-relaxed" style={{ color: 'var(--ed-dim)' }}>
                {t('demo.caption')}
              </p>
            </section>
        */}

        <CloudAdvantagesSection />
        <CloudHowItWorksSection />
        <CloudUseCasesSection />
        <CloudPricingSection />
        <CloudTrustSection />
        <CloudFaqSection />
        <CloudFinalCtaSection />
      </div>
    </CloudShell>
  );
}
