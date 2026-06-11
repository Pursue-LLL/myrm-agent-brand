/**
 * [INPUT]
 * - landing/*Section 各区块组件 (POS: 落地页分区展示)
 * - marketing-nav::buildMarketingNavLinks (POS: DRY nav definition — prevents LandingEditorial / MarketingShell drift)
 * - hooks/useDocsLocale (POS: 站点 locale → Mintlify docs locale)
 *
 * [OUTPUT]
 * - LandingEditorial: 首页 `/` 完整区块编排；Hero 桌面下载主 CTA + 本地 Quick Start 次 CTA
 *
 * [POS]
 * 落地页唯一编排入口；顺序见 `marketing/_ARCH.md`「Landing 区块顺序」。
 */
'use client';

import Link from 'next/link';
import { useTranslations } from 'next-intl';
import { useDocsLocale } from '@/hooks/useDocsLocale';
import { useState } from 'react';
import {
  ArrowRight02Icon,
  Search01Icon,
  SourceCodeIcon,
  RepeatIcon,
  PencilEdit01Icon,
} from 'hugeicons-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils/classnameUtils';
import { buildMarketingNavLinks, getMarketingLoginHref, getMarketingQuickStartHref, getMarketingRegisterHref } from '@/lib/marketing-nav';
import { useRevealOnScroll, useScrollProgress, useCursorTrail } from './landing/hooks';
import { MagneticButton, TiltCard } from './landing/interactive';
import ColonyLayer from './landing/colony/ColonyLayer';
import BenchmarkSection from './landing/BenchmarkSection';
import EngineeringDepthSection from './landing/EngineeringDepthSection';
import AdvantagesSection from './landing/AdvantagesSection';
import QuickStartSection from './landing/QuickStartSection';
import HowItWorksSection from './landing/HowItWorksSection';
import PathStrip from './landing/PathStrip';
import { DeployPathProvider } from './landing/deploy-path-context';
import DeploySection from './landing/DeploySection';
import TestimonialsSection from './landing/TestimonialsSection';
import WhyMyrmAgentSection from './landing/WhyMyrmAgentSection';
import FooterSection from './landing/FooterSection';
import IntegrationMarquee from './landing/IntegrationMarquee';
import BrandLogo from './BrandLogo';
import LocaleSwitcher from './LocaleSwitcher';
import { DifferentiatorStripFromLocale, MultilineHeading } from './landing/HeroTypography';
import EasterEggField from './EasterEgg';
import MouseGlowLayer from './MouseGlowLayer';
import SmartDownloadButton from '@/components/download/SmartDownloadButton';
import HeroDownloadFootnote from '@/components/download/HeroDownloadFootnote';
import { DesktopReleaseProvider } from '@/components/download/DesktopReleaseProvider';
import WorkspacePreview from './landing/WorkspacePreview';

function GitHubIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className}>
      <path d="M12 2C6.477 2 2 6.484 2 12.021c0 4.428 2.865 8.185 6.839 9.510.5.092.682-.218.682-.483 0-.237-.009-.868-.013-1.703-2.782.605-3.369-1.342-3.369-1.342-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.339-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844a9.59 9.59 0 012.504.338c1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.02 10.02 0 0022 12.021C22 6.484 17.522 2 12 2z" />
    </svg>
  );
}

const USE_CASE_ICONS = { research: Search01Icon, coding: SourceCodeIcon, automation: RepeatIcon, content: PencilEdit01Icon };
const USE_CASE_KEYS = ['research', 'coding', 'automation', 'content'] as const;
const FAQ_ITEMS = ['what', 'local', 'data'] as const;

