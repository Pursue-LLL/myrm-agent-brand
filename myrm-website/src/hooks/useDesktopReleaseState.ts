/**
 * [INPUT]
 * - lib/desktop-release.ts (POS: 桌面端安装包元数据单一入口)
 *
 * [OUTPUT]
 * - useDesktopReleaseState: release fetch、平台检测、primary target 解析
 *
 * [POS]
 * 桌面 release 客户端状态 hook；由 DesktopReleaseProvider 挂载一次。
 */
'use client';

import { useCallback, useEffect, useState } from 'react';
import { useTranslations } from 'next-intl';
import {
  detectUserPlatform,
  fetchDesktopRelease,
  fetchEmbeddedDesktopRelease,
  resolveTargetForPlatform,
  type DesktopDownloadTarget,
  type DesktopPlatformId,
  type DesktopReleaseInfo,
  type PlatformDetection,
} from '@/lib/desktop-release';

const RELEASE_CACHE_KEY = 'myrmagent:desktop-release';
const RELEASE_CACHE_TTL_MS = 5 * 60 * 1000;

interface CachedReleasePayload {
  fetchedAt: number;
  release: DesktopReleaseInfo;
}

interface DesktopReleaseState {
  release: DesktopReleaseInfo | null;
  detectedPlatform: DesktopPlatformId | 'unknown';
  macArchConfirmed: boolean;
  primaryTarget: DesktopDownloadTarget | null;
  useDownloadPage: boolean;
  loading: boolean;
  refreshing: boolean;
  error: string | null;
  refresh: () => void;
}

function readCachedRelease(): DesktopReleaseInfo | null {
  if (typeof sessionStorage === 'undefined') return null;
  try {
    const raw = sessionStorage.getItem(RELEASE_CACHE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as CachedReleasePayload;
    if (Date.now() - parsed.fetchedAt > RELEASE_CACHE_TTL_MS) {
      sessionStorage.removeItem(RELEASE_CACHE_KEY);
      return null;
    }
    return parsed.release;
  } catch {
    sessionStorage.removeItem(RELEASE_CACHE_KEY);
    return null;
  }
}

function writeCachedRelease(release: DesktopReleaseInfo): void {
  if (typeof sessionStorage === 'undefined') return;
  const payload: CachedReleasePayload = { fetchedAt: Date.now(), release };
  sessionStorage.setItem(RELEASE_CACHE_KEY, JSON.stringify(payload));
}

export function useDesktopReleaseState(): DesktopReleaseState {
  const t = useTranslations('marketing.download');
  const [release, setRelease] = useState<DesktopReleaseInfo | null>(null);
  const [platformDetection, setPlatformDetection] = useState<PlatformDetection>({
    platform: 'unknown',
    macArchConfirmed: true,
  });
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const applyRelease = useCallback((nextRelease: DesktopReleaseInfo | null) => {
    setRelease(nextRelease);
    if (nextRelease && nextRelease.targets.length > 0) {
      writeCachedRelease(nextRelease);
      setError(null);
    }
  }, []);

  const refreshLive = useCallback(async () => {
    setRefreshing(true);
    try {
      const liveRelease = await fetchDesktopRelease();
      applyRelease(liveRelease);
    } catch {
      // Keep embedded/cached data on background refresh failure.
    } finally {
      setRefreshing(false);
    }
  }, [applyRelease]);

  const load = useCallback(async (force = false) => {
    setLoading(true);
    setError(null);

    if (!force) {
      const cached = readCachedRelease();
      if (cached) {
        applyRelease(cached);
        setLoading(false);
        void refreshLive();
        return;
      }
    }

    try {
      const embedded = force ? null : await fetchEmbeddedDesktopRelease();
      if (embedded) {
        applyRelease(embedded);
        setLoading(false);
        void refreshLive();
        return;
      }

      const nextRelease = await fetchDesktopRelease();
      applyRelease(nextRelease);
    } catch {
      setRelease(null);
      setError(t('loadError'));
    } finally {
      setLoading(false);
    }
  }, [applyRelease, refreshLive, t]);

  useEffect(() => {
    setPlatformDetection(detectUserPlatform());
    void load();
  }, [load]);

  const detectedPlatform = platformDetection.platform;
  const macArchConfirmed = platformDetection.macArchConfirmed;
  const useDownloadPage = detectedPlatform.startsWith('macos-') && !macArchConfirmed;
  const primaryTarget =
    release === null || useDownloadPage
      ? null
      : resolveTargetForPlatform(release, detectedPlatform);

  return {
    release,
    detectedPlatform,
    macArchConfirmed,
    primaryTarget,
    useDownloadPage,
    loading,
    refreshing,
    error,
    refresh: () => {
      void load(true);
    },
  };
}
