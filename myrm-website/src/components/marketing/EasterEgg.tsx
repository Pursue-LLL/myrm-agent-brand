'use client';

import { useEffect, useState } from 'react';
import { useLocale } from 'next-intl';
import { useTranslations } from 'next-intl';
import { cn } from '@/lib/utils/classnameUtils';
import { TypewriterText } from './landing/interactive';

const EGG_COUNT = 50;

export const ALL_EASTER_EGG_KEYS = Array.from({ length: EGG_COUNT }, (_, i) => {
  const n = String(i + 1).padStart(2, '0');
  return `egg${n}` as const;
});

export type EasterEggKey = (typeof ALL_EASTER_EGG_KEYS)[number];

interface PlacedEgg {
  id: string;
  key: EasterEggKey;
  top: number;
  left: number;
  tone: 'teal' | 'warm';
}

function shuffle<T>(items: readonly T[]): T[] {
  const copy = [...items];
  for (let i = copy.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

function generatePlacements(): PlacedEgg[] {
  const keys = shuffle(ALL_EASTER_EGG_KEYS);
  const placed: PlacedEgg[] = [];

  for (const key of keys) {
    let top = 0;
    let left = 0;
    let attempts = 0;
    do {
      top = 3 + Math.random() * 94;
      left = 2 + Math.random() * 96;
      attempts += 1;
    } while (
      attempts < 40 &&
      placed.some((p) => Math.hypot(p.top - top, p.left - left) < 4.8)
    );
    placed.push({
      id: key,
      key,
      top,
      left,
      tone: Math.random() < 0.5 ? 'teal' : 'warm',
    });
  }

  return placed;
}

interface EasterEggProps {
  eggKey: EasterEggKey;
  tone?: 'teal' | 'warm';
  active: boolean;
  className?: string;
}

export function EasterEgg({ eggKey, tone = 'teal', active, className }: EasterEggProps) {
  const t = useTranslations('marketing.easterEggs');
  const text = t(eggKey);

  return (
    <span className={cn('ed-easter-egg', tone === 'warm' ? 'ed-easter-egg-warm' : 'ed-easter-egg-teal', className)}>
      <TypewriterText
        text={text}
        active={active}
        intervalMs={42}
        cursorClassName={tone === 'warm' ? 'ed-easter-cursor-warm' : undefined}
      />
    </span>
  );
}

export default function EasterEggField() {
  const locale = useLocale();
  const [eggs, setEggs] = useState<PlacedEgg[]>([]);
  const [hoveredId, setHoveredId] = useState<string | null>(null);

  useEffect(() => {
    setEggs(generatePlacements());
  }, [locale]);

  if (eggs.length === 0) return null;

  return (
    <div className="pointer-events-none fixed inset-0 z-[6] overflow-visible" aria-hidden>
      {eggs.map(({ id, key, top, left, tone }) => (
        <div
          key={id}
          className="ed-easter-group pointer-events-auto absolute max-w-[240px] -translate-x-1/2 -translate-y-1/2 p-3 text-center"
          style={{ top: `${top}%`, left: `${left}%` }}
          onMouseEnter={() => setHoveredId(id)}
          onMouseLeave={() => setHoveredId(null)}
        >
          <span
            className={cn('ed-easter-dot', tone === 'warm' ? 'ed-easter-dot-warm' : 'ed-easter-dot-teal')}
            aria-hidden
          />
          <EasterEgg
            eggKey={key}
            tone={tone}
            active={hoveredId === id}
            className="text-[12px] sm:text-[13px] font-normal leading-relaxed"
          />
        </div>
      ))}
    </div>
  );
}
