/**
 * [INPUT]
 * - next-intl marketing.highlightsCarousel namespace
 * - deploy-mode::getDocsUrl (POS: 营销站外部链接统一入口)
 * - ui/carousel (Embla)
 *
 * [OUTPUT]
 * - HighlightsCarouselSection: 8-slide editorial split tour (left rail + Embla vertical carousel)
 *
 * [POS]
 * 落地页亮点轮播；与 Advantages Bento 解耦，讲故事而非重复六能力。
 */
'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useTranslations } from 'next-intl';
import Autoplay from 'embla-carousel-autoplay';
import { ArrowLeft02Icon, ArrowRight02Icon } from 'hugeicons-react';
import { COMPETITOR_COMPARISON_DOC_PATH } from '@/lib/docs-contract';
import { useDocsLocale } from '@/hooks/useDocsLocale';
import { getDocsUrl } from '@/lib/deploy-mode';
import { cn } from '@/lib/utils/classnameUtils';
import { Carousel, CarouselContent, CarouselItem, type CarouselApi } from '@/components/ui/carousel';
import {
  HIGHLIGHT_SLIDE_KEYS,
  highlightSlideBasePath,
  type HighlightSlideKey,
} from './marketing-keys';

const AUTO_PLAY_MS = 6000;
const SECTION_IO_THRESHOLD = 0.15;

export const HIGHLIGHTS_SECTION_ID = 'highlights';

/** Scroll only within the left rail — never call scrollIntoView (it scrolls the page). */
function scrollRailItemIntoView(rail: HTMLElement, item: HTMLElement): void {
  const itemTop = item.offsetTop;
  const itemBottom = itemTop + item.offsetHeight;
  const viewTop = rail.scrollTop;
  const viewBottom = viewTop + rail.clientHeight;

  if (itemTop < viewTop) {
    rail.scrollTop = itemTop;
  } else if (itemBottom > viewBottom) {
    rail.scrollTop = itemBottom - rail.clientHeight;
  }
}

type MarketingKey = Parameters<ReturnType<typeof useTranslations<'marketing'>>>[0];

function HighlightTourCard({ slideKey }: { slideKey: HighlightSlideKey }) {
  const t = useTranslations('marketing');
  const base = highlightSlideBasePath(slideKey);

  return (
    <article className="hl-tour-card">
      <div className="hl-carousel-card-mesh" aria-hidden />
      <div className="hl-tour-card-body">
        <div className="hl-tour-card-copy">
          <p className="hl-carousel-label ed-mono">{t(`${base}.label` as MarketingKey)}</p>
          <h3 className="hl-carousel-slide-title">{t(`${base}.title` as MarketingKey)}</h3>
          <p className="hl-carousel-slide-desc">{t(`${base}.desc` as MarketingKey)}</p>
          <ul className="hl-carousel-tags">
            {[1, 2, 3].map((n) => (
              <li key={n} className="hl-carousel-tag ed-mono">
                {t(`${base}.tag${n}` as MarketingKey)}
              </li>
            ))}
          </ul>
        </div>
        <div className="hl-tour-stat-block">
          <span className="hl-tour-stat-value ed-heading-accent">{t(`${base}.stat` as MarketingKey)}</span>
          <span className="hl-tour-stat-label ed-mono">{t(`${base}.statLabel` as MarketingKey)}</span>
        </div>
      </div>
    </article>
  );
}

