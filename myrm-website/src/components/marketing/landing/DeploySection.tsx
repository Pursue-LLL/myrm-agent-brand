/**
 * [INPUT]
 * - next-intl marketing.deploy.*
 * - deploy-paths (POS: 部署路径 registry)
 *
 * [OUTPUT]
 * - DeploySection: 三部署卡片 + 决策对比矩阵
 *
 * [POS]
 * Landing 部署决策区，锚点 `#deploy`。
 */
'use client';

import Link from 'next/link';
import { ArrowRight02Icon } from 'hugeicons-react';
import { useTranslations } from 'next-intl';
import { useDocsLocale } from '@/hooks/useDocsLocale';
import { cn } from '@/lib/utils/classnameUtils';
import {
  DEPLOY_PATH_IDS,
  deployPathToCardKey,
  getDeployPathHref,
  type DeployPathId,
} from '@/lib/deploy-paths';
import { getDesktopDownloadPath } from '@/lib/deploy-mode';

const MATRIX_ROWS = ['sovereignty', 'cost', 'ops', 'bestFor'] as const;

function DeployPathLink({
  pathId,
  children,
  className,
  style,
}: {
  pathId: DeployPathId;
  children: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
}) {
  const docsLocale = useDocsLocale();
  const href = getDeployPathHref(pathId, docsLocale);
  const cardKey = deployPathToCardKey(pathId);

  if (pathId === 'tauri') {
    return (
      <Link href={getDesktopDownloadPath()} className={className} style={style}>
        {children}
      </Link>
    );
  }

  if (pathId === 'localWebui') {
    return (
      <a href={href} target="_blank" rel="noopener noreferrer" className={className} style={style} data-deploy-card={cardKey}>
        {children}
      </a>
    );
  }

  return (
    <a href={href} className={className} style={style} data-deploy-card={cardKey}>
      {children}
    </a>
  );
}

export default function DeploySection() {
  const t = useTranslations('marketing');

  return (
    <section id="deploy" className="ed-section-alt py-20 sm:py-40">
      <div className="mx-auto max-w-[1080px] px-6">
        <div className="ed-reveal mx-auto max-w-md text-center">
          <h2 className="text-[clamp(1.8rem,4vw,2.6rem)] font-semibold tracking-[-0.02em]">
            {t('deploy.title')}
          </h2>
          <p className="mt-5 text-[15px] leading-relaxed font-light" style={{ color: 'var(--ed-dim)' }}>
            {t('deploy.subtitle')}
          </p>
        </div>

        <div className="mt-12 sm:mt-16 grid gap-6 md:grid-cols-2">
          {DEPLOY_PATH_IDS.map((pathId, index) => {
            const cardKey = deployPathToCardKey(pathId);
            const inner = (
              <>
                <h3 className="text-[16px] font-semibold">{t(`deploy.${cardKey}.title`)}</h3>
                <p className="mt-3 text-[14px] leading-[1.75] font-light" style={{ color: 'var(--ed-dim)' }}>
                  {t(`deploy.${cardKey}.description`)}
                </p>
                <span
                  className="mt-6 inline-flex items-center gap-1.5 text-[12px] font-medium ed-mono transition-opacity hover:opacity-80"
                  style={{ color: 'var(--ed-accent)' }}
                >
                  {t(`deploy.${cardKey}.cta`)}
                  <ArrowRight02Icon className="h-3.5 w-3.5" />
                </span>
              </>
            );

            return (
              <DeployPathLink
                key={pathId}
                pathId={pathId}
                className={cn(
                  'ed-reveal ed-card block rounded-2xl p-7 transition-transform hover:-translate-y-0.5',
                  `ed-stagger-${index + 1}`,
                )}
                style={{ border: '1px solid var(--ed-border)', background: 'var(--ed-surface)' }}
              >
                {inner}
              </DeployPathLink>
            );
          })}
        </div>

        <div
          className="ed-reveal mt-10 overflow-x-auto rounded-2xl"
          style={{ border: '1px solid var(--ed-border)', background: 'var(--ed-surface)' }}
        >
          <table className="w-full min-w-[640px] text-left text-[13px]">
            <thead>
              <tr style={{ borderBottom: '1px solid var(--ed-border)' }}>
                <th className="px-5 py-4 font-medium ed-mono" style={{ color: 'var(--ed-muted)' }}>
                  {t('deploy.matrix.dimension')}
                </th>
                {DEPLOY_PATH_IDS.map((pathId) => (
                  <th key={pathId} className="px-5 py-4 font-semibold">
                    {t(`howItWorks.tabs.${pathId}`)}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {MATRIX_ROWS.map((rowKey) => (
                <tr key={rowKey} style={{ borderBottom: '1px solid var(--ed-border)' }}>
                  <td className="px-5 py-4 font-medium ed-mono" style={{ color: 'var(--ed-dim)' }}>
                    {t(`deploy.matrix.${rowKey}.label`)}
                  </td>
                  {DEPLOY_PATH_IDS.map((pathId) => (
                    <td key={pathId} className="px-5 py-4 font-light" style={{ color: 'var(--ed-dim)' }}>
                      {t(`deploy.matrix.${rowKey}.${pathId}`)}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
}
