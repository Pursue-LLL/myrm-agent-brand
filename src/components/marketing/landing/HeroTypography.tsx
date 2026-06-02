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
