/**
 * [INPUT]
 * - next-intl marketing.quickStart.*
 * - getDeployPathHref, getDesktopDownloadPath (POS: 部署路径深链)
 * - SmartDownloadButton (POS: OS 智能下载 CTA)
 *
 * [OUTPUT]
 * - QuickStartPanel: OpenClaw 风格 code-block（header 内 Tab + 行级复制）
 *
 * [POS]
 * QuickStartSection 核心交互区；Local 每行独立复制，SaaS/Desktop 为 app 面板。
 */
'use client';

import Link from 'next/link';
import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { Copy01Icon, Download04Icon, Tick02Icon } from 'hugeicons-react';
import { cn } from '@/lib/utils/classnameUtils';
import SmartDownloadButton from '@/components/download/SmartDownloadButton';
import {
  getDeployPathHref,
  getLocalInstallOneliner,
  getLocalInstallOnelinerWindows,
  LOCAL_START_COMMAND,
} from '@/lib/deploy-paths';
import { getDesktopDownloadPath } from '@/lib/deploy-mode';
import type { QuickStartTabKey } from '@/lib/deploy-paths';

const QUICK_START_TABS: QuickStartTabKey[] = ['saas', 'local', 'desktop'];

type QuickStartPanelProps = {
  activeTab: QuickStartTabKey;
  onTabClick: (tab: QuickStartTabKey) => void;
};

function DeviceDots() {
  return (
    <>
      <span className="ed-code-dot" />
      <span className="ed-code-dot" />
      <span className="ed-code-dot" />
    </>
  );
}

const SHELL_KEYWORDS = new Set([
  'git',
  'clone',
  'cd',
  'curl',
  'bash',
  'irm',
  'iex',
  'powershell',
  '&&',
  '||',
  'docker',
  'compose',
  '|',
]);

function ShellCommandText({ text }: { text: string }) {
  const tokens = text.split(/(\s+|https?:\/\/\S+)/g).filter((part) => part.length > 0);

  return (
    <>
      {tokens.map((token, index) => {
        if (/^\s+$/.test(token)) {
          return <span key={`${index}-space`}>{token}</span>;
        }
        if (/^https?:\/\//.test(token)) {
          return (
            <span key={`${index}-url`} className="ed-code-token-url">
              {token}
            </span>
          );
        }
        if (token.startsWith('#')) {
          return (
            <span key={`${index}-comment`} className="ed-code-token-comment">
              {token}
            </span>
          );
        }
        if (SHELL_KEYWORDS.has(token)) {
          return (
            <span key={`${index}-kw`} className="ed-code-token-kw">
              {token}
            </span>
          );
        }
        return (
          <span key={`${index}-text`} className="ed-code-token-text">
            {token}
          </span>
        );
      })}
    </>
  );
}

function CopyLineButton({
  lineId,
  text,
  copiedLine,
  onCopy,
  label,
}: {
  lineId: string;
  text: string;
  copiedLine: string | null;
  onCopy: (lineId: string, text: string) => void;
  label: string;
}) {
  const isCopied = copiedLine === lineId;

  return (
    <button
      type="button"
      className="ed-copy-line-btn ed-copy-line-btn-labeled ed-mono"
      aria-label={label}
      onClick={() => onCopy(lineId, text)}
    >
      {isCopied ? (
        <>
          <Tick02Icon className="h-3 w-3" style={{ color: 'var(--ed-accent)' }} aria-hidden />
          <span>{label}</span>
        </>
      ) : (
        <>
          <Copy01Icon className="h-3 w-3" aria-hidden />
          <span>{label}</span>
        </>
      )}
    </button>
  );
}

function InstallStep({
  label,
  command,
  lineId,
  copiedLine,
  onCopy,
  copyLabel,
}: {
  label: string;
  command: string;
  lineId: string;
  copiedLine: string | null;
  onCopy: (lineId: string, text: string) => void;
  copyLabel: string;
}) {
  return (
    <div className="ed-code-step">
      <div className="ed-code-step-header">
        <small className="ed-code-step-label ed-mono">{label}</small>
        <CopyLineButton
          lineId={lineId}
          text={command}
          copiedLine={copiedLine}
          onCopy={onCopy}
          label={copyLabel}
        />
      </div>
      <div className="ed-code-install-box">
        <code className="ed-code-snippet">
          <ShellCommandText text={command} />
        </code>
      </div>
    </div>
  );
}

