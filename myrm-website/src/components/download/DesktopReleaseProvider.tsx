/**
 * [INPUT]
 * - lib/desktop-release.ts (POS: 桌面端安装包元数据单一入口)
 * - hooks/useDesktopReleaseState.ts (POS: 桌面 release 客户端状态)
 *
 * [OUTPUT]
 * - DesktopReleaseProvider, useDesktopRelease: 单页共享 release 状态，避免重复 fetch
 *
 * [POS]
 * 桌面 release React 上下文边界。单页共享 fetch 状态。
 */
'use client';

import { createContext, useContext, type ReactNode } from 'react';
import { useDesktopReleaseState } from '@/hooks/useDesktopReleaseState';

type DesktopReleaseContextValue = ReturnType<typeof useDesktopReleaseState>;

const DesktopReleaseContext = createContext<DesktopReleaseContextValue | null>(null);

export function DesktopReleaseProvider({ children }: { children: ReactNode }) {
  const value = useDesktopReleaseState();
  return (
    <DesktopReleaseContext.Provider value={value}>
      {children}
    </DesktopReleaseContext.Provider>
  );
}

export function useDesktopRelease(): DesktopReleaseContextValue {
  const context = useContext(DesktopReleaseContext);
  if (!context) {
    throw new Error('useDesktopRelease must be used within DesktopReleaseProvider');
  }
  return context;
}
