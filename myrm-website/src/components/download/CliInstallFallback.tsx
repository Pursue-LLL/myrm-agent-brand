/**
 * [INPUT]
 * - deploy-paths::getLocalInstallOneliner, getLocalInstallOnelinerWindows, LOCAL_START_COMMAND
 *   (POS: 部署路径 registry 与公开安装脚本 URL)
 *
 * [OUTPUT]
 * - CliInstallFallback: 无桌面包时的筹备说明 + localWebui 终端引导（可复制 Unix / Windows / 启动命令）
 *
 * [POS]
 * 桌面下载空状态组件；明确区分 tauri 筹备中与 localWebui 终端路径，不向用户暴露 GitHub Releases。
 */
'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { Copy01Icon, Tick02Icon } from 'hugeicons-react';
import { cn } from '@/lib/utils/classnameUtils';
import {
  getLocalInstallOneliner,
  getLocalInstallOnelinerWindows,
  LOCAL_START_COMMAND,
} from '@/lib/deploy-paths';

interface CliInstallFallbackProps {
  editorial?: boolean;
  className?: string;
}

interface InstallCommandRowProps {
  label: string;
  command: string;
  rowId: string;
  copiedRowId: string | null;
  onCopy: (rowId: string, command: string) => void;
  copyLabel: string;
  copiedLabel: string;
  editorial: boolean;
}

function InstallCommandRow({
  label,
  command,
  rowId,
  copiedRowId,
  onCopy,
  copyLabel,
  copiedLabel,
  editorial,
}: InstallCommandRowProps) {
  const isCopied = copiedRowId === rowId;
  const actionLabel = isCopied ? copiedLabel : copyLabel;

  return (
    <div className="space-y-2">
      <div className="flex flex-wrap items-center justify-between gap-x-3 gap-y-2">
        <p
          className={cn(
            'min-w-0 text-[12px] font-medium',
            editorial ? 'ed-mono' : 'text-muted-foreground',
          )}
          style={editorial ? { color: 'var(--ed-dim)' } : undefined}
        >
          {label}
        </p>
        <button
          type="button"
          className={cn(
            'inline-flex shrink-0 items-center gap-1.5 rounded-full border px-3 py-1 text-[11px] font-medium transition-colors',
            editorial ? 'ed-mono' : 'font-mono text-muted-foreground hover:text-foreground',
          )}
          style={
            editorial
              ? { borderColor: 'var(--ed-border)', color: 'var(--ed-dim)' }
              : { borderColor: 'var(--border)' }
          }
          aria-label={actionLabel}
          onClick={() => onCopy(rowId, command)}
        >
          {isCopied ? (
            <Tick02Icon className="h-3 w-3" aria-hidden />
          ) : (
            <Copy01Icon className="h-3 w-3" aria-hidden />
          )}
          <span>{actionLabel}</span>
        </button>
      </div>
      <pre
        className={cn(
          'overflow-x-auto rounded-xl border px-3 py-3 text-[11px] leading-relaxed sm:px-4 sm:text-[12px]',
          editorial ? 'ed-mono' : 'font-mono text-foreground',
        )}
        style={
          editorial
            ? {
                borderColor: 'var(--ed-border)',
                background: 'var(--ed-surface)',
                color: 'var(--ed-ink)',
              }
            : { borderColor: 'var(--border)', background: 'var(--card)' }
        }
      >
        <code className="whitespace-pre-wrap break-all sm:whitespace-pre sm:break-normal">{command}</code>
      </pre>
    </div>
  );
}

export default function CliInstallFallback({ editorial = false, className }: CliInstallFallbackProps) {
  const tPending = useTranslations('marketing.download.pendingDesktop');
  const t = useTranslations('marketing.download.cliInstall');
  const [copiedRowId, setCopiedRowId] = useState<string | null>(null);

  const handleCopy = async (rowId: string, command: string) => {
    try {
      await navigator.clipboard.writeText(command);
      setCopiedRowId(rowId);
      window.setTimeout(() => setCopiedRowId(null), 2000);
    } catch {
      // Clipboard may be unavailable in non-secure contexts.
    }
  };

  return (
    <div className={cn('space-y-6', className)}>
      <div
        className={cn(
          'space-y-2 rounded-2xl border p-4 sm:p-6',
          editorial ? 'ed-card' : 'border-border bg-muted/20',
        )}
        style={
          editorial
            ? { border: '1px solid var(--ed-border)', background: 'var(--ed-surface)' }
            : undefined
        }
      >
        <p
          className={cn('text-[15px] font-semibold sm:text-base', editorial ? '' : 'text-foreground')}
          style={editorial ? { color: 'var(--ed-ink)' } : undefined}
        >
          {tPending('title')}
        </p>
        <p
          className={cn(
            'text-[13px] leading-relaxed sm:text-[14px]',
            editorial ? 'ed-mono' : 'text-muted-foreground',
          )}
          style={editorial ? { color: 'var(--ed-dim)' } : undefined}
        >
          {tPending('description')}
        </p>
      </div>

      <div
        className={cn(
          'space-y-5 rounded-2xl border p-4 sm:p-6',
          editorial ? 'ed-card' : 'border-border bg-card',
        )}
        style={
          editorial
            ? { border: '1px solid var(--ed-border)', background: 'var(--ed-surface)' }
            : undefined
        }
      >
      <div className="space-y-2">
        <p
          className={cn('text-[15px] font-semibold sm:text-base', editorial ? '' : 'text-foreground')}
          style={editorial ? { color: 'var(--ed-ink)' } : undefined}
        >
          {t('title')}
        </p>
        <p
          className={cn(
            'text-[13px] leading-relaxed sm:text-[14px]',
            editorial ? 'ed-mono' : 'text-muted-foreground',
          )}
          style={editorial ? { color: 'var(--ed-dim)' } : undefined}
        >
          {t('description')}
        </p>
      </div>

      <InstallCommandRow
        label={t('unixLabel')}
        command={getLocalInstallOneliner()}
        rowId="cli-install-unix"
        copiedRowId={copiedRowId}
        onCopy={handleCopy}
        copyLabel={t('copy')}
        copiedLabel={t('copied')}
        editorial={editorial}
      />
      <InstallCommandRow
        label={t('windowsLabel')}
        command={getLocalInstallOnelinerWindows()}
        rowId="cli-install-windows"
        copiedRowId={copiedRowId}
        onCopy={handleCopy}
        copyLabel={t('copy')}
        copiedLabel={t('copied')}
        editorial={editorial}
      />
      <InstallCommandRow
        label={t('startLabel')}
        command={LOCAL_START_COMMAND}
        rowId="cli-install-start"
        copiedRowId={copiedRowId}
        onCopy={handleCopy}
        copyLabel={t('copy')}
        copiedLabel={t('copied')}
        editorial={editorial}
      />

      <p
        className={cn(
          'text-[11px] leading-relaxed sm:text-[12px]',
          editorial ? 'ed-mono' : 'text-muted-foreground',
        )}
        style={editorial ? { color: 'var(--ed-muted)' } : undefined}
      >
        {t('note')}
      </p>
      </div>
    </div>
  );
}
