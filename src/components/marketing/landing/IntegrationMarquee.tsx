'use client';

import { useTranslations } from 'next-intl';
import {
  ChannelMarqueeIcon,
  MARQUEE_CHANNELS,
  MARQUEE_MODELS,
  ModelMarqueeIcon,
  type MarqueeItem,
} from './integration-marquee-icons';

interface MarqueeRowProps {
  label: string;
  items: MarqueeItem[];
  reverse?: boolean;
  renderIcon: (id: string) => React.ReactNode;
}

function MarqueeRow({ label, items, reverse = false, renderIcon }: MarqueeRowProps) {
  const loop = [...items, ...items];

  return (
    <div className="relative">
      <p
        className="pointer-events-none absolute left-4 top-1/2 z-10 hidden -translate-y-1/2 text-[10px] font-medium uppercase tracking-[0.18em] ed-mono sm:block"
        style={{ color: 'var(--ed-muted)' }}
      >
        {label}
      </p>
      <div className="ed-marquee py-4">
        <div className={reverse ? 'ed-marquee-inner ed-marquee-reverse' : 'ed-marquee-inner'}>
          {[...Array(2)].map((_, setIdx) => (
            <div key={setIdx} className="flex items-center gap-10 sm:gap-12">
              {loop.map((item, i) => (
                <div
                  key={`${setIdx}-${item.id}-${i}`}
                  className="flex shrink-0 items-center gap-2.5"
                  title={item.name}
                >
                  <span className="flex h-8 w-8 items-center justify-center rounded-lg border border-border/50 bg-background/60">
                    {renderIcon(item.id)}
                  </span>
                  <span
                    className="whitespace-nowrap text-[12px] font-light tracking-wide ed-mono"
                    style={{ color: 'var(--ed-dim)' }}
                  >
                    {item.name}
                  </span>
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default function IntegrationMarquee() {
  const t = useTranslations('marketing.marquee');

  return (
    <div
      className="space-y-1 py-2"
      style={{ borderTop: '1px solid var(--ed-border)', borderBottom: '1px solid var(--ed-border)' }}
    >
      <MarqueeRow label={t('models')} items={MARQUEE_MODELS} renderIcon={(id) => <ModelMarqueeIcon id={id} />} />
      <MarqueeRow
        label={t('channels')}
        items={MARQUEE_CHANNELS}
        reverse
        renderIcon={(id) => <ChannelMarqueeIcon id={id} />}
      />
    </div>
  );
}
