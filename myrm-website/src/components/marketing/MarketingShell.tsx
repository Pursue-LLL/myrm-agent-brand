/**
 * [INPUT]
 * - marketing-nav::buildMarketingNavLinks (POS: DRY nav definition — prevents LandingEditorial / MarketingShell drift)
 * - deploy-mode::getDesktopDownloadPath (POS: 营销站外部链接统一入口)
 * - hooks/useDocsLocale (POS: 站点 locale → Mintlify docs locale)
 *
 * [OUTPUT]
 * - MarketingShell: 定价/法务等内页的顶栏 + 主内容槽位
 *
 * [POS]
 * 非 Landing 营销页的共享壳层（导航、locale 切换、移动端抽屉菜单）。
 */
'use client';

import Link from 'next/link';
import { useTranslations } from 'next-intl';
import { useDocsLocale } from '@/hooks/useDocsLocale';
import { ArrowRight02Icon, Menu01Icon, Cancel01Icon } from 'hugeicons-react';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils/classnameUtils';
import { getDesktopDownloadPath } from '@/lib/deploy-mode';
import { buildMarketingNavLinks, getMarketingLoginHref, getMarketingRegisterHref } from '@/lib/marketing-nav';
import BrandLogo from './BrandLogo';
import LocaleSwitcher from './LocaleSwitcher';

function GitHubIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className}>
      <path d="M12 2C6.477 2 2 6.484 2 12.021c0 4.428 2.865 8.185 6.839 9.510.5.092.682-.218.682-.483 0-.237-.009-.868-.013-1.703-2.782.605-3.369-1.342-3.369-1.342-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.339-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844a9.59 9.59 0 012.504.338c1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.02 10.02 0 0022 12.021C22 6.484 17.522 2 12 2z" />
    </svg>
  );
}

interface MarketingShellProps {
  children: React.ReactNode;
  className?: string;
}

