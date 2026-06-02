'use client';

import { useTranslations } from 'next-intl';
import { useDesktopRelease } from '@/components/download/DesktopReleaseProvider';

export default function ReleaseNotesSection() {
  const t = useTranslations('marketing');
  const { release } = useDesktopRelease();

  if (!release?.releaseNotes?.trim()) return null;

  return (
    <details className="mt-10 rounded-2xl border border-border bg-card p-5 sm:p-6">
      <summary className="cursor-pointer text-[13px] font-medium text-foreground">
        {t('download.releaseNotes.title', { version: release.version })}
      </summary>
      <div className="mt-4 whitespace-pre-wrap text-[14px] leading-relaxed text-muted-foreground">
        {release.releaseNotes.trim()}
      </div>
    </details>
  );
}
