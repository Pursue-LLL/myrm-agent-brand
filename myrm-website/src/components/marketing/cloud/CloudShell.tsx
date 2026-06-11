/**
 * Cloud SaaS landing page shell (header + footer).
 */
'use client';

import Link from 'next/link';
import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { ArrowRight02Icon, Cancel01Icon, Menu01Icon } from 'hugeicons-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils/classnameUtils';
import {
  buildCloudNavLinks,
} from '@/lib/cloud-marketing-nav';
import { getCloudLoginHref, getCloudRegisterHref } from '@/lib/cloud-paths';
import { useDocsLocale } from '@/hooks/useDocsLocale';
import BrandLogo from '../BrandLogo';
import LocaleSwitcher from '../LocaleSwitcher';

interface CloudShellProps {
  children: React.ReactNode;
}

export default function CloudShell({ children }: CloudShellProps) {
  const t = useTranslations('cloud');
  const docsLocale = useDocsLocale();
  const [mobileOpen, setMobileOpen] = useState(false);
  const navLinks = buildCloudNavLinks(t);

  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
        <div className="absolute -top-24 left-1/2 h-[520px] w-[820px] -translate-x-1/2 rounded-full bg-primary/[0.12] blur-[100px]" />
        <div className="absolute bottom-0 right-0 h-[360px] w-[520px] rounded-full bg-violet-500/[0.08] blur-[90px]" />
      </div>

      <header className="sticky top-0 z-40 border-b border-border/60 bg-background/85 backdrop-blur-md">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6">
          <Link href="/cloud" className="flex items-center gap-2 font-semibold tracking-tight">
            <BrandLogo size={36} priority />
            <span>{t('brand')}</span>
          </Link>

          <nav className="hidden items-center gap-6 md:flex">
            {navLinks.map((link) =>
              link.external ? (
                <a
                  key={link.href}
                  href={link.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-muted-foreground transition-colors hover:text-foreground"
                >
                  {link.label}
                </a>
              ) : (
                <Link
                  key={link.href}
                  href={link.href}
                  className="text-sm text-muted-foreground transition-colors hover:text-foreground"
                >
                  {link.label}
                </Link>
              ),
            )}
          </nav>

          <div className="hidden items-center gap-3 md:flex">
            <LocaleSwitcher variant="shell" />
            <Button asChild variant="outline" size="sm">
              <a href={getCloudLoginHref(docsLocale)}>{t('nav.login')}</a>
            </Button>
            <Button asChild size="sm">
              <a href={getCloudRegisterHref(docsLocale)}>
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
            'fixed inset-0 z-[100] md:hidden bg-background transition-all duration-300',
            mobileOpen ? 'opacity-100 visible pointer-events-auto' : 'opacity-0 invisible pointer-events-none',
          )}
        >
          <div className="flex items-center justify-between px-4 h-16 border-b border-border/60">
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
          <div className="px-6 pb-10 flex flex-col gap-3">
            <LocaleSwitcher variant="shell" />
            <Button asChild variant="outline" size="lg" className="w-full rounded-2xl">
              <a href={getCloudLoginHref(docsLocale)} onClick={() => setMobileOpen(false)}>
                {t('nav.login')}
              </a>
            </Button>
            <Button asChild size="lg" className="w-full rounded-2xl">
              <a href={getCloudRegisterHref(docsLocale)} onClick={() => setMobileOpen(false)}>
                {t('nav.getStarted')}
              </a>
            </Button>
          </div>
        </div>
      </header>

      <main>{children}</main>

      <footer className="border-t border-border/60 bg-muted/20">
        <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6">
          <div className="flex flex-col gap-8 md:flex-row md:justify-between">
            <div className="max-w-sm">
              <p className="font-semibold">{t('brand')}</p>
              <p className="mt-2 text-sm text-muted-foreground">{t('footer.tagline')}</p>
              <p className="mt-2 text-xs text-muted-foreground">{t('footer.operator')}</p>
              <Link href="/" className="mt-4 inline-block text-sm font-medium text-primary hover:underline">
                {t('footer.selfHostLink')} →
              </Link>
            </div>
            <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
              <Link href="/privacy" className="hover:text-foreground transition-colors">{t('footer.privacy')}</Link>
              <Link href="/terms" className="hover:text-foreground transition-colors">{t('footer.terms')}</Link>
              <Link href="/refund" className="hover:text-foreground transition-colors">{t('footer.refund')}</Link>
            </div>
          </div>
          <p className="mt-8 text-center text-xs text-muted-foreground">
            {t('footer.copyright', { year: new Date().getFullYear() })}
          </p>
        </div>
      </footer>
    </div>
  );
}
