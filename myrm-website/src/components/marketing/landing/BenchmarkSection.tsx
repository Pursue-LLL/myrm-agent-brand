'use client';

import { useTranslations } from 'next-intl';
import { useCountUp } from './landing-interaction';

const BREAKDOWN_ROWS = ['systemPrompt', 'toolDefs', 'context'] as const;
const BREAKDOWN_COLS = [
  { key: 'myrmAgent', accent: true },
  { key: 'hermes', accent: false },
  { key: 'openclaw', accent: false },
] as const;

function parseTokenValue(raw: string): number {
  const normalized = raw.replace(/[~,]/g, '').trim();
  const parsed = Number.parseInt(normalized, 10);
  return Number.isFinite(parsed) ? parsed : 0;
}

const BAR_KEYS = ['myrmAgentValue', 'hermesValue', 'openclawValue'] as const;
const BAR_LABEL_KEYS = ['myrmAgent', 'hermes', 'openclaw'] as const;
const EXTRA_KEYS = ['shellCompression', 'cacheObservability', 'toolOutputIntelligence', 'liveValidation'] as const;

export default function BenchmarkSection() {
  const t = useTranslations('marketing');

  const barValues = BAR_KEYS.map((key) => parseTokenValue(t(`tokenBenchmark.${key}`)));
  const maxBarValue = Math.max(...barValues, 1);

  const breakdownValues = BREAKDOWN_ROWS.flatMap((row) =>
    BREAKDOWN_COLS.map((col) =>
      parseTokenValue(t(`tokenBenchmark.breakdown.${col.key}${row === 'systemPrompt' ? 'System' : row === 'toolDefs' ? 'Tools' : 'Context'}`)),
    ),
  );
  const breakdownMax = Math.max(...breakdownValues, 1);

  return (
    <section className="ed-section-main py-20 sm:py-40">
      <div className="mx-auto max-w-[1080px] px-6">
        <div className="ed-reveal mx-auto max-w-lg text-center">
          <h2 className="text-[clamp(1.8rem,4vw,2.6rem)] font-semibold tracking-[-0.02em]">{t('tokenBenchmark.title')}</h2>
          <p className="mt-5 text-[15px] leading-relaxed font-light" style={{ color: 'var(--ed-dim)' }}>{t('tokenBenchmark.subtitle')}</p>
        </div>
        <div className="ed-reveal mt-16">
          <div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-center sm:gap-8">
            {BAR_KEYS.map((valueKey, i) => (
              <BenchmarkBar
                key={valueKey}
                value={barValues[i]}
                maxValue={maxBarValue}
                label={t(`tokenBenchmark.${BAR_LABEL_KEYS[i]}`)}
                accent={i === 0}
              />
            ))}
          </div>
          <div className="mt-10 flex flex-col items-center gap-2">
            <span className="inline-flex items-center rounded-full px-4 py-1.5 text-[13px] font-semibold" style={{ background: 'var(--ed-accent-soft)', color: 'var(--ed-accent)' }}>
              {t('tokenBenchmark.savings')}
            </span>
            <span className="text-[11px] ed-mono" style={{ color: 'var(--ed-muted)' }}>{t('tokenBenchmark.savingsCache')}</span>
          </div>

          <div className="mt-14 rounded-2xl p-5 sm:p-7" style={{ border: '1px solid var(--ed-border)', background: 'var(--ed-surface)' }}>
            <h3 className="text-center text-[14px] font-semibold">{t('tokenBenchmark.breakdown.title')}</h3>
            <div className="mt-6 space-y-5">
              {BREAKDOWN_ROWS.map((row) => (
                <div key={row}>
                  <p className="mb-2 text-[11px] font-medium ed-mono" style={{ color: 'var(--ed-dim)' }}>
                    {t(`tokenBenchmark.breakdown.${row}`)}
                  </p>
                  <div className="grid gap-3 sm:grid-cols-3">
                    {BREAKDOWN_COLS.map((col) => {
                      const valueKey =
                        row === 'systemPrompt'
                          ? `${col.key}System`
                          : row === 'toolDefs'
                            ? `${col.key}Tools`
                            : `${col.key}Context`;
                      const raw = t(`tokenBenchmark.breakdown.${valueKey}`);
                      const value = parseTokenValue(raw);
                      const width = value > 0 ? Math.max(8, (value / breakdownMax) * 100) : 4;
                      return (
                        <div key={valueKey}>
                          <div className="mb-1 flex items-center justify-between gap-2 text-[10px] ed-mono">
                            <span style={{ color: 'var(--ed-muted)' }}>
                              {col.key === 'myrmAgent'
                                ? t('tokenBenchmark.myrmAgent')
                                : col.key === 'hermes'
                                  ? t('tokenBenchmark.hermes')
                                  : t('tokenBenchmark.openclaw')}
                            </span>
                            <span style={{ color: col.accent ? 'var(--ed-accent)' : 'var(--ed-dim)' }}>{raw}</span>
                          </div>
                          <div className="h-2 rounded-full overflow-hidden" style={{ background: 'var(--ed-border)' }}>
                            <div
                              className="h-full rounded-full transition-all duration-700"
                              style={{
                                width: `${width}%`,
                                background: col.accent ? 'var(--ed-accent)' : 'color-mix(in oklch, var(--ed-muted) 55%, transparent)',
                                opacity: col.accent ? 1 : 0.65,
                              }}
                            />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {EXTRA_KEYS.map((key) => (
              <div
                key={key}
                className="rounded-2xl p-4 sm:p-5"
                style={{ border: '1px solid var(--ed-border)', background: 'var(--ed-surface)' }}
              >
                <p className="text-[12px] font-semibold">{t(`tokenBenchmark.extras.${key}.title`)}</p>
                <p className="mt-2 text-[11px] sm:text-[12px] leading-relaxed font-light" style={{ color: 'var(--ed-dim)' }}>
                  {t(`tokenBenchmark.extras.${key}.desc`)}
                </p>
              </div>
            ))}
          </div>

          <p className="mt-8 text-center text-[11px] ed-mono leading-relaxed" style={{ color: 'var(--ed-muted)' }}>
            {t('tokenBenchmark.footnote')}
            <br />
            {t('tokenBenchmark.ptcFootnote')}
          </p>
        </div>
      </div>
    </section>
  );
}

function BenchmarkBar({ value, maxValue, label, accent = false }: { value: number; maxValue: number; label: string; accent?: boolean }) {
  const { value: animatedValue, ref } = useCountUp(value);
  const barHeight = Math.max(24, (value / maxValue) * 220);

  return (
    <div className="flex flex-1 flex-col items-center gap-3">
      <div
        className="ed-bar relative w-full max-w-[140px] rounded-t-lg transition-all duration-1000"
        style={{ height: `${barHeight}px`, background: accent ? 'var(--ed-accent)' : 'var(--ed-border)', opacity: accent ? 1 : 0.5 }}
      >
        <span
          ref={ref}
          className="absolute -top-7 left-1/2 -translate-x-1/2 whitespace-nowrap text-[13px] font-semibold ed-mono"
          style={{ color: accent ? 'var(--ed-accent)' : 'var(--ed-dim)' }}
        >
          {animatedValue.toLocaleString()}
        </span>
      </div>
      <span className="text-[12px] font-medium" style={{ color: accent ? 'var(--ed-ink)' : 'var(--ed-muted)' }}>{label}</span>
    </div>
  );
}
