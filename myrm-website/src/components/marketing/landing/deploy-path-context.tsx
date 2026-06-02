/**
 * [INPUT]
 * - deploy-paths (POS: 部署路径 registry)
 *
 * [OUTPUT]
 * - DeployPathProvider: 三路径 Tab 单源状态
 * - useDeployPath(): 消费路径状态与 selectPath
 *
 * [POS]
 * HowItWorks 与 QuickStart 共享部署路径 Tab 的单源 React 状态。
 */
'use client';

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import {
  deployPathToQuickStartTab,
  readDeployPathFromLocation,
  scrollToSection,
  writeDeployPathSectionLink,
  type DeployPathId,
  type QuickStartTabKey,
} from '@/lib/deploy-paths';

type DeployPathContextValue = {
  activePath: DeployPathId;
  activeTab: QuickStartTabKey;
  selectPath: (pathId: DeployPathId, sectionId: string) => void;
};

const DeployPathContext = createContext<DeployPathContextValue | null>(null);

export function DeployPathProvider({ children }: { children: ReactNode }) {
  const [activePath, setActivePath] = useState<DeployPathId>('saas');

  useEffect(() => {
    const syncFromLocation = (): void => {
      const parsed = readDeployPathFromLocation();
      setActivePath(parsed ?? 'saas');
    };

    syncFromLocation();
    window.addEventListener('popstate', syncFromLocation);
    window.addEventListener('hashchange', syncFromLocation);
    return () => {
      window.removeEventListener('popstate', syncFromLocation);
      window.removeEventListener('hashchange', syncFromLocation);
    };
  }, []);

  const selectPath = useCallback((pathId: DeployPathId, sectionId: string) => {
    setActivePath(pathId);
    writeDeployPathSectionLink(sectionId, pathId);
    scrollToSection(sectionId);
  }, []);

  const value = useMemo<DeployPathContextValue>(
    () => ({
      activePath,
      activeTab: deployPathToQuickStartTab(activePath),
      selectPath,
    }),
    [activePath, selectPath],
  );

  return <DeployPathContext.Provider value={value}>{children}</DeployPathContext.Provider>;
}

export function useDeployPath(): DeployPathContextValue {
  const context = useContext(DeployPathContext);
  if (!context) {
    throw new Error('useDeployPath must be used within DeployPathProvider');
  }
  return context;
}
