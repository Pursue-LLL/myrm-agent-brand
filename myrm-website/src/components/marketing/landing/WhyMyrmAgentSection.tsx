'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useTranslations } from 'next-intl';
import {
  CheckmarkCircle01Icon,
  Cancel01Icon,
  Brain02Icon,
  FlashIcon,
  TaskDone01Icon,
  ComputerPhoneSyncIcon,
  SecurityIcon,
  ArrowRight02Icon,
} from 'hugeicons-react';
import { COMPETITOR_COMPARISON_DOC_PATH } from '@/lib/docs-contract';
import { useDocsLocale } from '@/hooks/useDocsLocale';
import { getDocsUrl } from '@/lib/deploy-mode';
import { cn } from '@/lib/utils/classnameUtils';
import {
  COMPARE_TAB_KEYS,
  COMPARE_TAB_ROWS,
  type CompareRowKey,
  type CompareTabKey,
} from './marketing-keys';

type CellValue = boolean | string;
type CompetitorCol = 'hermes' | 'openclaw';

const COMPETITOR_KEYS: CompetitorCol[] = ['hermes', 'openclaw'];

const PILLAR_KEYS = ['memory', 'ptcEngine', 'orchestration', 'omnichannel', 'security'] as const;
type PillarKey = (typeof PILLAR_KEYS)[number];

const PILLAR_ICONS: Record<PillarKey, typeof Brain02Icon> = {
  memory: Brain02Icon,
  ptcEngine: FlashIcon,
  orchestration: TaskDone01Icon,
  omnichannel: ComputerPhoneSyncIcon,
  security: SecurityIcon,
};

function parseCompareCell(raw: string): CellValue {
  if (raw === '_no') return false;
  if (raw === '_yes') return true;
  return raw;
}

function CellContent({ value }: { value: CellValue }) {
  if (typeof value === 'string') {
    return <span className="block text-[12px] md:text-[11px] font-medium ed-mono leading-snug break-words">{value}</span>;
  }
  return value
    ? <CheckmarkCircle01Icon className="inline h-4 w-4" style={{ color: 'var(--ed-accent)' }} />
    : <Cancel01Icon className="inline h-4 w-4" style={{ color: 'var(--ed-muted)' }} />;
}

