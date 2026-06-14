'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useTranslations } from 'next-intl';
import { CheckmarkCircle01Icon, Cancel01Icon } from 'hugeicons-react';
import { cn } from '@/lib/utils/classnameUtils';
import {
  COMPARE_TAB_KEYS,
  COMPARE_TAB_ROWS,
  type CompareRowKey,
  type CompareTabKey,
} from './marketing-keys';

type CellValue = boolean | string;
type CompetitorCol = 'hermes' | 'openclaw' | 'ryan';

const COMPETITOR_KEYS: CompetitorCol[] = ['hermes', 'openclaw', 'ryan'];

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
        <div className="ed-reveal mx-auto max-w-lg text-center">
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

        <div
          className="ed-reveal mt-12 flex flex-wrap justify-center gap-2"
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
        <div className="ed-reveal overflow-x-auto -mx-6 px-6 md:overflow-visible md:mx-0 md:px-0">
          <table className="ed-compare-table w-full min-w-[480px] md:min-w-0 text-[12px] sm:text-[13px] md:text-[12px]">
            <thead>
              <tr>
                <th className="ed-compare-feature-col text-left py-3 px-3 sm:px-5 md:px-2">
                  {t('whyMyrmAgent.columns.feature')}
                </th>
                {COMPETITOR_KEYS.map((col) => (
                  <th key={col} className="ed-compare-data-col text-center py-3 px-2 sm:px-5 md:px-1.5">
                    {t(`whyMyrmAgent.columns.${col}`)}
                  </th>
                ))}
                <th className="ed-compare-highlight-col text-center py-3 px-2 sm:px-5 md:px-2">
                  {t('whyMyrmAgent.columns.myrmAgent')}
                </th>
              </tr>
            </thead>
            <tbody>
              {visibleRows.map((key, rowIdx) => {
                const hermes = parseCompareCell(t(`whyMyrmAgent.rows.${key}.hermes`));
                const openclaw = parseCompareCell(t(`whyMyrmAgent.rows.${key}.openclaw`));
                const myrmAgent = parseCompareCell(t(`whyMyrmAgent.rows.${key}.myrmAgent`));

                return (
                  <tr
                    key={key}
                    className={cn('ed-compare-row', highlightRow === rowIdx && 'ed-row-highlight')}
                    onMouseEnter={() => setHighlightRow(rowIdx)}
                  >
                    <td className="ed-compare-feature-col py-3 px-3 sm:px-5 md:px-2 font-light whitespace-nowrap md:whitespace-normal md:leading-snug">
                      {t(`whyMyrmAgent.rows.${key}.feature`)}
                    </td>
                    {COMPETITOR_KEYS.map((col) => (
                      <td key={col} className="ed-compare-data-col text-center py-3 px-2 sm:px-5 md:px-1.5">
                        <CellContent value={col === 'hermes' ? hermes : openclaw} />
                      </td>
                    ))}
                    <td className="ed-compare-highlight-col text-center py-3 px-2 sm:px-5 md:px-2">
                      {typeof myrmAgent === 'string'
                        ? <span className="block text-[12px] md:text-[11px] font-semibold ed-mono leading-snug break-words" style={{ color: 'var(--ed-accent)' }}>{myrmAgent}</span>
                        : myrmAgent
                          ? <CheckmarkCircle01Icon className="inline h-4 w-4" style={{ color: 'var(--ed-accent)' }} />
                          : <Cancel01Icon className="inline h-4 w-4" style={{ color: 'var(--ed-muted)' }} />}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
}
