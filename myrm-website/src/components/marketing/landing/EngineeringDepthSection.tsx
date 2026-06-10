/**
 * [INPUT]
 * - next-intl marketing.engineeringDepth namespace
 * - depth-evidence::readDepthGroupFromLocation (share URL ?group=)
 * - deploy-mode::getDocsUrl (POS: 营销站外部链接统一入口)
 *
 * [OUTPUT]
 * - EngineeringDepthSection: 产品深度区（桌面 rail；移动 accordion）；分享直链 ?group=
 *
 * [POS]
 * 落地页产品深度区块。六组 × 三卡细节；与 Bento 独立，自然滚动衔接。
 */
'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { useTranslations } from 'next-intl';
import { ArrowRight02Icon } from 'hugeicons-react';
import { COMPETITOR_COMPARISON_DOC_PATH } from '@/lib/docs-contract';
import { useDocsLocale } from '@/hooks/useDocsLocale';
import { getDocsUrl } from '@/lib/deploy-mode';
import { scrollToSection } from '@/lib/deploy-paths';
import { useMinWidth } from './hooks';
import {
  ENGINEERING_DEPTH_SECTION_ID,
  readDepthGroupFromLocation,
  writeDepthEvidenceLink,
} from './depth-evidence';
import {
  DEPTH_GROUPS,
  depthItemBasePath,
  type BentoKey,
  type DepthGroupDef,
  type DepthItemKey,
} from './marketing-keys';

const DEPTH_POINTS = [1, 2, 3] as const;

const GROUP_INDEX: Record<BentoKey, string> = {
  selfEvolution: '01',
  security: '02',
  reliability: '03',
  costEfficiency: '04',
  visualControl: '05',
  taskModes: '06',
};

const DEFAULT_ACTIVE_ID = DEPTH_GROUPS.find((g) => g.defaultOpen)?.id ?? DEPTH_GROUPS[0].id;

function DepthFeatureCard({ itemKey, cardIndex }: { itemKey: DepthItemKey; cardIndex: number }) {
  const t = useTranslations('marketing');
  const base = depthItemBasePath(itemKey);
  const badgeKey = `${base}.badge` as Parameters<typeof t.has>[0];
  const hasBadge = t.has(badgeKey);

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
      <ul className="ed-depth-points">
        {DEPTH_POINTS.map((n) => (
          <li key={n} className="ed-depth-point">
            <span>{t(`${base}.point${n}` as Parameters<typeof t>[0])}</span>
          </li>
        ))}
      </ul>
    </article>
  );
}

function DepthCardGrid({ group }: { group: DepthGroupDef }) {
  return (
    <div className="ed-depth-grid">
      {group.items.map((itemKey, cardIndex) => (
        <DepthFeatureCard key={itemKey} itemKey={itemKey} cardIndex={cardIndex} />
      ))}
    </div>
  );
}

function DepthGroupPanel({
  group,
  layout,
  open,
  onSelect,
}: {
  group: DepthGroupDef;
  layout: 'accordion' | 'stage';
  open?: boolean;
  onSelect?: () => void;
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
    <details className="ed-depth-panel group/depth" data-depth-id={group.id} open={open}>
      <summary
        className="ed-depth-summary"
        onClick={(event) => {
          if (!onSelect) return;
          event.preventDefault();
          onSelect();
        }}
      >
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
  const docsLocale = useDocsLocale();
  const isDesktop = useMinWidth(768);
  const compareHref = getDocsUrl(COMPETITOR_COMPARISON_DOC_PATH, docsLocale);
  const [activeId, setActiveId] = useState<BentoKey>(DEFAULT_ACTIVE_ID);
  const scrollPanelRef = useRef(false);

  const activeGroup = DEPTH_GROUPS.find((g) => g.id === activeId) ?? DEPTH_GROUPS[0];

  const selectGroup = useCallback((id: BentoKey) => {
    setActiveId(id);
    writeDepthEvidenceLink(id);
  }, []);

  useEffect(() => {
    const fromLocation = readDepthGroupFromLocation();
    if (fromLocation) {
      scrollPanelRef.current = true;
      setActiveId(fromLocation);
    }
  }, []);

  useEffect(() => {
    const onLocationGroup = () => {
      const fromLocation = readDepthGroupFromLocation();
      if (!fromLocation) return;
      scrollPanelRef.current = true;
      setActiveId(fromLocation);
    };

    window.addEventListener('hashchange', onLocationGroup);
    window.addEventListener('popstate', onLocationGroup);
    return () => {
      window.removeEventListener('hashchange', onLocationGroup);
      window.removeEventListener('popstate', onLocationGroup);
    };
  }, []);

  useEffect(() => {
    if (isDesktop || !scrollPanelRef.current) return;
    scrollPanelRef.current = false;
    const panel = document.querySelector<HTMLElement>(`[data-depth-id="${activeId}"]`);
    panel?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }, [activeId, isDesktop]);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const hashRoot = window.location.hash.slice(1).split('?')[0];
    if (hashRoot !== ENGINEERING_DEPTH_SECTION_ID) return;
    scrollPanelRef.current = Boolean(readDepthGroupFromLocation());
    requestAnimationFrame(() => scrollToSection(ENGINEERING_DEPTH_SECTION_ID));
  }, []);

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
                open={group.id === activeId}
                onSelect={() => selectGroup(group.id)}
              />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