export default function WhyMyrmAgentSection() {
  const t = useTranslations('marketing');
  const docsLocale = useDocsLocale();
  const compareDocsUrl = getDocsUrl(COMPETITOR_COMPARISON_DOC_PATH, docsLocale);
  const [activeTab, setActiveTab] = useState<CompareTabKey>('memory');
  const [highlightRow, setHighlightRow] = useState(-1);
  const sectionRef = useRef<HTMLElement>(null);
  const isVisible = useRef(false);

  const visibleRows = useMemo(
    () => COMPARE_TAB_ROWS[activeTab] as readonly CompareRowKey[],
    [activeTab],
  );

  const startInterval = useCallback(() => {
    const id = setInterval(() => {
      if (isVisible.current && visibleRows.length > 0) {
        setHighlightRow((prev) => (prev + 1) % visibleRows.length);
      }
    }, 4000);
    return id;
  }, [visibleRows.length]);

  useEffect(() => {
    setHighlightRow(-1);
  }, [activeTab]);

  useEffect(() => {
    const el = sectionRef.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => { isVisible.current = entry.isIntersecting; },
      { threshold: 0.1 },
    );
    observer.observe(el);

    const intervalId = startInterval();
    return () => {
      observer.disconnect();
      clearInterval(intervalId);
    };
  }, [startInterval]);

  return (
    <section ref={sectionRef} className="ed-section-alt py-20 sm:py-40">
      <div className="mx-auto max-w-[1080px] px-6">
        <div className="ed-reveal mx-auto max-w-2xl text-center">
          <h2 className="text-[clamp(1.8rem,4vw,2.6rem)] font-semibold tracking-[-0.02em]">
            {t('whyMyrmAgent.title')}
          </h2>
          <p className="mt-5 text-[15px] leading-relaxed font-light" style={{ color: 'var(--ed-dim)' }}>
            {t('whyMyrmAgent.subtitle')}
          </p>
          <p className="mt-3 text-[12px] ed-mono" style={{ color: 'var(--ed-accent)' }}>
            {t('whyMyrmAgent.tagline')}
          </p>
        </div>

        {/* 5 Core Pillars Grid */}
        <div className="ed-reveal mt-14">
          <div className="text-center mb-8">
            <h3 className="text-[17px] sm:text-[19px] font-semibold tracking-[-0.01em]">
              {t('whyMyrmAgent.pillars.title')}
            </h3>
            <p className="mt-2 text-[13px] font-light" style={{ color: 'var(--ed-dim)' }}>
              {t('whyMyrmAgent.pillars.subtitle')}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {PILLAR_KEYS.map((pillarKey, idx) => {
              const Icon = PILLAR_ICONS[pillarKey];
              const isLarge = idx === 0 || idx === 1;
              return (
                <div
                  key={pillarKey}
                  className={cn(
                    'ed-card rounded-2xl p-5 sm:p-6 flex flex-col justify-between border transition-all duration-300 hover:border-[var(--ed-accent)]',
                    isLarge && 'lg:col-span-1 md:col-span-1',
                  )}
                  style={{
                    background: 'color-mix(in oklch, var(--ed-surface) 75%, transparent)',
                    borderColor: 'color-mix(in oklch, var(--ed-border) 70%, transparent)',
                  }}
                >
                  <div>
                    <div className="flex items-center justify-between mb-3.5">
                      <div
                        className="inline-flex h-9 w-9 items-center justify-center rounded-xl"
                        style={{ background: 'var(--ed-accent-soft)', color: 'var(--ed-accent)' }}
                      >
                        <Icon className="h-5 w-5" />
                      </div>
                      <span
                        className="ed-mono text-[11px] font-medium px-2.5 py-0.5 rounded-full"
                        style={{
                          background: 'var(--ed-accent-soft)',
                          color: 'var(--ed-accent)',
                          border: '1px solid color-mix(in oklch, var(--ed-accent) 25%, transparent)',
                        }}
                      >
                        {t(`whyMyrmAgent.pillars.items.${pillarKey}.badge`)}
                      </span>
                    </div>

                    <h4 className="text-[15px] font-semibold leading-snug">
                      {t(`whyMyrmAgent.pillars.items.${pillarKey}.title`)}
                    </h4>

                    {/* Competitor pain point */}
                    <div className="mt-3 text-[12px] leading-relaxed p-2.5 rounded-lg border border-red-500/15 bg-red-500/5">
                      <span className="font-semibold text-red-400 block mb-0.5">⚠️ 竞品通病</span>
                      <span className="text-red-300/80 font-light">
                        {t(`whyMyrmAgent.pillars.items.${pillarKey}.competitorPain`)}
                      </span>
                    </div>

                    {/* Myrm moat */}
                    <div className="mt-2 text-[12px] leading-relaxed p-2.5 rounded-lg border border-[var(--ed-accent)]/20 bg-[var(--ed-accent-soft)]/20">
                      <span className="font-semibold block mb-0.5" style={{ color: 'var(--ed-accent)' }}>
                        🛡️ Myrm 护城河
                      </span>
                      <span className="font-light" style={{ color: 'var(--ed-dim)' }}>
                        {t(`whyMyrmAgent.pillars.items.${pillarKey}.myrmMoat`)}
                      </span>
                    </div>
                  </div>

                  {/* Real user benefit */}
                  <div className="mt-4 pt-3 border-t border-dashed" style={{ borderColor: 'var(--ed-border)' }}>
                    <p className="text-[12px] font-medium ed-mono" style={{ color: 'var(--ed-ink)' }}>
                      💡 {t(`whyMyrmAgent.pillars.items.${pillarKey}.userBenefit`)}
                    </p>
                  </div>
                </div>
              );
            })}

            {/* Quick action card directing to deep docs */}
            <div
              className="ed-card rounded-2xl p-5 sm:p-6 flex flex-col justify-between border"
              style={{
                background: 'color-mix(in oklch, var(--ed-accent-soft) 25%, var(--ed-surface))',
                borderColor: 'color-mix(in oklch, var(--ed-accent) 40%, var(--ed-border))',
              }}
            >
              <div>
                <div
                  className="inline-flex h-9 w-9 items-center justify-center rounded-xl mb-3.5"
                  style={{ background: 'var(--ed-accent)', color: '#fff' }}
                >
                  <ArrowRight02Icon className="h-5 w-5" />
                </div>
                <h4 className="text-[16px] font-semibold leading-snug">
                  {t('whyMyrmAgent.docsCta.button')}
                </h4>
                <p className="mt-2 text-[12px] font-light leading-relaxed" style={{ color: 'var(--ed-dim)' }}>
                  {t('whyMyrmAgent.docsCta.hint')}
                </p>
              </div>
              <div className="mt-5">
                <a
                  href={compareDocsUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center gap-2 w-full py-2.5 px-4 rounded-xl text-[12px] font-medium text-white transition-opacity hover:opacity-90 ed-mono"
                  style={{ background: 'var(--ed-accent)' }}
                >
                  <span>查阅完整代码级对比</span>
                  <ArrowRight02Icon className="h-4 w-4" />
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* Existing Tabbed Table */}
        <div
          className="ed-reveal mt-16 flex flex-wrap justify-center gap-2"
          role="tablist"
          aria-label={t('whyMyrmAgent.tabs.a11y')}
        >
          {COMPARE_TAB_KEYS.map((tabKey) => (
            <button
              key={tabKey}
              type="button"
              role="tab"
              aria-selected={activeTab === tabKey}
              onClick={() => setActiveTab(tabKey)}
              className={cn(
                'rounded-full px-3.5 py-1.5 text-[11px] sm:text-[12px] font-medium transition-colors',
                activeTab === tabKey ? 'ed-mono' : 'font-light',
              )}
              style={
                activeTab === tabKey
                  ? {
                      background: 'var(--ed-accent-soft)',
                      color: 'var(--ed-accent)',
                      border: '1px solid color-mix(in oklch, var(--ed-accent) 28%, var(--ed-border))',
                    }
                  : {
                      background: 'color-mix(in oklch, var(--ed-surface) 70%, transparent)',
                      color: 'var(--ed-muted)',
                      border: '1px solid color-mix(in oklch, var(--ed-border) 55%, transparent)',
                    }
              }
            >
              {t(`whyMyrmAgent.tabs.${tabKey}`)}
            </button>
          ))}
        </div>

        <p className="ed-reveal mt-8 mb-2 text-center text-[11px] ed-mono sm:hidden" style={{ color: 'var(--ed-muted)' }}>
          ← {t('whyMyrmAgent.scrollHint')} →
        </p>
        <div className="ed-reveal mt-8 -mx-6 px-6 md:mx-0 md:px-0">
          <div className="ed-compare-shell">
          <table className="ed-compare-table w-full min-w-[520px] md:min-w-0 text-[12px] sm:text-[13px]">
            <thead>
              <tr>
                <th className="ed-compare-feature-col text-left py-4 px-4 sm:px-5">
                  {t('whyMyrmAgent.columns.feature')}
                </th>
                {COMPETITOR_KEYS.map((col) => (
                  <th key={col} className="ed-compare-data-col text-center py-4 px-3 sm:px-4">
                    {t(`whyMyrmAgent.columns.${col}`)}
                  </th>
                ))}
                <th className="ed-compare-highlight-col text-center py-4 px-4 sm:px-5">
                  {t('whyMyrmAgent.columns.myrmAgent')}
                </th>
              </tr>
            </thead>
            <tbody>
              {visibleRows.map((key, rowIdx) => (
                  <tr
                    key={key}
                    className={cn('ed-compare-row', highlightRow === rowIdx && 'ed-row-highlight')}
                    onMouseEnter={() => setHighlightRow(rowIdx)}
                  >
                    <td className="ed-compare-feature-col py-4 px-4 sm:px-5 font-light whitespace-nowrap md:whitespace-normal md:leading-snug">
                      {t(`whyMyrmAgent.rows.${key}.feature`)}
                    </td>
                    {COMPETITOR_KEYS.map((col) => {
                      const value = parseCompareCell(t(`whyMyrmAgent.rows.${key}.${col}`));
                      return (
                        <td key={col} className="ed-compare-data-col text-center py-4 px-3 sm:px-4">
                          <CellContent value={value} />
                        </td>
                      );
                    })}
                    <td className="ed-compare-highlight-col text-center py-4 px-4 sm:px-5">
                      {(() => {
                        const myrmAgent = parseCompareCell(t(`whyMyrmAgent.rows.${key}.myrmAgent`));
                        return typeof myrmAgent === 'string'
                          ? <span className="block text-[12px] md:text-[11px] font-semibold ed-mono leading-snug break-words" style={{ color: 'var(--ed-accent)' }}>{myrmAgent}</span>
                          : myrmAgent
                            ? <CheckmarkCircle01Icon className="inline h-4 w-4" style={{ color: 'var(--ed-accent)' }} />
                            : <Cancel01Icon className="inline h-4 w-4" style={{ color: 'var(--ed-muted)' }} />;
                      })()}
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
          </div>
        </div>
      </div>
    </section>
  );
}
