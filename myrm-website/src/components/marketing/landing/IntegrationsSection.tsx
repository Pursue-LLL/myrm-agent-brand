/**
 * [INPUT]
 * - next-intl marketing.integrations.*
 *
 * [OUTPUT]
 * - IntegrationsSection: LLM 与工具集成 chip 列表
 *
 * [POS]
 * Landing 集成能力展示；文案来自 locale 中 ` · ` 分隔的短标签（validate 上限 48 字符/chip）。
 */
'use client';

import { useTranslations } from 'next-intl';

function IntegrationChipList({ names }: { names: string[] }) {
  return (
    <div className="flex flex-wrap gap-3">
      {names.map((name) => (
        <span
          key={name}
          className="ed-shimmer inline-flex items-center rounded-full px-4 py-2 text-[13px] font-light"
          style={{ border: '1px solid var(--ed-border)', background: 'var(--ed-surface)', color: 'var(--ed-ink)' }}
        >
          {name}
        </span>
      ))}
    </div>
  );
}

export default function IntegrationsSection() {
  const t = useTranslations('marketing');
  const llmNames = t('integrations.llmList').split(' · ').filter(Boolean);
  const toolNames = t('integrations.toolsList').split(' · ').filter(Boolean);

  return (
    <section className="ed-section-alt py-20 sm:py-40">
      <div className="mx-auto max-w-[1080px] px-6">
        <div className="ed-reveal mx-auto max-w-md text-center">
          <h2 className="text-[clamp(1.8rem,4vw,2.6rem)] font-semibold tracking-[-0.02em]">{t('integrations.title')}</h2>
          <p className="mt-5 text-[15px] font-light leading-relaxed" style={{ color: 'var(--ed-dim)' }}>
            {t('integrations.subtitle')}
          </p>
        </div>
        <div className="mt-16 space-y-10">
          <div className="ed-reveal">
            <p
              className="mb-4 text-[10px] font-medium uppercase tracking-[0.2em] ed-mono"
              style={{ color: 'var(--ed-accent)' }}
            >
              {t('integrations.categories.llm')}
            </p>
            <IntegrationChipList names={llmNames} />
          </div>
          <div className="ed-reveal ed-stagger-2">
            <p
              className="mb-4 text-[10px] font-medium uppercase tracking-[0.2em] ed-mono"
              style={{ color: 'var(--ed-accent)' }}
            >
              {t('integrations.categories.tools')}
            </p>
            <IntegrationChipList names={toolNames} />
          </div>
          <p className="ed-reveal ed-stagger-3 text-center text-[12px] ed-mono" style={{ color: 'var(--ed-muted)' }}>
            {t('integrations.more')}
          </p>
        </div>
      </div>
    </section>
  );
}
