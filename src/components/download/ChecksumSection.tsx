'use client';

import { useRef, useState } from 'react';
import { useTranslations } from 'next-intl';
import { fetchSha256FromUrl } from '@/lib/desktop-release';
import { useDesktopRelease } from '@/components/download/DesktopReleaseProvider';

export default function ChecksumSection() {
  const t = useTranslations('marketing');
  const { release } = useDesktopRelease();
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [pendingIds, setPendingIds] = useState<Set<string>>(() => new Set());
  const [resolvedHashes, setResolvedHashes] = useState<Record<string, string>>({});
  const inflightRef = useRef<Set<string>>(new Set());

  const checksumTargets =
    release?.targets.filter((target) => target.sha256 || target.sha256Url) ?? [];

  const resolveHash = async (
    targetId: string,
    sha256: string | null,
    sha256Url: string | null,
  ): Promise<string | null> => {
    if (sha256) return sha256;
    if (resolvedHashes[targetId]) return resolvedHashes[targetId];
    if (!sha256Url || inflightRef.current.has(targetId)) return null;

    inflightRef.current.add(targetId);
    setPendingIds((prev) => new Set(prev).add(targetId));

    const fetched = await fetchSha256FromUrl(sha256Url);

    inflightRef.current.delete(targetId);
    setPendingIds((prev) => {
      const next = new Set(prev);
      next.delete(targetId);
      return next;
    });

    if (fetched) {
      setResolvedHashes((prev) => ({ ...prev, [targetId]: fetched }));
    }
    return fetched;
  };

  const copyHash = async (targetId: string, hash: string) => {
    try {
      await navigator.clipboard.writeText(hash);
      setCopiedId(targetId);
      window.setTimeout(() => setCopiedId(null), 2000);
    } catch {
      // Clipboard may be unavailable in non-secure contexts.
    }
  };

  if (checksumTargets.length === 0) return null;

  return (
    <details
      className="mt-10 rounded-2xl border border-border bg-muted/10 p-5 sm:p-6"
      onToggle={(event) => {
        if (!(event.currentTarget as HTMLDetailsElement).open) return;
        for (const target of checksumTargets) {
          void resolveHash(target.id, target.sha256, target.sha256Url);
        }
      }}
    >
      <summary className="cursor-pointer text-[13px] font-medium text-foreground">
        {t('download.checksums.title')}
      </summary>
      <ul className="mt-4 space-y-4">
        {checksumTargets.map((target) => {
          const hash = target.sha256 ?? resolvedHashes[target.id] ?? null;
          const isPending = pendingIds.has(target.id) && !hash;

          return (
            <li key={target.id} className="space-y-2">
              <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
                <span className="text-[13px] text-muted-foreground">
                  {t(`download.platforms.${target.id}`)}
                </span>
                {target.sha256Url && (
                  <a
                    href={target.sha256Url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[12px] font-mono text-primary transition-opacity hover:opacity-80"
                  >
                    {target.fileName}.sha256
                  </a>
                )}
              </div>
              {isPending && (
                <p className="text-[12px] text-muted-foreground">{t('download.checksums.loading')}</p>
              )}
              {hash && (
                <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                  <code className="block break-all rounded-lg bg-muted/40 px-3 py-2 text-[11px] font-mono leading-relaxed text-foreground">
                    {hash}
                  </code>
                  <button
                    type="button"
                    onClick={() => {
                      void copyHash(target.id, hash);
                    }}
                    className="shrink-0 rounded-full border border-border px-3 py-1.5 text-[12px] font-medium text-foreground transition-colors hover:bg-muted/40"
                  >
                    {copiedId === target.id
                      ? t('download.checksums.copied')
                      : t('download.checksums.copy')}
                  </button>
                </div>
              )}
            </li>
          );
        })}
      </ul>
    </details>
  );
}
