/**
 * [INPUT]
 * - next-intl marketing.hero.pathStrip / pathHint
 * - deploy-paths::getDeployPathHref, getDeployPathSectionLink (POS: 部署路径 registry)
 *
 * [OUTPUT]
 * - PathStrip: Hero / Final CTA 三路径 chip 导航条
 *
 * [POS]
 * Landing 部署路径分叉入口，链到 registry 定义的 SaaS / QuickStart / Download。
 */
'use client';

import Link from 'next/link';
import type { ReactNode } from 'react';
import { useTranslations } from 'next-intl';
import { useDocsLocale } from '@/hooks/useDocsLocale';
import { cn } from '@/lib/utils/classnameUtils';
import {
  DEPLOY_PATH_IDS,
  getDeployPathHref,
  getDeployPathSectionLink,
  type DeployPathId,
} from '@/lib/deploy-paths';

interface PathChipProps {
  pathId: DeployPathId;
  quickStartSectionId: string;
  children: ReactNode;
}

function PathChip({ pathId, quickStartSectionId, children }: PathChipProps) {
  const docsLocale = useDocsLocale();
  const href =
    pathId === 'localWebui'
      ? getDeployPathSectionLink(quickStartSectionId, pathId)
      : getDeployPathHref(pathId, docsLocale);

  const chipClass = cn(
    'inline-flex items-center rounded-full px-3 py-1.5 text-[11px] sm:text-[12px] ed-mono transition-opacity hover:opacity-80',
  );
  const chipStyle = {
    border: '1px solid color-mix(in oklch, var(--ed-border) 70%, transparent)',
    background: 'color-mix(in oklch, var(--ed-surface) 80%, transparent)',
    color: 'var(--ed-dim)',
  };

  if (pathId === 'tauri') {
    return (
      <Link href={href} className={chipClass} style={chipStyle}>
        {children}
      </Link>
    );
  }

  return (
    <a href={href} className={chipClass} style={chipStyle}>
      {children}
    </a>
  );
}

interface PathStripProps {
  className?: string;
  showHint?: boolean;
  quickStartSectionId?: string;
}

export default function PathStrip({
  className,
  showHint = true,
  quickStartSectionId = 'quickstart',
}: PathStripProps) {
  const t = useTranslations('marketing');

  return (
    <div className={cn('flex flex-col items-center gap-3', className)}>
      <div className="flex max-w-[980px] flex-wrap items-center justify-center gap-2 px-2">
        {DEPLOY_PATH_IDS.map((pathId) => (
          <PathChip key={pathId} pathId={pathId} quickStartSectionId={quickStartSectionId}>
            {t(`hero.pathStrip.${pathId}`)}
          </PathChip>
        ))}
      </div>
      {showHint ? (
        <p className="text-center text-[11px] sm:text-[12px] ed-mono tracking-wide px-4" style={{ color: 'var(--ed-muted)' }}>
          {t('hero.pathHint')}
        </p>
      ) : null}
    </div>
  );
}
