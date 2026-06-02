/**
 * [INPUT]
 * - next-intl marketing namespace (advantages / highlights / extendedHighlights item keys)
 * - deploy-mode::getDocsUrl (POS: 营销站外部链接统一入口)
 *
 * [OUTPUT]
 * - EngineeringDepthSection: 工程深度区（桌面：规格手册分栏；移动：折叠面板）
 *
 * [POS]
 * 落地页第二层证据区。美学方向：工业规格手册 + 编辑不对称，与 Bento 玻璃语言同系。
 */
'use client';

import { useCallback, useEffect, useState } from 'react';
import { useTranslations } from 'next-intl';
import { ArrowRight02Icon } from 'hugeicons-react';
import { getDocsUrl } from '@/lib/deploy-mode';
import { useMinWidth } from './hooks';
import { marketingHas } from './marketing-i18n';
import {
  DEPTH_GROUPS,
  depthItemBasePath,
  type DepthGroupDef,
  type DepthItemRef,
} from './marketing-keys';

const MAX_POINTS = 3;

const GROUP_INDEX: Record<string, string> = {
  compounding: '01',
  remote: '02',
  capability: '03',
  reliability: '04',
  migration: '05',
};

const DEFAULT_ACTIVE_ID = DEPTH_GROUPS.find((g) => g.defaultOpen)?.id ?? DEPTH_GROUPS[0].id;

function DepthFeatureCard({ source, itemKey, cardIndex }: DepthItemRef & { cardIndex: number }) {
  const t = useTranslations('marketing');
  const base = depthItemBasePath(source, itemKey);
  const points: number[] = [];
  for (let n = 1; n <= 6; n++) {
    if (marketingHas(t, `${base}.point${n}`)) {
      points.push(n);
    } else {
      break;
    }
  }
  const visible = points.slice(0, MAX_POINTS);
  const badgeKey = `${base}.badge` as Parameters<typeof t.has>[0];
  const hasBadge = source !== 'advantages' && t.has(badgeKey);

  return (
    <article className={`ed-depth-card ed-stagger-${(cardIndex % 3) + 1}`}>
      <div className="ed-depth-card-rail" aria-hidden />
      <header className="ed-depth-card-head">
        <span className="ed-depth-card-idx ed-mono" aria-hidden>
          {String(cardIndex + 1).padStart(2, '0')}
        </span>
        <div className="min-w-0 flex-1">
          {hasBadge && <span className="ed-depth-badge ed-mono">{t(badgeKey)}</span>}
          <h4 className="ed-depth-card-title">{t(`${base}.title` as Parameters<typeof t>[0])}</h4>
        </div>
      </header>
      <p className="ed-depth-card-desc">{t(`${base}.desc` as Parameters<typeof t>[0])}</p>
      {visible.length > 0 && (
        <ul className="ed-depth-points">
          {visible.map((n) => (
            <li key={n} className="ed-depth-point">
              <span>{t(`${base}.point${n}` as Parameters<typeof t>[0])}</span>
            </li>
          ))}
        </ul>
      )}
    </article>
  );
}

function DepthCardGrid({ group }: { group: DepthGroupDef }) {
  return (
    <div className="ed-depth-grid">
      {group.items.map((ref, cardIndex) => (
        <DepthFeatureCard key={`${ref.source}-${ref.itemKey}`} {...ref} cardIndex={cardIndex} />
      ))}
    </div>
  );
}

function DepthGroupPanel({
  group,
  layout,
  defaultOpen,
}: {
  group: DepthGroupDef;
  layout: 'accordion' | 'stage';
  defaultOpen?: boolean;
}) {
  const t = useTranslations('marketing');
  const index = GROUP_INDEX[group.id] ?? '00';

  const header = (
    <>
      <span className="ed-depth-glyph" data-depth-glyph={group.id} aria-hidden />
      <span className="ed-depth-index ed-mono" aria-hidden>
        {index}
      </span>
      <span className="ed-depth-summary-text min-w-0 flex-1">
        <span className="ed-depth-group-label ed-mono">{t(`engineeringDepth.groups.${group.id}.label`)}</span>
        <span className="ed-depth-group-title">{t(`engineeringDepth.groups.${group.id}.title`)}</span>
        <span className="ed-depth-group-summary">{t(`engineeringDepth.groups.${group.id}.summary`)}</span>
      </span>
      <span className="ed-depth-count ed-mono">
        <span className="ed-depth-count-num">{group.items.length}</span>
        <span className="ed-depth-count-unit">cap</span>
      </span>
    </>
  );

  if (layout === 'stage') {
    return (
      <div className="ed-depth-stage-inner">
        <header className="ed-depth-stage-head">
          <span className="ed-depth-stage-index ed-mono">{index}</span>
          <div className="min-w-0">
            <p className="ed-depth-group-label ed-mono">{t(`engineeringDepth.groups.${group.id}.label`)}</p>
            <h3 className="ed-depth-stage-title">{t(`engineeringDepth.groups.${group.id}.title`)}</h3>
            <p className="ed-depth-stage-summary">{t(`engineeringDepth.groups.${group.id}.summary`)}</p>
          </div>
          <span className="ed-depth-stage-meter ed-mono" aria-hidden>
            <span style={{ width: `${Math.min(100, group.items.length * 14)}%` }} />
          </span>
        </header>
        <DepthCardGrid group={group} />
      </div>
    );
  }

  return (
    <details className="ed-depth-panel group/depth" data-depth-id={group.id} open={defaultOpen}>
      <summary className="ed-depth-summary">
        {header}
        <span className="ed-depth-chevron" aria-hidden />
      </summary>
      <div className="ed-depth-body">
        <DepthCardGrid group={group} />
      </div>
    </details>
  );
}

