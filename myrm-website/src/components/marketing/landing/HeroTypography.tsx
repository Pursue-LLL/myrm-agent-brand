/**
 * [INPUT]
 * - next-intl marketing.hero / hero.differentiator
 *
 * [OUTPUT]
 * - MultilineHeading: gradient-safe multiline hero title
 * - DifferentiatorStrip: flex-wrapped feature chips
 *
 * [POS]
 * Hero typography helpers shared by LandingEditorial final CTA.
 */
'use client';

import { Fragment } from 'react';
import { useTranslations } from 'next-intl';
import { cn } from '@/lib/utils/classnameUtils';

export function MultilineHeading({ text }: { text: string }) {
  const lines = text.split('\n');

  return (
    <>
      {lines.map((line, index) => (
        <Fragment key={`${line}-${index}`}>
          {index > 0 ? <br /> : null}
          {line}
        </Fragment>
      ))}
    </>
  );
}

export function DifferentiatorStrip({ text }: { text: string }) {
  const items = text.split(' · ');

  return (
    <p
      className="ed-hero-sub mx-auto mt-6 flex max-w-[980px] flex-wrap justify-center gap-x-2 gap-y-1 px-2 text-center text-[12px] tracking-normal ed-mono md:flex-nowrap md:text-[13px]"
      style={{ color: 'var(--ed-accent)', animationDelay: '0.8s' }}
    >
      {items.map((item, index) => (
        <span key={item} className="inline-flex items-center whitespace-nowrap">
          {index > 0 ? <span aria-hidden="true" className="mr-2 opacity-70">·</span> : null}
          {item}
        </span>
      ))}
    </p>
  );
}

export function DifferentiatorStripFromLocale() {
  const t = useTranslations('marketing');
  return <DifferentiatorStrip text={t('hero.differentiator')} />;
}

const HERO_SUBTITLE_LINE_COUNT = 2;

type HeroSubtitleCarouselProps = {
  className?: string;
  size?: 'hero' | 'compact';
};

export function HeroSubtitleCarousel({ className, size = 'hero' }: HeroSubtitleCarouselProps) {
  const t = useTranslations('marketing');
  const lines = t.raw('hero.subtitleLines') as string[];
  const lineClass = size === 'compact'
    ? 'ed-hero-sub-carousel-line text-[15px] leading-relaxed font-light'
    : 'ed-hero-sub-carousel-line text-[18px] leading-[1.75] font-light';

  if (lines.length < HERO_SUBTITLE_LINE_COUNT) {
    return (
      <p
        className={cn(
          'ed-hero-sub font-light',
          size === 'compact' ? 'text-[15px] leading-relaxed' : 'mt-10 text-[18px] leading-[1.75]',
          className,
        )}
        style={{ color: 'var(--ed-dim)' }}
      >
        {lines[0] ?? ''}
      </p>
    );
  }

  return (
    <div
      className={cn(
        'ed-hero-sub ed-hero-sub-carousel',
        size === 'compact' ? 'ed-hero-sub-carousel-compact' : 'mt-10',
        className,
      )}
      aria-live="polite"
      aria-atomic="true"
    >
      <div className="ed-hero-sub-carousel-track">
        {lines.slice(0, HERO_SUBTITLE_LINE_COUNT).map((line) => (
          <p key={line} className={lineClass} style={{ color: 'var(--ed-dim)' }}>
            {line}
          </p>
        ))}
      </div>
    </div>
  );
}
