/**
 * [INPUT]
 * - next-intl marketing.engineeringDepth namespace
 * - depth-evidence::readDepthGroupFromLocation (share URL ?group=)
 * - deploy-mode::getDocsUrl (POS: 营销站外部链接统一入口)
 *
 * [OUTPUT]
 * - EngineeringDepthSection: 产品深度区（pill tabs + spotlight 布局）；分享直链 ?group=
 *
 * [POS]
 * 落地页产品深度区块。六组 × 三卡营销展示；与 Bento 独立，自然滚动衔接。
 */
'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { useTranslations } from 'next-intl';
import { ArrowRight02Icon } from 'hugeicons-react';
import { COMPETITOR_COMPARISON_DOC_PATH } from '@/lib/docs-contract';
import { useDocsLocale } from '@/hooks/useDocsLocale';
import { getDocsUrl } from '@/lib/deploy-mode';
import { scrollToSection } from '@/lib/deploy-paths';
import {
  ENGINEERING_DEPTH_SECTION_ID,
  readDepthGroupFromLocation,
  writeDepthEvidenceLink,
} from './depth-evidence';
import { TiltCard } from './interactive';
import {
  DEPTH_GROUPS,
  depthItemBasePath,
  type BentoKey,
  type DepthGroupDef,
  type DepthItemKey,
} from './marketing-keys';

const DEFAULT_ACTIVE_ID = DEPTH_GROUPS.find((g) => g.defaultOpen)?.id ?? DEPTH_GROUPS[0].id;

type MarketingKey = Parameters<ReturnType<typeof useTranslations<'marketing'>>>[0];

const DEPTH_PANEL_ID = 'ed-depth-panel';

function depthTabId(groupId: BentoKey): string {
  return `ed-depth-tab-${groupId}`;
}

function DepthFeatureCard({
  itemKey,
  variant,
}: {
  itemKey: DepthItemKey;
  variant: 'featured' | 'secondary';
}) {
  const t = useTranslations('marketing');
  const base = depthItemBasePath(itemKey);
  const badgeKey = `${base}.badge` as MarketingKey;
  const hasBadge = t.has(badgeKey);

  return (
    <>
      {hasBadge && <span className="ed-depth-badge ed-mono">{t(badgeKey)}</span>}
      <h4 className={variant === 'featured' ? 'ed-depth-spot-title ed-depth-spot-title-lg' : 'ed-depth-spot-title'}>
        {t(`${base}.title` as MarketingKey)}
      </h4>
      <p className={variant === 'featured' ? 'ed-depth-spot-desc ed-depth-spot-desc-lg' : 'ed-depth-spot-desc'}>
        {t(`${base}.desc` as MarketingKey)}
      </p>
    </>
  );
}

