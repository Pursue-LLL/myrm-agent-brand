/**
 * [INPUT]
 * - next-intl marketing.advantages.items (六项 Bento 文案)
 *
 * [OUTPUT]
 * - AdvantagesSection: 首屏六项核心能力 Bento 网格（每卡最多 3 个 tag）
 *
 * [POS]
 * 落地页主转化能力区。仅展示高优先级主题，细节见 EngineeringDepthSection。
 */
'use client';

import { useTranslations } from 'next-intl';
import { useDocsLocale } from '@/hooks/useDocsLocale';
import {
  Brain02Icon,
  SecurityIcon,
  HierarchyIcon,
  Analytics01Icon,
  ComputerPhoneSyncIcon,
  RepeatIcon,
} from 'hugeicons-react';
import type { ComponentType } from 'react';
import { TiltCard } from './interactive';
import { marketingHas } from './marketing-i18n';
import {
  APP_MIGRATION_WIZARD_PATH,
  getAppLoginRedirectUrl,
  getDesktopDownloadPath,
} from '@/lib/deploy-mode';
import { ArrowRight02Icon } from 'hugeicons-react';
import { BENTO_KEYS, type BentoKey } from './marketing-keys';

type IconProps = { className?: string; style?: React.CSSProperties };

interface BentoItem {
  key: BentoKey;
  icon: ComponentType<IconProps>;
  stat: string;
}

const BENTO_ICONS: Record<BentoKey, ComponentType<IconProps>> = {
  selfEvolution: Brain02Icon,
  security: SecurityIcon,
  reliability: HierarchyIcon,
  costEfficiency: Analytics01Icon,
  visualControl: ComputerPhoneSyncIcon,
  taskModes: RepeatIcon,
};

const BENTO_STATS: Record<BentoKey, string> = {
  selfEvolution: '8',
  security: '6',
  reliability: '6',
  costEfficiency: '86%',
  visualControl: '25+',
  taskModes: '4+',
};

/** Six conversion-focused themes — details live in EngineeringDepthSection. */
const BENTO_ITEMS: BentoItem[] = BENTO_KEYS.map((key) => ({
  key,
  icon: BENTO_ICONS[key],
  stat: BENTO_STATS[key],
}));

const GLASS = {
  border: '1px solid color-mix(in oklch, var(--ed-border) 60%, transparent)',
  background: 'color-mix(in oklch, var(--ed-surface) 70%, transparent)',
  backdropFilter: 'blur(16px)',
  WebkitBackdropFilter: 'blur(16px)',
} as const;

const MAX_POINTS = 3;

function usePointIndices(key: BentoKey): number[] {
  const t = useTranslations('marketing');
  const indices: number[] = [];
  for (let n = 1; n <= MAX_POINTS; n++) {
    if (marketingHas(t, `advantages.items.${key}.point${n}`)) {
      indices.push(n);
    } else {
      break;
    }
  }
  return indices;
}

function BentoCard({ item, index }: { item: BentoItem; index: number }) {
  const t = useTranslations('marketing');
  const { key, icon: Icon, stat } = item;
  const points = usePointIndices(key);

  return (
    <TiltCard
      className={`ed-reveal rounded-2xl overflow-hidden ed-stagger-${(index % 3) + 1}`}
      style={GLASS}
    >
      <div className="p-6 sm:p-7 flex flex-col h-full min-h-[220px]">
        <div className="flex items-start justify-between gap-3">
          <div
            className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-xl"
            style={{ background: 'var(--ed-accent-soft)', color: 'var(--ed-accent)' }}
          >
            <Icon className="h-5 w-5" />
          </div>
          <p
            className="text-[clamp(1.75rem,4vw,2.5rem)] font-black tracking-tighter ed-mono leading-none"
            style={{ color: 'var(--ed-accent)' }}
          >
            {stat}
          </p>
        </div>

        <p className="mt-4 text-[16px] sm:text-[17px] font-semibold leading-snug">
          {t(`advantages.items.${key}.title`)}
        </p>
        <p className="mt-2 text-[13px] leading-relaxed font-light flex-1" style={{ color: 'var(--ed-dim)' }}>
          {t(`advantages.items.${key}.desc`)}
        </p>

        <ul className="mt-4 space-y-2 border-t pt-4" style={{ borderColor: 'color-mix(in oklch, var(--ed-border) 50%, transparent)' }}>
          {points.map((n) => (
            <li
              key={n}
              className="flex gap-2 text-[11px] sm:text-[12px] leading-[1.45] font-medium"
              style={{ color: 'var(--ed-accent)' }}
            >
              <span
                className="mt-[0.4em] h-1 w-1 shrink-0 rounded-full"
                style={{ background: 'var(--ed-accent)' }}
                aria-hidden
              />
              <span className="min-w-0 flex-1">{t(`advantages.items.${key}.point${n}`)}</span>
            </li>
          ))}
        </ul>
      </div>
    </TiltCard>
  );
}

export default function AdvantagesSection() {
  const t = useTranslations('marketing');
  const docsLocale = useDocsLocale();
  const migrationDownloadHref = getDesktopDownloadPath();
  const migrationAppHref = getAppLoginRedirectUrl(APP_MIGRATION_WIZARD_PATH, docsLocale);

  return (
    <section className="ed-section-alt py-20 sm:py-40">
      <div className="mx-auto max-w-[1080px] px-6">
        <div className="ed-reveal mx-auto max-w-lg text-center">
          <h2 className="text-[clamp(1.8rem,4vw,2.6rem)] font-semibold tracking-[-0.02em]">
            {t('advantages.title')}
          </h2>
          <p className="mt-5 text-[15px] leading-relaxed font-light" style={{ color: 'var(--ed-dim)' }}>
            {t('advantages.subtitle')}
          </p>
        </div>

        <div className="mt-16 grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
          {BENTO_ITEMS.map((item, i) => (
            <BentoCard key={item.key} item={item} index={i} />
          ))}
        </div>

        <div className="ed-reveal mt-14 text-center space-y-3">
          <p className="text-[13px] ed-mono font-medium" style={{ color: 'var(--ed-accent)' }}>
            {t('advantages.cta')}
          </p>
          <p className="text-[12px] font-light" style={{ color: 'var(--ed-muted)' }}>
            {t('advantages.ctaDesc')}
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-2 sm:gap-3">
            <a
              href={migrationDownloadHref}
              className="inline-flex items-center justify-center gap-1.5 rounded-full px-5 py-2.5 text-[13px] font-medium transition-opacity hover:opacity-90"
              style={{
                background: 'var(--ed-accent-soft)',
                color: 'var(--ed-accent)',
                border: '1px solid color-mix(in oklch, var(--ed-accent) 25%, var(--ed-border))',
              }}
            >
              {t('advantages.migrationCta')}
              <ArrowRight02Icon className="h-3.5 w-3.5" />
            </a>
            <a
              href={migrationAppHref}
              className="inline-flex items-center justify-center gap-1.5 rounded-full px-5 py-2.5 text-[13px] font-medium transition-opacity hover:opacity-90 border border-border/60 text-foreground/90"
              style={{ background: 'var(--ed-surface)' }}
            >
              {t('advantages.migrationCtaOpenApp')}
              <ArrowRight02Icon className="h-3.5 w-3.5" />
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
