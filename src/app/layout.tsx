import type { Metadata } from 'next';
import { ThemeProvider } from 'next-themes';

import './globals.css';
import { LocaleRootProvider } from '@/components/i18n/LocaleRootProvider';
import { defaultLocale } from '@/i18n/config';
import { landingFontClassName } from '@/lib/landing-fonts';

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://myrmagent.ai';
const SITE_NAME = 'MyrmAgent';
const DEFAULT_TITLE = 'MyrmAgent - Your AI Agent Workspace';
const DESCRIPTION = 'Open-source AI agent workspace with persistent sandbox, cross-session memory, and GUI-first experience.';

export const metadata: Metadata = {
  title: { template: '%s | MyrmAgent', default: DEFAULT_TITLE },
  description: DESCRIPTION,
  metadataBase: new URL(SITE_URL),
  keywords: ['AI agent', 'workspace', 'open source', 'memory', 'sandbox', 'tools', 'multi-channel'],
  authors: [{ name: SITE_NAME }],
  creator: SITE_NAME,
  openGraph: {
    type: 'website',
    locale: 'zh_CN',
    url: SITE_URL,
    siteName: SITE_NAME,
    title: DEFAULT_TITLE,
    description: DESCRIPTION,
    images: [{ url: '/og-image.png', width: 1200, height: 630, alt: DEFAULT_TITLE }],
  },
  twitter: {
    card: 'summary_large_image',
    title: DEFAULT_TITLE,
    description: DESCRIPTION,
    images: ['/og-image.png'],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true, 'max-image-preview': 'large', 'max-snippet': -1 },
  },
  icons: {
    icon: [
      { url: '/brand/logo-icon-32.png', sizes: '32x32', type: 'image/png' },
      { url: '/brand/logo-icon-192.png', sizes: '192x192', type: 'image/png' },
    ],
    apple: '/brand/logo-icon-192.png',
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang={defaultLocale} suppressHydrationWarning className={landingFontClassName}>
      <body className="min-h-screen antialiased">
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
          <LocaleRootProvider>{children}</LocaleRootProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
