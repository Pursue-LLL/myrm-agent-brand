/**
 * [INPUT]
 * - lib/cloud-marketing-nav.ts (POS: 云页 Nav DRY 定义)
 * - lib/cloud-paths.ts (POS: 云页 App 跳转助手)
 * - hooks/useLocale (POS: 营销站应用 locale)
 *
 * [OUTPUT]
 * - CloudShell: SaaS 页顶栏 + 页脚壳层（editorial 视觉）
 *
 * [POS]
 * `/cloud` 页面 chrome，与 OSS MarketingShell 分离。
 */
'use client';

import Link from 'next/link';
import { useState } from 'react';
import { useLocale, useTranslations } from 'next-intl';
import { ArrowRight02Icon, Cancel01Icon, Menu01Icon } from 'hugeicons-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils/classnameUtils';
import type { Locale } from '@/i18n/config';
import { buildCloudNavLinks } from '@/lib/cloud-marketing-nav';
import { getCloudLoginHref, getCloudRegisterHref } from '@/lib/cloud-paths';
import BrandLogo from '../BrandLogo';
import LocaleSwitcher from '../LocaleSwitcher';

interface CloudShellProps {
  children: React.ReactNode;
  scrollProgress: number;
}

export default function CloudShell({ children, scrollProgress }: CloudShellProps) {
  const t = useTranslations('cloud');
  const appLocale = useLocale() as Locale;
  const [mobileOpen, setMobileOpen] = useState(false);
  const navLinks = buildCloudNavLinks(t);

  return (
    <div className="ed-page ed-grain min-h-screen" style={{ background: 'var(--ed-bg)', color: 'var(--ed-ink)' }}>
      <div className="ed-progress" style={{ transform: `scaleX(${scrollProgress})` }} />

      <header
        className="sticky top-0 z-50 backdrop-blur-xl"
        style={{ borderBottom: '1px solid var(--ed-border)', background: 'color-mix(in oklch, var(--ed-bg) 88%, transparent)' }}
      >
        <div className="mx-auto flex h-14 max-w-[1080px] items-center justify-between px-6">
          <Link href="/cloud" className="flex items-center gap-2.5 font-semibold tracking-tight">
            <BrandLogo size={36} priority />
            <span className="text-sm">{t('brand')}</span>
          </Link>

          <nav className="hidden items-center gap-8 md:flex">
            {navLinks.map((link) =>
              link.external ? (
                <a
                  key={link.href}
                  href={link.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[13px] font-light transition-colors hover:text-[var(--ed-accent)]"
                  style={{ color: 'var(--ed-dim)' }}
                >
                  {link.label}
                </a>
              ) : (
                <Link
                  key={link.href}
                  href={link.href}
                  className="text-[13px] font-light transition-colors hover:text-[var(--ed-accent)]"
                  style={{ color: 'var(--ed-dim)' }}
                >
                  {link.label}
                </Link>
              ),
            )}
          </nav>

          <div className="hidden items-center gap-4 md:flex">
            <LocaleSwitcher />
            <a href={getCloudLoginHref(appLocale)} className="text-[13px] font-light" style={{ color: 'var(--ed-dim)' }}>
              {t('nav.login')}
            </a>
            <Button asChild size="sm" className="ed-cta rounded-full border-0 px-5 text-xs font-medium text-white" style={{ background: 'var(--ed-accent)' }}>
              <a href={getCloudRegisterHref(appLocale)}>
                {t('nav.getStarted')}
                <ArrowRight02Icon className="ml-1 h-4 w-4" />
              </a>
            </Button>
          </div>

          <button
            type="button"
            className="inline-flex items-center justify-center rounded-full p-2 md:hidden"
            aria-label={mobileOpen ? t('nav.closeMenu') : t('nav.openMenu')}
            onClick={() => setMobileOpen((open) => !open)}
          >
            {mobileOpen ? <Cancel01Icon className="h-5 w-5" /> : <Menu01Icon className="h-5 w-5" />}
          </button>
        </div>

        <div
          className={cn(
            'fixed inset-0 z-[100] md:hidden transition-all duration-300',
            mobileOpen ? 'opacity-100 visible pointer-events-auto' : 'opacity-0 invisible pointer-events-none',
          )}
          style={{ background: 'var(--ed-bg)' }}
        >
          <div className="flex h-14 items-center justify-between border-b px-4" style={{ borderColor: 'var(--ed-border)' }}>
            <Link href="/cloud" className="flex items-center gap-2 font-semibold" onClick={() => setMobileOpen(false)}>
              <BrandLogo size={36} priority />
              <span>{t('brand')}</span>
            </Link>
            <button type="button" onClick={() => setMobileOpen(false)} aria-label={t('nav.closeMenu')}>
              <Cancel01Icon className="h-5 w-5" />
            </button>
          </div>
          <nav className="flex flex-col items-center gap-4 py-12">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="text-lg font-medium"
                onClick={() => setMobileOpen(false)}
              >
                {link.label}
              </Link>
            ))}
          </nav>
          <div className="flex flex-col gap-3 px-6 pb-10">
            <LocaleSwitcher variant="shell" />
            <Button asChild variant="outline" size="lg" className="ed-secondary-cta w-full rounded-2xl">
              <a href={getCloudLoginHref(appLocale)} onClick={() => setMobileOpen(false)}>
                {t('nav.login')}
              </a>
            </Button>
            <Button asChild size="lg" className="ed-cta w-full rounded-2xl border-0 text-white" style={{ background: 'var(--ed-accent)' }}>
              <a href={getCloudRegisterHref(appLocale)} onClick={() => setMobileOpen(false)}>
                {t('nav.getStarted')}
              </a>
            </Button>
          </div>
        </div>
      </header>

      <main>{children}</main>

      <footer style={{ borderTop: '1px solid var(--ed-border)', background: 'color-mix(in oklch, var(--ed-bg) 92%, var(--ed-surface))' }}>
        <div className="mx-auto max-w-[1080px] px-6 py-12">
          <div className="flex flex-col gap-8 md:flex-row md:justify-between">
            <div className="max-w-sm">
              <p className="font-semibold">{t('brand')}</p>
              <p className="mt-2 text-sm font-light" style={{ color: 'var(--ed-dim)' }}>{t('footer.tagline')}</p>
              <p className="mt-2 text-xs font-light" style={{ color: 'var(--ed-muted)' }}>{t('footer.operator')}</p>
              <p className="mt-2 text-xs font-light" style={{ color: 'var(--ed-muted)' }}>{t('footer.contact')}</p>
              <Link href="/" className="mt-4 inline-block text-sm font-medium transition-colors hover:text-[var(--ed-accent)]" style={{ color: 'var(--ed-accent)' }}>
                {t('footer.selfHostLink')} →
              </Link>
            </div>
            <div className="flex flex-wrap gap-4 text-sm" style={{ color: 'var(--ed-dim)' }}>
              <Link href="/privacy" className="transition-colors hover:text-[var(--ed-accent)]">{t('footer.privacy')}</Link>
              <Link href="/terms" className="transition-colors hover:text-[var(--ed-accent)]">{t('footer.terms')}</Link>
              <Link href="/refund" className="transition-colors hover:text-[var(--ed-accent)]">{t('footer.refund')}</Link>
            </div>
          </div>
          <p className="mt-8 text-center text-xs" style={{ color: 'var(--ed-muted)' }}>
            {t('footer.copyright', { year: new Date().getFullYear() })}
          </p>
        </div>
      </footer>
    </div>
  );
}
