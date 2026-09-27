/**
 * [INPUT]
 * - download/DesktopReleaseProvider (POS: 桌面 release React 上下文边界)
 * - deploy-paths::getDeployPathHref (POS: Local WebUI / Tauri deployment paths)
 * - hooks/useDocsLocale (POS: 站点 locale → Mintlify docs locale)
 *
 * [OUTPUT]
 * - DownloadPageContent: `/download` 页编排（直链矩阵 / localWebui 终端引导、release notes、安装步骤）
 *
 * [POS]
 * 桌面端下载转化页主体；无 release 时 localWebui 终端引导；有 release 时直链矩阵。
 */
'use client';

import { useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { ArrowRight02Icon, SmartPhone01Icon } from 'hugeicons-react';
import { useDocsLocale } from '@/hooks/useDocsLocale';
import { Button } from '@/components/ui/button';
import ChecksumSection from '@/components/download/ChecksumSection';
import InstallStepsSection from '@/components/download/InstallStepsSection';
import PlatformDownloadGrid from '@/components/download/PlatformDownloadGrid';
import ReleaseNotesSection from '@/components/download/ReleaseNotesSection';
import SmartDownloadButton from '@/components/download/SmartDownloadButton';
import { useDesktopRelease } from '@/components/download/DesktopReleaseProvider';
import { getDeployPathHref, getMobileHubDocsUrl } from '@/lib/deploy-paths';

function MobileRemoteCallout({
  docsLocale,
}: {
  docsLocale: ReturnType<typeof useDocsLocale>;
}) {
  const t = useTranslations('marketing');

  return (
    <div className="rounded-2xl border border-border bg-card p-5 flex flex-col justify-between">
      <div>
        <div className="flex items-center gap-2">
          <SmartPhone01Icon className="h-4 w-4 text-primary shrink-0" aria-hidden />
          <h2 className="text-[15px] font-semibold text-foreground">
            {t('download.mobileRemote.title')}
          </h2>
          <span className="rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-medium text-primary">
            {t('download.mobileRemote.badge')}
          </span>
        </div>
        <p className="mt-2 text-[14px] leading-relaxed text-muted-foreground">
          {t('download.mobileRemote.description')}
        </p>
      </div>
      <div className="mt-4">
        <Button asChild variant="outline" className="rounded-full">
          <a
            href={getMobileHubDocsUrl(docsLocale)}
            target="_blank"
            rel="noopener noreferrer"
          >
            {t('download.mobileRemote.cta')}
            <ArrowRight02Icon className="ml-2 h-4 w-4" />
          </a>
        </Button>
      </div>
    </div>
  );
}

function LocalWebuiAlternative({
  docsLocale,
}: {
  docsLocale: ReturnType<typeof useDocsLocale>;
}) {
  const t = useTranslations('marketing');

  return (
    <div className="rounded-2xl border border-border bg-card p-5 flex flex-col justify-between">
      <div>
        <h2 className="text-[15px] font-semibold text-foreground">
          {t('download.alternatives.local.title')}
        </h2>
        <p className="mt-2 text-[14px] leading-relaxed text-muted-foreground">
          {t('download.alternatives.local.description')}
        </p>
      </div>
      <div className="mt-4">
        <Button asChild variant="outline" className="rounded-full">
          <a
            href={getDeployPathHref('localWebui', docsLocale)}
            target="_blank"
            rel="noopener noreferrer"
          >
            {t('download.alternatives.local.cta')}
            <ArrowRight02Icon className="ml-2 h-4 w-4" />
          </a>
        </Button>
      </div>
    </div>
  );
}

export default function DownloadPageContent() {
  const t = useTranslations('marketing');
  const docsLocale = useDocsLocale();
  const { release, refreshing, macArchConfirmed, detectedPlatform } = useDesktopRelease();
  const hasInstallers = Boolean(release && release.targets.length > 0);
  const showCompactSmartDownload =
    hasInstallers && (macArchConfirmed || !detectedPlatform.startsWith('macos-'));
  const showMacArchHint =
    hasInstallers && !macArchConfirmed && detectedPlatform.startsWith('macos-');

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

      {hasInstallers && (
        <div className="mt-10 flex flex-col items-center gap-3">
          {showCompactSmartDownload ? (
            <SmartDownloadButton variant="compact" showMeta showAllPlatformsLink={false} />
          ) : showMacArchHint ? (
            <p className="text-[13px] text-muted-foreground">{t('download.macChooseArch')}</p>
          ) : null}
        </div>
      )}

      {!hasInstallers && (
        <div className="mt-10 grid gap-4 sm:grid-cols-2">
          <MobileRemoteCallout docsLocale={docsLocale} />
          <LocalWebuiAlternative docsLocale={docsLocale} />
        </div>
      )}

      <div className={hasInstallers ? 'mt-14' : 'mt-10'}>
        <PlatformDownloadGrid />
      </div>

      <ReleaseNotesSection />
      {hasInstallers && <InstallStepsSection />}
      {hasInstallers && (
        <p className="mt-8 text-center text-[13px] leading-relaxed text-muted-foreground sm:text-[14px]">
          {t('download.otaHint')}
        </p>
      )}
      {hasInstallers && (
        <p className="mt-3 text-center text-[13px] leading-relaxed text-muted-foreground sm:text-[14px]">
          {t('download.trustHint')}
        </p>
      )}
      <ChecksumSection />

      {hasInstallers && (
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
      )}

      {hasInstallers && (
        <div className="mt-10 grid gap-4 sm:grid-cols-2">
          <MobileRemoteCallout docsLocale={docsLocale} />
          <LocalWebuiAlternative docsLocale={docsLocale} />
        </div>
      )}
    </div>
  );
}