export default function LandingEditorial() {
  const t = useTranslations('marketing');
  const docsLocale = useDocsLocale();
  const downloadHref = getMarketingRegisterHref(docsLocale);
  const quickStartHref = getMarketingQuickStartHref(docsLocale);
  const containerRef = useRevealOnScroll();
  const scrollProgress = useScrollProgress();
  const trailRef = useCursorTrail();
  const [mobileOpen, setMobileOpen] = useState(false);

  type NavLink = { href: string; label: string; external?: true; icon?: 'github' };
  const navLinks: NavLink[] = buildMarketingNavLinks(t, { docsLocale });

  return (
    <>
      <DesktopReleaseProvider>
      <div className="ed-side-label">MYRMAGENT &mdash; AGENT WORKSPACE</div>

      {/* Full-screen immersive mobile menu */}
      {mobileOpen && (
        <div
          className="ed-mobile-menu fixed inset-0 z-[100] flex flex-col md:hidden"
          style={{ background: 'var(--ed-bg)', color: 'var(--ed-ink)' }}
        >
          <div className="flex items-center justify-between px-6 h-14" style={{ borderBottom: '1px solid var(--ed-border)' }}>
            <Link href="/" className="flex items-center gap-2.5" onClick={() => setMobileOpen(false)}>
              <BrandLogo />
              <span className="text-sm font-medium tracking-tight">{t('brand')}</span>
            </Link>
            <button
              type="button"
              className="relative inline-flex h-9 w-9 items-center justify-center rounded-lg"
              style={{ color: 'var(--ed-dim)' }}
              onClick={() => setMobileOpen(false)}
              aria-label="Close menu"
            >
              <span className="ed-hamburger-line ed-hamburger-top ed-hamburger-active" />
              <span className="ed-hamburger-line ed-hamburger-bot ed-hamburger-active" />
            </button>
          </div>

          <div className="relative flex flex-col items-center justify-center flex-1 px-8">
            <nav className="flex flex-col items-center gap-2 w-full max-w-xs">
              {navLinks.map((link) => {
                const inner = (
                  <>
                    {link.icon === 'github' && <GitHubIcon className="h-6 w-6" />}
                    <span>{link.label}</span>
                  </>
                );
                const cls = 'inline-flex items-center justify-center gap-3 py-4 text-[22px] font-semibold tracking-tight transition-colors';
                const stl = { color: 'var(--ed-ink)' };
                return link.external ? (
                  <a key={link.href} href={link.href} target="_blank" rel="noopener noreferrer" className={cls} style={stl} onClick={() => setMobileOpen(false)}>
                    {inner}
                  </a>
                ) : (
                  <Link key={link.href} href={link.href} className={cls} style={stl} onClick={() => setMobileOpen(false)}>
                    {inner}
                  </Link>
                );
              })}
            </nav>
          </div>

          <div className="px-8 pb-10 flex flex-col gap-3">
            <div className="mb-2 flex justify-center">
              <LocaleSwitcher />
            </div>
            <a
              href={getMarketingLoginHref(docsLocale)}
              className="rounded-2xl px-4 py-3.5 text-center text-[15px] font-medium transition-colors"
              style={{ color: 'var(--ed-dim)', border: '1px solid var(--ed-border)' }}
              onClick={() => setMobileOpen(false)}
            >
              {t('nav.localSetup')}
            </a>
            <Button asChild size="lg" className="ed-cta w-full rounded-2xl border-0 py-4 text-[15px] font-semibold text-white" style={{ background: 'var(--ed-accent)' }}>
              <a href={downloadHref} onClick={() => setMobileOpen(false)}>
                {t('nav.getStarted')}
                <ArrowRight02Icon className="ml-2 h-4 w-4" />
              </a>
            </Button>
            <p className="mt-4 text-center text-[10px] uppercase tracking-[0.3em]" style={{ color: 'var(--ed-muted)', fontFamily: 'var(--ed-mono)' }}>
              {t('hero.badge')}
            </p>
          </div>
        </div>
      )}

      <MouseGlowLayer />

      <div ref={containerRef} className="ed-page ed-grain ed-page-enter relative min-h-screen overflow-x-hidden" style={{ background: 'var(--ed-bg)', color: 'var(--ed-ink)' }}>
        <div className="ed-progress" style={{ transform: `scaleX(${scrollProgress})` }} />
        <div ref={trailRef} className="pointer-events-none fixed inset-0 z-[9998]" />

        {/* Nav — stays above easter-egg overlay */}
        <header className="sticky top-0 z-50 backdrop-blur-xl" style={{ borderBottom: '1px solid var(--ed-border)', background: 'color-mix(in oklch, var(--ed-bg) 88%, transparent)' }}>
          <div className="mx-auto flex h-14 max-w-[1080px] items-center justify-between px-6">
            <Link href="/" className="flex items-center gap-2.5 group">
              <BrandLogo />
              <span className="text-sm font-medium tracking-tight">{t('brand')}</span>
            </Link>
            <nav className="hidden items-center gap-8 md:flex">
              {navLinks.map((link) =>
                link.external ? (
                  <a key={link.href} href={link.href} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 text-[13px] font-light transition-colors hover:text-[var(--ed-accent)]" style={{ color: 'var(--ed-dim)' }}>
                    {link.icon === 'github' && <GitHubIcon className="h-4 w-4" />}
                    {link.label}
                  </a>
                ) : (
                  <Link key={link.href} href={link.href} className="text-[13px] font-light transition-colors hover:text-[var(--ed-accent)]" style={{ color: 'var(--ed-dim)' }}>
                    {link.label}
                  </Link>
                ),
              )}
            </nav>
            <div className="hidden items-center gap-4 md:flex">
              <LocaleSwitcher />
              <a href={getMarketingLoginHref(docsLocale)} className="text-[13px] font-light" style={{ color: 'var(--ed-dim)' }}>
                {t('nav.localSetup')}
              </a>
              <Button asChild size="sm" className="ed-cta rounded-full border-0 px-5 text-xs font-medium text-white" style={{ background: 'var(--ed-accent)' }}>
                <a href={downloadHref}>{t('nav.getStarted')}</a>
              </Button>
            </div>
            <div className="flex items-center gap-2 md:hidden">
              <LocaleSwitcher />
              <button
                type="button"
                className="ed-hamburger relative inline-flex h-9 w-9 items-center justify-center rounded-lg"
                style={{ color: 'var(--ed-dim)' }}
                aria-label={mobileOpen ? 'Close menu' : 'Open menu'}
                onClick={() => setMobileOpen((v) => !v)}
              >
                <span className={cn('ed-hamburger-line ed-hamburger-top', mobileOpen && 'ed-hamburger-active')} />
                <span className={cn('ed-hamburger-line ed-hamburger-bot', mobileOpen && 'ed-hamburger-active')} />
              </button>
            </div>
          </div>

        </header>

        <div className="relative z-[1]">

        <div data-colony-root className="relative">
          <div className="pointer-events-none absolute inset-0 z-0">
            <ColonyLayer />
          </div>

        {/* Hero */}
        <section className="relative mx-auto max-w-[1080px] px-6 pt-24 pb-20 sm:pt-48 sm:pb-40">
          <div className="relative mx-auto max-w-[620px] text-center">
            <p className="mb-6 text-[10px] uppercase tracking-[0.25em] font-medium ed-mono ed-hero-sub" style={{ color: 'var(--ed-accent)' }}>
              {t('hero.badge')}
            </p>
            <h1 className="ed-hero-title ed-text-gradient text-[clamp(2.6rem,6.5vw,4.5rem)] font-semibold leading-[1.14] tracking-[-0.03em]">
              <MultilineHeading text={t('hero.title')} />
            </h1>
            <p className="ed-hero-sub mt-10 text-[18px] leading-[1.75] font-light" style={{ color: 'var(--ed-dim)' }}>
              {t('hero.subtitle')}
            </p>
          </div>
          <DifferentiatorStripFromLocale />
          <div className="relative mx-auto max-w-[620px] text-center">
            <div className="ed-hero-cta mt-14 flex flex-col items-center gap-4">
              <div className="flex w-full max-w-md flex-col items-stretch gap-3 sm:max-w-none sm:flex-row sm:items-center sm:justify-center">
                <div data-colony-anchor="cta" className="sm:flex-1 sm:flex sm:justify-end">
                  <MagneticButton>
                    <SmartDownloadButton
                      variant="hero"
                      showMeta={false}
                      showAllPlatformsLink={false}
                      className="w-full sm:w-auto"
                    />
                  </MagneticButton>
                </div>
                <div className="w-full sm:w-auto sm:flex-1 sm:flex sm:justify-start">
                  <Button
                    asChild
                    size="lg"
                    variant="outline"
                    className="ed-secondary-cta w-full rounded-full px-9 font-medium sm:w-auto"
                  >
                    <a href={quickStartHref}>
                      {t('hero.ctaPrimary')}
                      <ArrowRight02Icon className="ml-2 h-4 w-4" />
                    </a>
                  </Button>
                </div>
              </div>
              <HeroDownloadFootnote />
              <p className="text-center text-[11px] sm:text-[12px] ed-mono tracking-wide px-4" style={{ color: 'var(--ed-muted)' }}>
                {t('hero.pathHint')}
              </p>
              <a
                href="https://github.com/Pursue-LLL/myrm-agent"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 text-[13px] ed-mono tracking-wide transition-opacity hover:opacity-80"
                style={{ color: 'var(--ed-muted)' }}
              >
                <GitHubIcon className="h-4 w-4" />
                {t('hero.ctaSecondary')}
                <ArrowRight02Icon className="h-3.5 w-3.5" />
              </a>
              <p className="text-center text-[12px] sm:text-[13px] ed-mono leading-relaxed tracking-wide" style={{ color: 'var(--ed-dim)' }}>
                {t('hero.colonyTagline')}
              </p>
              <span className="sr-only">{t('hero.colonyA11y')}</span>
            </div>
          </div>
        </section>

        <section className="relative mx-auto max-w-[1080px] px-6 pb-20 sm:pb-32" aria-label={t('demo.preview.alt')}>
          <div className="ed-reveal mx-auto max-w-[900px]">
            <WorkspacePreview />
            <p className="mt-4 text-center text-[12px] font-light leading-relaxed" style={{ color: 'var(--ed-muted)' }}>
              {t('demo.caption')}
            </p>
          </div>
        </section>

        </div>

        <DeployPathProvider>
          <HowItWorksSection />

          <QuickStartSection />
        </DeployPathProvider>

        <div className="ed-divider" />

        <IntegrationMarquee />

        <div id="features">
          <AdvantagesSection />
        </div>

        <div className="ed-divider" />

        <BenchmarkSection />

        <div className="ed-divider" />

        <EngineeringDepthSection />

        {/* Use Cases */}
        <section className="ed-section-alt py-20 sm:py-40">
          <div className="mx-auto max-w-[1080px] px-6">
            <div className="ed-reveal mx-auto max-w-md text-center">
              <h2 className="text-[clamp(1.8rem,4vw,2.6rem)] font-semibold tracking-[-0.02em]">{t('useCases.title')}</h2>
              <p className="mt-5 text-[15px] leading-relaxed font-light" style={{ color: 'var(--ed-dim)' }}>{t('useCases.subtitle')}</p>
            </div>
            <div className="mt-12 sm:mt-20 grid gap-6 sm:grid-cols-2">
              {USE_CASE_KEYS.map((key, i) => {
                const Icon = USE_CASE_ICONS[key];
                return (
                  <TiltCard key={key} className={cn('ed-reveal ed-card rounded-2xl p-7', `ed-stagger-${(i % 3) + 1}`)} style={{ border: '1px solid var(--ed-border)', background: 'var(--ed-surface)' }}>
                    <div className="flex items-center gap-3 mb-4">
                      <div className="ed-icon inline-flex h-9 w-9 items-center justify-center rounded-lg" style={{ background: 'var(--ed-accent-soft)' }}>
                        <Icon className="h-[16px] w-[16px]" style={{ color: 'var(--ed-accent)' }} />
                      </div>
                      <span className="text-[10px] uppercase tracking-[0.2em] font-medium ed-mono" style={{ color: 'var(--ed-accent)' }}>
                        {t(`useCases.items.${key}.tag`)}
                      </span>
                    </div>
                    <h3 className="text-[15px] font-semibold">{t(`useCases.items.${key}.title`)}</h3>
                    <p className="mt-2 text-[14px] leading-[1.75] font-light" style={{ color: 'var(--ed-dim)' }}>
                      {t(`useCases.items.${key}.description`)}
                    </p>
                    <p className="mt-4 rounded-lg px-4 py-3 text-[12px] ed-mono leading-relaxed italic" style={{ background: 'var(--ed-bg)', color: 'var(--ed-muted)', border: '1px solid var(--ed-border)' }}>
                      {t(`useCases.items.${key}.prompt`)}
                    </p>
                  </TiltCard>
                );
              })}
            </div>
          </div>
        </section>

        <div className="ed-divider" />

        <DeploySection />

        <div className="ed-divider" />

        {/* Integrations */}
        <section className="ed-section-alt py-20 sm:py-40">
          <div className="mx-auto max-w-[1080px] px-6">
            <div className="ed-reveal mx-auto max-w-md text-center">
              <h2 className="text-[clamp(1.8rem,4vw,2.6rem)] font-semibold tracking-[-0.02em]">{t('integrations.title')}</h2>
              <p className="mt-5 text-[15px] leading-relaxed font-light" style={{ color: 'var(--ed-dim)' }}>{t('integrations.subtitle')}</p>
            </div>
            <div className="mt-16 space-y-10">
              <div className="ed-reveal">
                <p className="mb-4 text-[10px] uppercase tracking-[0.2em] font-medium ed-mono" style={{ color: 'var(--ed-accent)' }}>{t('integrations.categories.llm')}</p>
                <div className="flex flex-wrap gap-3">
                  {t('integrations.llmList').split(' · ').map((name) => (
                    <span key={name} className="ed-shimmer inline-flex items-center rounded-full px-4 py-2 text-[13px] font-light" style={{ border: '1px solid var(--ed-border)', background: 'var(--ed-surface)', color: 'var(--ed-ink)' }}>
                      {name}
                    </span>
                  ))}
                </div>
              </div>
              <div className="ed-reveal ed-stagger-2">
                <p className="mb-4 text-[10px] uppercase tracking-[0.2em] font-medium ed-mono" style={{ color: 'var(--ed-accent)' }}>{t('integrations.categories.tools')}</p>
                <div className="flex flex-wrap gap-3">
                  {t('integrations.toolsList').split(' · ').map((name) => (
                    <span key={name} className="ed-shimmer inline-flex items-center rounded-full px-4 py-2 text-[13px] font-light" style={{ border: '1px solid var(--ed-border)', background: 'var(--ed-surface)', color: 'var(--ed-ink)' }}>
                      {name}
                    </span>
                  ))}
                </div>
              </div>
              <p className="ed-reveal ed-stagger-3 text-center text-[12px] ed-mono" style={{ color: 'var(--ed-muted)' }}>{t('integrations.more')}</p>
            </div>
          </div>
        </section>

        <div className="ed-divider" />

        <TestimonialsSection />

        <div className="ed-divider" />

        <WhyMyrmAgentSection />

        <div className="ed-divider" />

        {/* FAQ */}
        <section id="faq" className="ed-section-alt py-20 sm:py-40">
          <div className="mx-auto max-w-[620px] px-6">
            <h2 className="ed-reveal text-center text-[clamp(1.8rem,4vw,2.6rem)] font-semibold tracking-[-0.02em]">{t('faq.title')}</h2>
            <div className="mt-16 space-y-0">
              {FAQ_ITEMS.map((key) => (
                <details key={key} className="ed-reveal ed-faq py-5" style={{ borderBottom: '1px solid var(--ed-border)' }}>
                  <summary className="text-[15px] font-medium">
                    <span className="flex items-center justify-between gap-4">
                      {t(`faq.items.${key}.question`)}
                      <span className="shrink-0 text-lg leading-none transition-transform duration-300" style={{ color: 'var(--ed-muted)' }}>+</span>
                    </span>
                  </summary>
                  <div className="ed-faq-body">
                    <div className="ed-faq-inner">
                      <p className="pt-4 pb-1 text-[14px] leading-[1.8] font-light" style={{ color: 'var(--ed-dim)' }}>{t(`faq.items.${key}.answer`)}</p>
                    </div>
                  </div>
                </details>
              ))}
            </div>
          </div>
        </section>

        {/* Final CTA */}
        <section className="py-20 sm:py-36 text-center" style={{ borderTop: '1px solid var(--ed-border)' }}>
          <div className="ed-reveal mx-auto max-w-[480px] px-6">
            <h2 className="text-[clamp(1.8rem,4vw,2.8rem)] font-semibold tracking-[-0.02em]" style={{ fontFamily: 'var(--ed-serif)' }}>
              <MultilineHeading text={t('hero.title')} />
            </h2>
            <p className="mt-5 text-[15px] font-light leading-relaxed" style={{ color: 'var(--ed-dim)' }}>
              {t('hero.subtitle')}
            </p>
            <PathStrip className="mt-8" showHint={false} />
          </div>
        </section>

        <FooterSection />
        </div>

        <EasterEggField />
      </div>
      </DesktopReleaseProvider>
    </>
  );
}
