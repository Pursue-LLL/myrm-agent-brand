/**
 * [INPUT]
 * - download/CliInstallFallback (POS: 无桌面安装包时的一行命令安装面板)
 * - download/DesktopReleaseProvider (POS: 桌面 release React 上下文边界)
 * - lib/desktop-release.ts (POS: 桌面端安装包元数据单一入口)
 *
 * [OUTPUT]
 * - PlatformDownloadGrid: 全平台安装包矩阵；无 release 时降级为 CliInstallFallback
 *
 * [POS]
 * `/download` 页平台选择区；有包时按 OS 分组展示 Recommended 与文件大小。
 */
'use client';

import { Download04Icon } from 'hugeicons-react';
import { useTranslations } from 'next-intl';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils/classnameUtils';
import CliInstallFallback from '@/components/download/CliInstallFallback';
import { useDesktopRelease } from '@/components/download/DesktopReleaseProvider';
import { formatFileSize, type DesktopPlatformId } from '@/lib/desktop-release';

const PLATFORM_GROUPS: Array<{
  titleKey: string;
  platforms: DesktopPlatformId[];
}> = [
  {
    titleKey: 'download.groups.macos',
    platforms: ['macos-aarch64', 'macos-x86_64'],
  },
  {
    titleKey: 'download.groups.windows',
    platforms: ['windows-x86_64', 'windows-aarch64'],
  },
  {
    titleKey: 'download.groups.linux',
    platforms: ['linux-x86_64', 'linux-aarch64'],
  },
];

interface PlatformDownloadGridProps {
  editorial?: boolean;
  className?: string;
}

export default function PlatformDownloadGrid({ editorial = false, className }: PlatformDownloadGridProps) {
  const t = useTranslations('marketing');
  const { release, detectedPlatform, loading, error } = useDesktopRelease();

  if (loading) {
    return (
      <p className={cn('text-sm', editorial ? 'ed-mono' : 'text-muted-foreground', className)}>
        {t('download.loading')}
      </p>
    );
  }

  if (error || !release || release.targets.length === 0) {
    return (
      <CliInstallFallback editorial={editorial} className={className} />
    );
  }

  const targetMap = new Map(release.targets.map((target) => [target.id, target]));

  return (
    <div className={cn('grid gap-4 sm:grid-cols-2 lg:grid-cols-3', className)}>
      {PLATFORM_GROUPS.map((group) => {
        const items = group.platforms
          .map((platformId) => targetMap.get(platformId))
          .filter((target): target is NonNullable<typeof target> => Boolean(target));

        if (items.length === 0) return null;

        return (
          <div
            key={group.titleKey}
            className={cn(
              'rounded-2xl p-5',
              editorial ? 'ed-card' : 'border border-border bg-card',
            )}
            style={editorial ? { border: '1px solid var(--ed-border)', background: 'var(--ed-surface)' } : undefined}
          >
            <p
              className={cn(
                'mb-4 text-[10px] uppercase tracking-[0.2em] font-medium',
                editorial ? 'ed-mono' : 'text-muted-foreground',
              )}
              style={editorial ? { color: 'var(--ed-accent)' } : undefined}
            >
              {t(group.titleKey)}
            </p>
            <div className="flex flex-col gap-2">
              {items.map((target) => {
                const isRecommended = target.id === detectedPlatform;
                const sizeLabel = formatFileSize(target.sizeBytes);

                return (
                  <Button
                    key={target.id}
                    asChild
                    variant={editorial ? 'outline' : 'secondary'}
                    className={cn(
                      'h-auto min-h-10 w-full justify-between rounded-full px-4 py-2.5 text-left',
                      isRecommended && !editorial && 'ring-1 ring-primary/40',
                    )}
                    style={
                      editorial
                        ? {
                            borderColor: isRecommended ? 'var(--ed-accent)' : 'var(--ed-border)',
                            color: 'var(--ed-ink)',
                          }
                        : undefined
                    }
                  >
                    <a href={target.url} target="_blank" rel="noopener noreferrer">
                      <span className="flex min-w-0 flex-col gap-0.5">
                        <span className="flex flex-wrap items-center gap-2">
                          <span className="text-[13px] font-medium">
                            {t(`download.platforms.${target.id}`)}
                          </span>
                          {isRecommended && (
                            <span className="rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-medium uppercase tracking-wide text-primary">
                              {t('download.recommended')}
                            </span>
                          )}
                        </span>
                        {sizeLabel && (
                          <span className="text-[11px] font-mono text-muted-foreground">{sizeLabel}</span>
                        )}
                      </span>
                      <Download04Icon className="h-4 w-4 shrink-0 opacity-70" />
                    </a>
                  </Button>
                );
              })}
            </div>
          </div>
        );
      })}
    </div>
  );
}
