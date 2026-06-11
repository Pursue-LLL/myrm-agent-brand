/**
 * [INPUT]
 * - lib/desktop-release::DesktopPlatformId (POS: 桌面端安装包元数据单一入口)
 *
 * [OUTPUT]
 * - resolvePlatformGroup, platformLabelKey, platformGroupLabelKey
 *
 * [POS]
 * 桌面下载 CTA 与 footnote 共用的平台分组与 i18n 键映射。
 */
import type { DesktopPlatformId } from '@/lib/desktop-release';

export type PlatformGroup = 'macos' | 'windows' | 'linux' | 'unknown';

export function resolvePlatformGroup(platform: DesktopPlatformId | 'unknown'): PlatformGroup {
  if (platform === 'unknown') return 'unknown';
  if (platform.startsWith('macos')) return 'macos';
  if (platform.startsWith('windows')) return 'windows';
  if (platform.startsWith('linux')) return 'linux';
  return 'unknown';
}

export function platformLabelKey(platform: DesktopPlatformId | 'unknown'): string {
  if (platform === 'unknown') return 'download.platforms.unknown';
  return `download.platforms.${platform}`;
}

export function platformGroupLabelKey(group: PlatformGroup): string | null {
  if (group === 'macos') return 'download.groups.macos';
  if (group === 'windows') return 'download.groups.windows';
  if (group === 'linux') return 'download.groups.linux';
  return null;
}