export default function MarketingShell({ children, className }: MarketingShellProps) {
  const t = useTranslations('marketing');
  const docsLocale = useDocsLocale();
  const [mobileOpen, setMobileOpen] = useState(false);

  type NavLink = { href: string; label: string; external?: true; icon?: React.ComponentType<{ className?: string }> };

  const navLinks: NavLink[] = buildMarketingNavLinks(t, { homePrefix: '/', docsLocale }).map((link) => {
    if (link.icon === 'github') {
      return { href: link.href, label: link.label, external: link.external, icon: GitHubIcon };
    }
    return { href: link.href, label: link.label, external: link.external };
  });

  return (
    <div className={cn('min-h-screen bg-background text-foreground', className)}>
      <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
        <div className="absolute -top-32 left-1/2 h-[420px] w-[720px] -translate-x-1/2 rounded-full bg-primary/[0.07] blur-3xl" />
        <div className="absolute bottom-0 right-0 h-[320px] w-[480px] rounded-full bg-primary-dark/[0.05] blur-3xl" />
      </div>

      <header className="sticky top-0 z-40 border-b border-border/60 bg-background/80 backdrop-blur-md">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6">
          <Link href="/" className="flex items-center gap-2 font-semibold tracking-tight">
            <BrandLogo size={40} priority />
            <span>{t('brand')}</span>
          </Link>

          <nav className="hidden items-center gap-6 md:flex">
            {navLinks.map((link) => {
              const content = (
                <>
                  {link.icon && <link.icon className="h-4 w-4" />}
                  {link.label}
                </>
              );
              return link.external ? (
                <a
                  key={link.href}
                  href={link.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
                >
                  {content}
                </a>
              ) : (
                <Link
                  key={link.href}
                  href={link.href}
                  className="inline-flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
                >
                  {content}
                </Link>
              );
            })}
          </nav>

          <div className="hidden items-center gap-3 md:flex">
            <LocaleSwitcher variant="shell" />
            <Button asChild variant="outline" size="sm">
              <a href={getMarketingLoginHref()}>{t('nav.login')}</a>
            </Button>
            <Button asChild size="sm">
              <a href={getMarketingRegisterHref()}>
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

        {/* Full-screen immersive mobile menu */}
        <div
          className={cn(
            'fixed inset-0 z-[100] md:hidden bg-background transition-all duration-300',
            mobileOpen ? 'opacity-100 visible pointer-events-auto' : 'opacity-0 invisible pointer-events-none',
          )}
        >
          <div className="flex items-center justify-between px-4 sm:px-6 h-16 border-b border-border/60">
            <Link href="/" className="flex items-center gap-2 font-semibold tracking-tight" onClick={() => setMobileOpen(false)}>
              <BrandLogo size={40} priority />
              <span>{t('brand')}</span>
            </Link>
            <button
              type="button"
              className="inline-flex items-center justify-center rounded-full p-2 text-muted-foreground"
              onClick={() => setMobileOpen(false)}
              aria-label="Close menu"
            >
              <Cancel01Icon className="h-5 w-5" />
            </button>
          </div>

          <div className="flex flex-col items-center justify-center flex-1 px-8" style={{ minHeight: 'calc(100dvh - 64px - 140px)' }}>
            <nav className="flex flex-col items-center gap-2">
              {navLinks.map((link) => {
                const Icon = link.icon;
                const inner = (
                  <>
                    {Icon && <Icon className="h-6 w-6" />}
                    <span>{link.label}</span>
                  </>
                );
                const cls = 'inline-flex items-center justify-center gap-3 py-4 text-[22px] font-semibold tracking-tight text-foreground transition-colors hover:text-primary';
                return link.external ? (
                  <a key={link.href} href={link.href} target="_blank" rel="noopener noreferrer" className={cls} onClick={() => setMobileOpen(false)}>
                    {inner}
                  </a>
                ) : (
                  <Link key={link.href} href={link.href} className={cls} onClick={() => setMobileOpen(false)}>
                    {inner}
                  </Link>
                );
              })}
            </nav>
          </div>

          <div className="px-8 pb-10 flex flex-col gap-3">
            <div className="mb-4 flex justify-center">
              <LocaleSwitcher variant="shell" />
            </div>
            <Button asChild variant="outline" size="lg" className="w-full rounded-2xl">
              <a href={getMarketingLoginHref()} onClick={() => setMobileOpen(false)}>{t('nav.login')}</a>
            </Button>
            <Button asChild size="lg" className="w-full rounded-2xl">
              <a href={getMarketingRegisterHref()} onClick={() => setMobileOpen(false)}>
                {t('nav.getStarted')}
                <ArrowRight02Icon className="ml-2 h-4 w-4" />
              </a>
            </Button>
          </div>
        </div>
      </header>

      <main>{children}</main>

      <footer className="border-t border-border/60 bg-muted/20">
        <div className="mx-auto flex max-w-6xl flex-col gap-6 px-4 py-10 sm:px-6 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="font-medium">{t('brand')}</p>
            <p className="mt-1 text-sm text-muted-foreground">{t('footer.tagline')}</p>
            <p className="mt-3 text-xs text-muted-foreground">{t('footer.contact')}</p>
          </div>
          <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
            <Link href="/privacy" className="hover:text-foreground transition-colors">
              {t('footer.privacy')}
            </Link>
            <Link href="/terms" className="hover:text-foreground transition-colors">
              {t('footer.terms')}
            </Link>
            <Link href="/refund" className="hover:text-foreground transition-colors">
              {t('footer.refund')}
            </Link>
            <Link href="/pricing" className="hover:text-foreground transition-colors">
              {t('footer.pricing')}
            </Link>
            <Link href={getDesktopDownloadPath()} className="hover:text-foreground transition-colors">
              {t('footer.download')}
            </Link>
          </div>
        </div>
        <div className="border-t border-border/40 py-4 text-center text-xs text-muted-foreground">
          {t('footer.copyright', { year: new Date().getFullYear() })}
        </div>
      </footer>
    </div>
  );
}
