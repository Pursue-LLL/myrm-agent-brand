/**
 * [INPUT]
 * - download/DesktopReleaseProvider (POS: 桌面 release 元数据 React 上下文)
 * - deploy-paths::getDeployPathHref (POS: Single source of truth for SaaS / Local WebUI / Tauri deployment paths)
 * - hooks/useDocsLocale (POS: 站点 locale → Mintlify docs locale)
 *
 * [OUTPUT]
 * - DownloadPageContent: `/download` 页编排（平台矩阵、release notes、安装步骤）
 *
 * [POS]
 * 桌面端下载转化页主体；部署文档外链随 locale 生成 `/zh/...` 路径。
 */
'use client';

import { useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { ArrowRight02Icon } from 'hugeicons-react';
import { useDocsLocale } from '@/hooks/useDocsLocale';
import { Button } from '@/components/ui/button';
import ChecksumSection from '@/components/download/ChecksumSection';
import InstallStepsSection from '@/components/download/InstallStepsSection';
import PlatformDownloadGrid from '@/components/download/PlatformDownloadGrid';
import ReleaseNotesSection from '@/components/download/ReleaseNotesSection';
import SmartDownloadButton from '@/components/download/SmartDownloadButton';
import { useDesktopRelease } from '@/components/download/DesktopReleaseProvider';
import { getDeployPathHref } from '@/lib/deploy-paths';

export default function DownloadPageContent() {
  const t = useTranslations('marketing');
  const docsLocale = useDocsLocale();
  const { release, refreshing, macArchConfirmed, detectedPlatform } = useDesktopRelease();
  const showCompactSmartDownload =
    macArchConfirmed || !detectedPlatform.startsWith('macos-');

  useEffect(() => {
    document.title = `${t('download.metaTitle')} | MyrmAgent`;
    const description = document.querySelector('meta[name="description"]');
    if (description) {
      description.setAttribute('content', t('download.metaDescription'));
    }
  }, [t]);

  return (
    <div className="mx-auto max-w-5xl px-4 py-16 sm:px-6 sm:py-24">
      <div className="mx-auto max-w-2xl text-center">
        <p className="text-[10px] uppercase tracking-[0.25em] font-medium text-primary font-mono">
          {t('download.badge')}
        </p>
        <h1 className="mt-4 text-[clamp(2rem,5vw,3rem)] font-semibold tracking-tight text-foreground">
          {t('download.title')}
        </h1>
        <p className="mt-5 text-[15px] leading-relaxed text-muted-foreground">
          {t('download.subtitle')}
        </p>
        {release?.version && (
          <p className="mt-3 text-[12px] font-mono text-muted-foreground">
            {t('download.latestVersion', { version: release.version })}
            {refreshing ? ` · ${t('download.refreshing')}` : ''}
          </p>
        )}
      </div>

      <div className="mt-10 flex flex-col items-center gap-3">
        {showCompactSmartDownload ? (
          <SmartDownloadButton variant="compact" showMeta showAllPlatformsLink={false} />
        ) : (
          <p className="text-[13px] text-muted-foreground">{t('download.macChooseArch')}</p>
        )}
      </div>

      <div className="mt-14">
        <PlatformDownloadGrid />
      </div>

      <ReleaseNotesSection />
      <InstallStepsSection />
      <ChecksumSection />

      <div className="mt-10 rounded-2xl border border-border bg-muted/20 p-5 sm:p-6">
        <p className="text-[10px] uppercase tracking-[0.2em] font-medium text-muted-foreground font-mono">
          {t('download.requirements.title')}
        </p>
        <ul className="mt-4 space-y-2 text-[14px] leading-relaxed text-muted-foreground">
          <li>{t('download.requirements.macos')}</li>
          <li>{t('download.requirements.windows')}</li>
          <li>{t('download.requirements.linux')}</li>
        </ul>
      </div>

      <div className="mt-10 grid gap-4 sm:grid-cols-2">
        <div className="rounded-2xl border border-border bg-card p-5">
          <h2 className="text-[15px] font-semibold text-foreground">{t('download.alternatives.local.title')}</h2>
          <p className="mt-2 text-[14px] leading-relaxed text-muted-foreground">
            {t('download.alternatives.local.description')}
          </p>
          <Button asChild variant="outline" className="mt-4 rounded-full">
            <a href={getDeployPathHref('localWebui', docsLocale)} target="_blank" rel="noopener noreferrer">
              {t('download.alternatives.local.cta')}
              <ArrowRight02Icon className="ml-2 h-4 w-4" />
            </a>
          </Button>
        </div>
        <div className="rounded-2xl border border-border bg-card p-5">
          <h2 className="text-[15px] font-semibold text-foreground">{t('download.alternatives.saas.title')}</h2>
          <p className="mt-2 text-[14px] leading-relaxed text-muted-foreground">
            {t('download.alternatives.saas.description')}
          </p>
          <Button asChild className="mt-4 rounded-full">
            <a href={getDeployPathHref('saas', docsLocale)}>
              {t('download.alternatives.saas.cta')}
              <ArrowRight02Icon className="ml-2 h-4 w-4" />
            </a>
          </Button>
        </div>
      </div>
    </div>
  );
}