function DepthSpotlight({ group }: { group: DepthGroupDef }) {
  const [featured, ...secondary] = group.items;

  return (
    <div className="ed-depth-spotlight">
      <TiltCard className="ed-depth-spot ed-depth-spot-featured ed-depth-card-glow ed-stagger-1">
        <div className="ed-depth-spot-mesh" aria-hidden />
        <div className="ed-depth-spot-inner">
          <DepthFeatureCard itemKey={featured} variant="featured" />
        </div>
      </TiltCard>
      <div className="ed-depth-spot-side">
        {secondary.map((itemKey, index) => (
          <article
            key={itemKey}
            className={`ed-depth-spot ed-depth-spot-secondary ed-depth-card-glow ed-stagger-${index + 2}`}
          >
            <div className="ed-depth-spot-inner">
              <DepthFeatureCard itemKey={itemKey} variant="secondary" />
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}

export default function EngineeringDepthSection() {
  const t = useTranslations('marketing');
  const docsLocale = useDocsLocale();
  const compareHref = getDocsUrl(COMPETITOR_COMPARISON_DOC_PATH, docsLocale);
  const [activeId, setActiveId] = useState<BentoKey>(DEFAULT_ACTIVE_ID);
  const tabRefs = useRef<Partial<Record<BentoKey, HTMLButtonElement>>>({});

  const activeGroup = DEPTH_GROUPS.find((g) => g.id === activeId) ?? DEPTH_GROUPS[0];

  const scrollActiveTabIntoView = useCallback((id: BentoKey) => {
    tabRefs.current[id]?.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'nearest' });
  }, []);

  const scrollToDepthSection = useCallback(() => {
    requestAnimationFrame(() => scrollToSection(ENGINEERING_DEPTH_SECTION_ID));
  }, []);

  const selectGroup = useCallback(
    (id: BentoKey) => {
      setActiveId(id);
      writeDepthEvidenceLink(id);
      requestAnimationFrame(() => scrollActiveTabIntoView(id));
    },
    [scrollActiveTabIntoView],
  );

  useEffect(() => {
    const fromLocation = readDepthGroupFromLocation();
    if (fromLocation) {
      setActiveId(fromLocation);
    }

    const hashRoot = window.location.hash.slice(1).split('?')[0];
    if (hashRoot !== ENGINEERING_DEPTH_SECTION_ID && !fromLocation) return;

    scrollToDepthSection();
    if (fromLocation) {
      requestAnimationFrame(() => scrollActiveTabIntoView(fromLocation));
    }
  }, [scrollActiveTabIntoView, scrollToDepthSection]);

  useEffect(() => {
    const syncFromLocation = () => {
      const fromLocation = readDepthGroupFromLocation();
      if (!fromLocation) return;
      setActiveId(fromLocation);
      scrollToDepthSection();
      requestAnimationFrame(() => scrollActiveTabIntoView(fromLocation));
    };

    window.addEventListener('hashchange', syncFromLocation);
    window.addEventListener('popstate', syncFromLocation);
    return () => {
      window.removeEventListener('hashchange', syncFromLocation);
      window.removeEventListener('popstate', syncFromLocation);
    };
  }, [scrollActiveTabIntoView, scrollToDepthSection]);

  return (
    <section
      id="engineering-depth"
      className="ed-section-main ed-depth-section py-20 sm:py-32"
      data-depth-active={activeId}
    >
      <div className="ed-depth-grain" aria-hidden />
      <div className="ed-depth-ambient" aria-hidden />
      <div className="ed-depth-beams" aria-hidden />
      <div className="relative mx-auto max-w-[1120px] px-6">
        <div className="ed-depth-hero">
          <div className="ed-depth-hero-copy">
            <p className="ed-depth-eyebrow ed-mono">{t('engineeringDepth.eyebrow')}</p>
            <h2 className="ed-depth-hero-title ed-heading-accent">{t('engineeringDepth.title')}</h2>
            <p className="ed-depth-hero-sub">{t('engineeringDepth.subtitle')}</p>
            <a
              href={compareHref}
              target="_blank"
              rel="noopener noreferrer"
              className="ed-depth-cta ed-depth-cta-aurora ed-mono inline-flex items-center gap-1.5 text-[13px] font-medium transition-opacity hover:opacity-85"
            >
              {t('engineeringDepth.compareCta')}
              <ArrowRight02Icon className="h-3.5 w-3.5" />
            </a>
          </div>
        </div>

        <div className="ed-depth-tabs-wrap mt-12 sm:mt-14">
          <nav
            className="ed-depth-tabs"
            role="tablist"
            aria-label={t('engineeringDepth.title')}
            onKeyDown={(event) => {
              const currentIndex = DEPTH_GROUPS.findIndex((group) => group.id === activeId);
              if (currentIndex === -1) return;

              let nextIndex: number | null = null;
              if (event.key === 'ArrowRight') {
                nextIndex = (currentIndex + 1) % DEPTH_GROUPS.length;
              } else if (event.key === 'ArrowLeft') {
                nextIndex = (currentIndex - 1 + DEPTH_GROUPS.length) % DEPTH_GROUPS.length;
              } else if (event.key === 'Home') {
                nextIndex = 0;
              } else if (event.key === 'End') {
                nextIndex = DEPTH_GROUPS.length - 1;
              }

              if (nextIndex === null || nextIndex === currentIndex) return;
              event.preventDefault();
              const nextGroup = DEPTH_GROUPS[nextIndex];
              selectGroup(nextGroup.id);
              tabRefs.current[nextGroup.id]?.focus();
            }}
          >
            {DEPTH_GROUPS.map((group) => {
              const active = group.id === activeId;
              return (
                <button
                  key={group.id}
                  ref={(node) => {
                    if (node) tabRefs.current[group.id] = node;
                  }}
                  type="button"
                  role="tab"
                  id={depthTabId(group.id)}
                  className={`ed-depth-tab${active ? ' ed-depth-tab-active' : ''}`}
                  onClick={() => selectGroup(group.id)}
                  aria-selected={active}
                  aria-controls={DEPTH_PANEL_ID}
                  tabIndex={active ? 0 : -1}
                >
                  <span className="ed-depth-glyph" data-depth-glyph={group.id} aria-hidden />
                  <span className="ed-depth-tab-text">
                    <span className="ed-depth-tab-label ed-mono">{t(`engineeringDepth.groups.${group.id}.label`)}</span>
                    <span className="ed-depth-tab-title">{t(`engineeringDepth.groups.${group.id}.title`)}</span>
                  </span>
                </button>
              );
            })}
          </nav>
        </div>

        <div
          className="ed-depth-panel-stage mt-8 sm:mt-10"
          role="tabpanel"
          id={DEPTH_PANEL_ID}
          aria-labelledby={depthTabId(activeId)}
        >
          <div className="ed-depth-panel-content" key={activeId}>
            <header className="ed-depth-group-intro">
              <p className="ed-depth-group-label ed-mono">{t(`engineeringDepth.groups.${activeGroup.id}.label`)}</p>
              <h3 className="ed-depth-group-headline">{t(`engineeringDepth.groups.${activeGroup.id}.title`)}</h3>
              <p className="ed-depth-group-tagline">{t(`engineeringDepth.groups.${activeGroup.id}.summary`)}</p>
            </header>
            <DepthSpotlight group={activeGroup} />
          </div>
        </div>
      </div>
    </section>
  );
}
