/**
 * [INPUT]
 * - next-intl notFound.* keys in locales/en.json、locales/zh.json
 * - components/i18n/LocaleRootProvider.tsx (POS: 客户端 locale 切换与消息注入)
 *
 * [OUTPUT]
 * - NotFound: 品牌化双语 404 页面
 *
 * [POS]
 * App Router 全局 Not Found 页。
 */
'use client';

import Link from 'next/link';
import { useTranslations } from 'next-intl';

export default function NotFound() {
  const t = useTranslations('notFound');

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background px-4 text-center">
      <div className="space-y-6">
        <p className="text-8xl font-bold tracking-tighter text-primary/20 sm:text-9xl">404</p>
        <h1 className="text-2xl font-semibold text-foreground sm:text-3xl">{t('title')}</h1>
        <p className="mx-auto max-w-md text-muted-foreground">{t('description')}</p>
        <Link
          href="/"
          className="inline-flex items-center gap-2 rounded-full bg-primary px-6 py-3 text-sm font-medium text-primary-foreground transition-opacity hover:opacity-90"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
            <path d="m12 19-7-7 7-7" />
            <path d="M19 12H5" />
          </svg>
          {t('backHome')}
        </Link>
      </div>
    </div>
  );
}