export default function HighlightsCarouselSection() {
  const t = useTranslations('marketing');
  const docsLocale = useDocsLocale();
  const compareHref = getDocsUrl(COMPETITOR_COMPARISON_DOC_PATH, docsLocale);
  const [api, setApi] = useState<CarouselApi>();
  const [activeIndex, setActiveIndex] = useState(0);
  const sectionRef = useRef<HTMLElement>(null);
  const railRef = useRef<HTMLDivElement>(null);
  const autoplayRef = useRef(Autoplay({ delay: AUTO_PLAY_MS, stopOnInteraction: true }));
  const slideCount = HIGHLIGHT_SLIDE_KEYS.length;
  const activeKey = HIGHLIGHT_SLIDE_KEYS[activeIndex];

  const scrollTo = useCallback(
    (index: number) => {
      if (!api) return;
      api.scrollTo(index);
    },
    [api],
  );

  useEffect(() => {
    if (!api) return;

    const syncIndex = () => {
      setActiveIndex(api.selectedScrollSnap());
    };

    syncIndex();
    api.on('select', syncIndex);
    api.on('reInit', syncIndex);

    return () => {
      api.off('select', syncIndex);
      api.off('reInit', syncIndex);
    };
  }, [api]);

  useEffect(() => {
    const section = sectionRef.current;
    if (!section) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const autoplay = autoplayRef.current;
        if (entries[0]?.isIntersecting) {
          autoplay.play();
        } else {
          autoplay.stop();
        }
      },
      { threshold: SECTION_IO_THRESHOLD },
    );

    observer.observe(section);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const rail = railRef.current;
    if (!rail) return;
    const activeButton = rail.querySelector<HTMLButtonElement>('.hl-tour-rail-item-active');
    if (!activeButton) return;
    scrollRailItemIntoView(rail, activeButton);
  }, [activeIndex]);

  const handleKeyDown = (event: React.KeyboardEvent) => {
    if (event.key === 'ArrowRight' || event.key === 'ArrowDown') {
      event.preventDefault();
      api?.scrollNext();
    } else if (event.key === 'ArrowLeft' || event.key === 'ArrowUp') {
      event.preventDefault();
      api?.scrollPrev();
    }
  };

  return (
    <section
      ref={sectionRef}
      id={HIGHLIGHTS_SECTION_ID}
      className="ed-section-main hl-carousel-section py-20 sm:py-32"
      data-hl-active={activeKey}
      onMouseEnter={() => autoplayRef.current.stop()}
      onMouseLeave={() => autoplayRef.current.play()}
    >
      <div className="ed-depth-grain" aria-hidden />
      <div className="ed-depth-ambient" aria-hidden />
      <div className="hl-carousel-beams" aria-hidden />
      <div className="relative mx-auto max-w-[1120px] px-6">
        <div className="ed-depth-hero">
          <div className="ed-depth-hero-copy mx-auto text-center md:mx-0 md:text-left">
            <p className="ed-depth-eyebrow ed-mono">{t('highlightsCarousel.eyebrow')}</p>
            <h2 className="ed-depth-hero-title ed-heading-accent">{t('highlightsCarousel.title')}</h2>
            <p className="ed-depth-hero-sub">{t('highlightsCarousel.subtitle')}</p>
            <a
              href={compareHref}
              target="_blank"
              rel="noopener noreferrer"
              className="ed-depth-cta ed-depth-cta-aurora ed-mono mt-5 inline-flex items-center gap-1.5 text-[13px] font-medium transition-opacity hover:opacity-85"
            >
              {t('highlightsCarousel.compareCta')}
              <ArrowRight02Icon className="h-3.5 w-3.5" />
            </a>
          </div>
        </div>

        <div
          className="hl-tour mt-12 sm:mt-14"
          aria-label={t('highlightsCarousel.title')}
          onKeyDown={handleKeyDown}
        >
          <aside ref={railRef} className="hl-tour-rail" aria-label={t('highlightsCarousel.title')}>
            {HIGHLIGHT_SLIDE_KEYS.map((slideKey, index) => {
              const base = highlightSlideBasePath(slideKey);
              const isActive = index === activeIndex;
              return (
                <button
                  key={slideKey}
                  id={`hl-dot-${slideKey}`}
                  type="button"
                  role="tab"
                  aria-selected={isActive}
                  aria-controls={`hl-slide-${slideKey}`}
                  className={cn('hl-tour-rail-item', isActive && 'hl-tour-rail-item-active')}
                  onClick={() => scrollTo(index)}
                >
                  <span className="hl-tour-rail-marker" aria-hidden>
                    <span className="hl-tour-rail-num ed-mono">{String(index + 1).padStart(2, '0')}</span>
                  </span>
                  <span className="hl-tour-rail-text">
                    <span className="hl-tour-rail-label ed-mono">{t(`${base}.label` as MarketingKey)}</span>
                    {isActive ? (
                      <span
                        className="hl-tour-rail-progress"
                        style={{ animationDuration: `${AUTO_PLAY_MS}ms` }}
                      />
                    ) : null}
                  </span>
                </button>
              );
            })}
          </aside>

          <div className="hl-tour-main">
            <div className="hl-tour-toolbar">
              <p className="hl-tour-index ed-mono" aria-live="polite">
                {String(activeIndex + 1).padStart(2, '0')}
                <span className="hl-tour-index-sep">/</span>
                {String(slideCount).padStart(2, '0')}
              </p>
              <div className="hl-carousel-nav">
                <button
                  type="button"
                  className="hl-carousel-arrow"
                  onClick={() => api?.scrollPrev()}
                  aria-label={t('highlightsCarousel.prevAria')}
                >
                  <ArrowLeft02Icon className="h-4 w-4" aria-hidden />
                </button>
                <button
                  type="button"
                  className="hl-carousel-arrow"
                  onClick={() => api?.scrollNext()}
                  aria-label={t('highlightsCarousel.nextAria')}
                >
                  <ArrowRight02Icon className="h-4 w-4" aria-hidden />
                </button>
              </div>
            </div>

            <div className="hl-tour-embla-wrap">
              <Carousel
                setApi={setApi}
                orientation="vertical"
                opts={{ align: 'start', loop: true, dragFree: false }}
                plugins={[autoplayRef.current]}
                className="hl-tour-embla"
              >
                <CarouselContent className="hl-tour-embla-content">
                  {HIGHLIGHT_SLIDE_KEYS.map((slideKey, index) => (
                    <CarouselItem
                      key={slideKey}
                      id={`hl-slide-${slideKey}`}
                      role="tabpanel"
                      aria-labelledby={`hl-dot-${slideKey}`}
                      aria-hidden={index !== activeIndex}
                      className="hl-tour-embla-item"
                    >
                      <HighlightTourCard slideKey={slideKey} />
                    </CarouselItem>
                  ))}
                </CarouselContent>
              </Carousel>
              <div className="hl-tour-scroll-fade" aria-hidden />
            </div>

            <div className="hl-carousel-dots hl-tour-dots-mobile" role="tablist" aria-label={t('highlightsCarousel.title')}>
              {HIGHLIGHT_SLIDE_KEYS.map((slideKey, index) => (
                <button
                  key={slideKey}
                  type="button"
                  role="tab"
                  aria-selected={index === activeIndex}
                  aria-controls={`hl-slide-${slideKey}`}
                  aria-label={t('highlightsCarousel.gotoSlideAria', { index: index + 1 })}
                  className={cn('hl-carousel-dot', index === activeIndex && 'hl-carousel-dot-active')}
                  onClick={() => scrollTo(index)}
                >
                  <span
                    className="hl-carousel-dot-progress"
                    style={
                      index === activeIndex
                        ? { animationDuration: `${AUTO_PLAY_MS}ms` }
                        : undefined
                    }
                  />
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
