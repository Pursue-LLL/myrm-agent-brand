/**
 * [INPUT]
 * - next-intl marketing.hero.title / hero.subtitleLines
 * - landing/PathStrip (POS: Final CTA 双路径 chip 导航条)
 * - landing/HeroTypography::MultilineHeading (POS: Hero 多行标题排版)
 *
 * [OUTPUT]
 * - FinalCtaSection: 首页底部 Final CTA（标题 + PathStrip）
 *
 * [POS]
 * OSS Landing 页尾转化区块；Hero 主按钮已在上方，此处仅重复叙事 + 路径 chip。
 */
'use client';

import { useTranslations } from 'next-intl';
import PathStrip from './PathStrip';
import { HeroSubtitleCarousel, MultilineHeading } from './HeroTypography';

export default function FinalCtaSection() {
  const t = useTranslations('marketing');

  return (
    <section className="py-20 text-center sm:py-36" style={{ borderTop: '1px solid var(--ed-border)' }}>
      <div className="ed-reveal mx-auto max-w-[480px] px-6">
        <h2
          className="text-[clamp(1.8rem,4vw,2.8rem)] font-semibold tracking-[-0.02em]"
          style={{ fontFamily: 'var(--ed-serif)' }}
        >
          <MultilineHeading text={t('hero.title')} />
        </h2>
        <HeroSubtitleCarousel size="compact" className="mt-5" />
        <PathStrip className="mt-8" showHint={false} />
      </div>
    </section>
  );
}
