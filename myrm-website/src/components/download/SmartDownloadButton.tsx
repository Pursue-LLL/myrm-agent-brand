/**
 * [INPUT]
 * - deploy-mode::getDesktopDownloadPath (POS: 营销站外部链接统一入口)
 * - download/DesktopReleaseProvider (POS: 桌面 release 元数据 React 上下文)
 * - download/platform-display (POS: 平台分组与 i18n 键映射)
 * - download/PlatformGlyph (POS: Hero 平台识别图标)
 *
 * [OUTPUT]
 * - SmartDownloadButton: OS 智能下载 CTA；Hero 按 release 状态显示直链 / 选型 / 筹备中文案
 *
 * [POS]
 * Landing Hero 桌面下载主 CTA；QuickStart desktop tab 与 `/download` 页复用。
 */
'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Download04Icon } from 'hugeicons-react';
import { useTranslations } from 'next-intl';
import type { ReactNode } from 'react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils/classnameUtils';
import { getDesktopDownloadPath } from '@/lib/deploy-mode';
import { useDesktopRelease } from '@/components/download/DesktopReleaseProvider';
import PlatformGlyph from '@/components/download/PlatformGlyph';
import {
  platformGroupLabelKey,
  platformLabelKey,
  resolvePlatformGroup,
} from '@/components/download/platform-display';
type SmartDownloadVariant = 'hero' | 'quickstart' | 'compact';

interface SmartDownloadButtonProps {
  variant?: SmartDownloadVariant;
  className?: string;
  showMeta?: boolean;
  showAllPlatformsLink?: boolean;
}

function metaClass(variant: SmartDownloadVariant): string {
  if (variant === 'compact') return 'text-[12px] font-mono tracking-wide text-muted-foreground';
  return 'text-[12px] ed-mono tracking-wide';
}

function DownloadButtonLabel({
  variant,
  platformGroup,
  stableLabel,
  labelText,
  showOsGlyph,
}: {
  variant: SmartDownloadVariant;
  platformGroup: ReturnType<typeof resolvePlatformGroup>;
  stableLabel: string;
  labelText: string;
  showOsGlyph: boolean;
}) {
  if (variant !== 'hero') {
    return (
      <>
        {stableLabel}
        <Download04Icon className="ml-2 h-4 w-4" />
      </>
    );
  }

  if (showOsGlyph) {
    return (
      <>
        <PlatformGlyph group={platformGroup} className="h-4 w-4" />
        {labelText}
      </>
    );
  }

  return (
    <>
      {labelText}
      <Download04Icon className="ml-2 h-4 w-4" />
    </>
  );
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
  const platformGroup = resolvePlatformGroup(detectedPlatform);
  const groupLabelKey = platformGroupLabelKey(platformGroup);
  const smartLabel = groupLabelKey
    ? t('hero.ctaDownloadFor', { platform: t(groupLabelKey) })
    : stableLabel;

  const canClaimOsDownload = Boolean(primaryTarget) || shouldLinkToDownloadPage;

  let heroLabelText = stableLabel;
  let showOsGlyph = false;

  if (isHero) {
    if (loading) {
      heroLabelText = stableLabel;
    } else if (canClaimOsDownload && groupLabelKey) {
      heroLabelText = smartLabel;
      showOsGlyph = true;
    } else if (groupLabelKey) {
      heroLabelText = t('hero.ctaDownloadPending', { platform: t(groupLabelKey) });
      showOsGlyph = true;
    }
  }

  const buttonClass = cn(
    isHero && 'ed-cta w-full rounded-full border-0 px-9 font-medium text-white sm:w-auto',
    isQuickStart && 'rounded-full px-6 font-medium text-white w-full sm:w-auto',
    variant === 'compact' && 'rounded-full px-5',
    className,
  );

  const buttonVariant = isHero || isQuickStart ? 'default' : 'outline';
  const buttonSize = isHero ? 'lg' : 'default';

  const buttonStyle = isQuickStart
    ? { background: 'var(--ed-accent)', color: '#fff', borderColor: 'transparent' }
    : undefined;

  const metaColorStyle = isHero || isQuickStart ? { color: 'var(--ed-dim)' } : undefined;

  const label = (
    <DownloadButtonLabel
      variant={variant}
      platformGroup={platformGroup}
      stableLabel={stableLabel}
      labelText={isHero ? heroLabelText : stableLabel}
      showOsGlyph={showOsGlyph}
    />
  );

  const metaLine = release ? (
    <p className={metaClass(variant)} style={metaColorStyle}>
      {t('download.versionHint', {
        version: release.version,
        platform: t(platformLabelKey(detectedPlatform)),
      })}
    </p>
  ) : null;

  const renderButton = (content: ReactNode, disabled = false) => (
    <Button
      asChild={!disabled}
      variant={buttonVariant}
      size={buttonSize}
      disabled={disabled}
      className={buttonClass}
      style={buttonStyle}
    >
      {content}
    </Button>
  );

  const wrapOptionalMeta = (button: ReactNode) => {
    if (!showMeta && !showAllPlatformsLink) {
      return button;
    }
    return (
      <div className={cn('flex flex-col items-center gap-2', className)}>
        {button}
        {showMeta && metaLine}
        {showAllPlatformsLink && !onDownloadPage && shouldLinkToDownloadPage && (
          <p className="text-[12px] ed-mono text-center" style={{ color: 'var(--ed-dim)' }}>
            {t('download.macChooseArch')}
          </p>
        )}
        {showAllPlatformsLink && !onDownloadPage && !shouldLinkToDownloadPage && primaryTarget && (
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
  };

  if (loading) {
    return wrapOptionalMeta(renderButton(label, true));
  }

  if (error || (!primaryTarget && !shouldLinkToDownloadPage)) {
    if (onDownloadPage) {
      return null;
    }
    return wrapOptionalMeta(
      renderButton(
        <Link href={getDesktopDownloadPath()}>{label}</Link>,
      ),
    );
  }

  if (shouldLinkToDownloadPage) {
    return wrapOptionalMeta(
      renderButton(
        <Link href={getDesktopDownloadPath()}>{label}</Link>,
      ),
    );
  }

  return wrapOptionalMeta(
    renderButton(
      <a href={primaryTarget?.url} target="_blank" rel="noopener noreferrer">
        {label}
      </a>,
    ),
  );
}