export default function EngineeringDepthSection() {
  const t = useTranslations('marketing');
  const isDesktop = useMinWidth(768);
  const compareHref = getDocsUrl('/getting-started/competitor-comparison');
  const [activeId, setActiveId] = useState(DEFAULT_ACTIVE_ID);

  const activeGroup = DEPTH_GROUPS.find((g) => g.id === activeId) ?? DEPTH_GROUPS[0];

  const selectGroup = useCallback((id: string) => {
    setActiveId(id);
  }, []);

  useEffect(() => {
    if (!isDesktop) return;
    const stillValid = DEPTH_GROUPS.some((g) => g.id === activeId);
    if (!stillValid) setActiveId(DEFAULT_ACTIVE_ID);
  }, [isDesktop, activeId]);

  return (
    <section id="engineering-depth" className="ed-section-main ed-depth-section py-20 sm:py-32">
      <div className="ed-depth-grain" aria-hidden />
      <div className="ed-depth-ambient" aria-hidden />
      <div className="relative mx-auto max-w-[1120px] px-6">
        <div className="ed-depth-hero">
          <div className="ed-depth-hero-copy">
            <p className="ed-depth-eyebrow ed-mono">{t('engineeringDepth.eyebrow')}</p>
            <h2 className="ed-depth-hero-title">{t('engineeringDepth.title')}</h2>
            <p className="ed-depth-hero-sub">{t('engineeringDepth.subtitle')}</p>
            <a
              href={compareHref}
              target="_blank"
              rel="noopener noreferrer"
              className="ed-depth-cta ed-mono inline-flex items-center gap-1.5 text-[13px] font-medium transition-opacity hover:opacity-85"
            >
              {t('engineeringDepth.compareCta')}
              <ArrowRight02Icon className="h-3.5 w-3.5" />
            </a>
          </div>
          <div className="ed-depth-hero-mark ed-mono" aria-hidden>
            <span className="ed-depth-hero-mark-line">SYS</span>
            <span className="ed-depth-hero-mark-line">SPEC</span>
            <span className="ed-depth-hero-mark-accent">{DEPTH_GROUPS.length}</span>
            <span className="ed-depth-hero-mark-line">CH</span>
          </div>
        </div>

        {isDesktop ? (
          <div className="ed-depth-split mt-14 sm:mt-16">
            <nav className="ed-depth-rail" aria-label={t('engineeringDepth.title')}>
              {DEPTH_GROUPS.map((group) => {
                const active = group.id === activeId;
                return (
                  <button
                    key={group.id}
                    type="button"
                    className={`ed-depth-rail-btn${active ? ' ed-depth-rail-btn-active' : ''}`}
                    onClick={() => selectGroup(group.id)}
                    aria-current={active ? 'true' : undefined}
                  >
                    <span className="ed-depth-rail-index ed-mono">{GROUP_INDEX[group.id]}</span>
                    <span className="ed-depth-rail-text">
                      <span className="ed-depth-rail-label ed-mono">{t(`engineeringDepth.groups.${group.id}.label`)}</span>
                      <span className="ed-depth-rail-title">{t(`engineeringDepth.groups.${group.id}.title`)}</span>
                    </span>
                    <span className="ed-depth-rail-bar" aria-hidden>
                      <span style={{ width: active ? '100%' : '28%' }} />
                    </span>
                  </button>
                );
              })}
            </nav>
            <div className="ed-depth-stage" data-depth-active={activeId}>
              <DepthGroupPanel group={activeGroup} layout="stage" />
            </div>
          </div>
        ) : (
          <div className="ed-depth-stack mt-12">
            {DEPTH_GROUPS.map((group) => (
              <DepthGroupPanel
                key={group.id}
                group={group}
                layout="accordion"
                defaultOpen={false}
              />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
