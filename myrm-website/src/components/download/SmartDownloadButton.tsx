/**
 * [INPUT]
 * - deploy-mode::getDesktopDownloadPath (POS: 营销站外部链接统一入口)
 * - download/DesktopReleaseProvider (POS: 桌面 release 元数据 React 上下文)
 *
 * [OUTPUT]
 * - SmartDownloadButton: OS 智能下载 CTA（直链 / 下载页 / 无 release 时仍显示「下载桌面版」）
 *
 * [POS]
 * Landing Hero、QuickStart、Download 页共用的桌面下载主按钮。
 */
'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Download04Icon } from 'hugeicons-react';
import { useTranslations } from 'next-intl';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils/classnameUtils';
import { getDesktopDownloadPath } from '@/lib/deploy-mode';
import { useDesktopRelease } from '@/components/download/DesktopReleaseProvider';
import type { DesktopPlatformId } from '@/lib/desktop-release';

type SmartDownloadVariant = 'hero' | 'quickstart' | 'compact';

interface SmartDownloadButtonProps {
  variant?: SmartDownloadVariant;
  className?: string;
  showMeta?: boolean;
  showAllPlatformsLink?: boolean;
}

function platformLabelKey(platform: DesktopPlatformId | 'unknown'): string {
  if (platform === 'unknown') return 'download.platforms.unknown';
  return `download.platforms.${platform}`;
}

function metaClass(variant: SmartDownloadVariant): string {
  if (variant === 'compact') return 'text-[12px] font-mono tracking-wide text-muted-foreground';
  return 'text-[12px] ed-mono tracking-wide';
}

export default function SmartDownloadButton({
  variant = 'hero',
  className,
  showMeta = variant === 'hero',
  showAllPlatformsLink = variant !== 'compact',
}: SmartDownloadButtonProps) {
  const pathname = usePathname();
  const t = useTranslations('marketing');
  const {
    release,
    detectedPlatform,
    primaryTarget,
    useDownloadPage,
    loading,
    error,
  } = useDesktopRelease();

  const onDownloadPage = pathname === getDesktopDownloadPath();
  const shouldLinkToDownloadPage = useDownloadPage && !onDownloadPage;

  const isHero = variant === 'hero';
  const isQuickStart = variant === 'quickstart';
  const stableLabel = t('hero.ctaDownload');

  const buttonClass = cn(
    isHero && 'rounded-full px-9 font-light',
    isQuickStart && 'rounded-full px-6 font-medium text-white w-full sm:w-auto',
    variant === 'compact' && 'rounded-full px-5',
    className,
  );

  const buttonStyle = isQuickStart
    ? { background: 'var(--ed-accent)', color: '#fff', borderColor: 'transparent' }
    : isHero
      ? { borderColor: 'var(--ed-border)', color: 'var(--ed-ink)' }
      : undefined;

  const metaColorStyle = isHero || isQuickStart ? { color: 'var(--ed-dim)' } : undefined;

  const metaLine = release ? (
    <p className={metaClass(variant)} style={metaColorStyle}>
      {t('download.versionHint', {
        version: release.version,
        platform: t(platformLabelKey(detectedPlatform)),
      })}
    </p>
  ) : null;

  if (loading) {
    return (
      <div className={cn('flex flex-col items-center gap-2', className)}>
        <Button variant="outline" size={isHero ? 'lg' : 'default'} disabled className={buttonClass} style={buttonStyle}>
          {stableLabel}
        </Button>
      </div>
    );
  }

  if (error || (!primaryTarget && !shouldLinkToDownloadPage)) {
    if (onDownloadPage) {
      return null;
    }

    return (
      <div className={cn('flex flex-col items-center gap-2', className)}>
        <Button asChild variant="outline" size={isHero ? 'lg' : 'default'} className={buttonClass} style={buttonStyle}>
          <Link href={getDesktopDownloadPath()}>
            {stableLabel}
            <Download04Icon className="ml-2 h-4 w-4" />
          </Link>
        </Button>
      </div>
    );
  }

  if (shouldLinkToDownloadPage) {
    return (
      <div className={cn('flex flex-col items-center gap-2', className)}>
        <Button asChild variant="outline" size={isHero ? 'lg' : 'default'} className={buttonClass} style={buttonStyle}>
          <Link href={getDesktopDownloadPath()}>
            {stableLabel}
            <Download04Icon className="ml-2 h-4 w-4" />
          </Link>
        </Button>
        {showMeta && metaLine}
        {showAllPlatformsLink && (
          <p className="text-[12px] ed-mono text-center" style={{ color: 'var(--ed-dim)' }}>
            {t('download.macChooseArch')}
          </p>
        )}
      </div>
    );
  }

  return (
    <div className={cn('flex flex-col items-center gap-2', className)}>
      <Button asChild variant="outline" size={isHero ? 'lg' : 'default'} className={buttonClass} style={buttonStyle}>
        <a href={primaryTarget?.url} target="_blank" rel="noopener noreferrer">
          {stableLabel}
          <Download04Icon className="ml-2 h-4 w-4" />
        </a>
      </Button>
      {showMeta && metaLine}
      {showAllPlatformsLink && !onDownloadPage && (
        <Link
          href={getDesktopDownloadPath()}
          className="text-[12px] ed-mono transition-opacity hover:opacity-80"
          style={{ color: 'var(--ed-dim)' }}
        >
          {t('download.viewAllPlatforms')}
        </Link>
      )}
    </div>
  );
}
