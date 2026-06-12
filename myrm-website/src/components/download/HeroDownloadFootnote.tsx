/**
 * [INPUT]
 * - deploy-mode::getDesktopDownloadPath (POS: 营销站外部链接统一入口)
 * - download/DesktopReleaseProvider (POS: 桌面 release React 上下文边界)
 * - download/platform-display (POS: 平台分组与 i18n 键映射)
 *
 * [OUTPUT]
 * - HeroDownloadFootnote: Hero CTA 下方单行版本与全平台链接
 *
 * [POS]
 * Hero 主下载按钮下方的 release 元信息，避免按钮行堆叠 meta。
 */
'use client';

import Link from 'next/link';
import { useTranslations } from 'next-intl';
import { getDesktopDownloadPath } from '@/lib/deploy-mode';
import { useDesktopRelease } from '@/components/download/DesktopReleaseProvider';
import { platformLabelKey } from '@/components/download/platform-display';

export default function HeroDownloadFootnote() {
  const t = useTranslations('marketing');
  const { release, detectedPlatform, useDownloadPage, loading } = useDesktopRelease();

  if (loading) {
    return null;
  }

  const platformLabel = t(platformLabelKey(detectedPlatform));

  if (release) {
    return (
      <p className="text-center text-[12px] ed-mono leading-relaxed tracking-wide" style={{ color: 'var(--ed-dim)' }}>
        {t('download.versionHint', { version: release.version, platform: platformLabel })}
        {' · '}
        <Link
          href={getDesktopDownloadPath()}
          className="underline-offset-2 transition-opacity hover:opacity-80 hover:underline"
          style={{ color: 'var(--ed-muted)' }}
        >
          {t('download.viewAllPlatforms')}
        </Link>
      </p>
    );
  }

  if (useDownloadPage) {
    return (
      <p className="text-center text-[12px] ed-mono leading-relaxed tracking-wide" style={{ color: 'var(--ed-dim)' }}>
        {t('download.macChooseArch')}
      </p>
    );
  }

  return null;
}