export default function QuickStartPanel({ activeTab, onTabClick }: QuickStartPanelProps) {
  const t = useTranslations('marketing');
  const [copiedLine, setCopiedLine] = useState<string | null>(null);

  const handleCopy = (lineId: string, text: string): void => {
    navigator.clipboard.writeText(text);
    setCopiedLine(lineId);
    window.setTimeout(() => setCopiedLine(null), 2000);
  };

  const installCmdUnix = getLocalInstallOneliner();
  const installCmdWindows = getLocalInstallOnelinerWindows();
  const startCmd = LOCAL_START_COMMAND;
  const copyLabel = t('quickStart.copyHint');

  return (
    <div className="ed-code-block" role="tabpanel" aria-live="polite">
      <div className="ed-code-header">
        <DeviceDots />
        <div className="ed-mode-switch" role="tablist" aria-label={t('quickStart.title')}>
          {QUICK_START_TABS.map((tab) => (
            <button
              key={tab}
              type="button"
              role="tab"
              aria-selected={activeTab === tab}
              onClick={() => onTabClick(tab)}
              className={cn('ed-mode-btn ed-mono', activeTab === tab ? 'ed-mode-btn-active' : '')}
            >
              {t(`quickStart.tabs.${tab}`)}
            </button>
          ))}
        </div>
      </div>

      {activeTab === 'saas' && (
        <div key="saas" className="ed-code-content ed-code-app-content ed-quickstart-panel-fade">
          <span className="ed-code-app-tagline">{t('quickStart.saas.step1')}</span>
          <span className="ed-code-app-subtitle">{t('quickStart.saas.step2')}</span>
          <a href={getDeployPathHref('saas')} className="ed-code-cta-btn ed-mono">
            {t('quickStart.saas.cta')}
          </a>
          <span className="ed-code-app-meta ed-mono">{t('quickStart.saas.url')}</span>
        </div>
      )}

      {activeTab === 'local' && (
        <div key="local" className="ed-code-content ed-quickstart-panel-fade">
          <div className="ed-code-line ed-code-line-comment">{t('quickStart.local.step1')}</div>
          <InstallStep
            label={t('quickStart.local.installLabelUnix')}
            command={installCmdUnix}
            lineId="local-install-unix"
            copiedLine={copiedLine}
            onCopy={handleCopy}
            copyLabel={copyLabel}
          />
          <InstallStep
            label={t('quickStart.local.installLabelWindows')}
            command={installCmdWindows}
            lineId="local-install-windows"
            copiedLine={copiedLine}
            onCopy={handleCopy}
            copyLabel={copyLabel}
          />
          <InstallStep
            label={t('quickStart.local.startLabel')}
            command={startCmd}
            lineId="local-start"
            copiedLine={copiedLine}
            onCopy={handleCopy}
            copyLabel={copyLabel}
          />
          <div className="ed-code-line ed-code-line-link mt-4">
            <span className="ed-code-prompt" aria-hidden>
              →
            </span>
            <a
              href={getDeployPathHref('localWebui')}
              target="_blank"
              rel="noopener noreferrer"
              className="ed-code-link ed-mono"
            >
              {t('quickStart.local.cta')}
            </a>
          </div>
        </div>
      )}

      {activeTab === 'desktop' && (
        <div key="desktop" className="ed-code-content ed-code-app-content ed-quickstart-panel-fade">
          <span className="ed-code-app-tagline">{t('quickStart.desktop.step1')}</span>
          <span className="ed-code-app-subtitle">{t('quickStart.desktop.step2')}</span>
          <div className="ed-code-download-wrap">
            <SmartDownloadButton variant="quickstart" showAllPlatformsLink={false} />
          </div>
          <Link href={getDesktopDownloadPath()} className="ed-code-app-link ed-mono">
            <Download04Icon className="h-3.5 w-3.5" aria-hidden />
            {t('quickStart.desktop.step3')}
          </Link>
        </div>
      )}
    </div>
  );
}
