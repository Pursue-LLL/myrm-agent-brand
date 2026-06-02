'use client';

import { useTranslations } from 'next-intl';

const INSTALL_STEP_KEYS = ['macos', 'windows', 'linux'] as const;

export default function InstallStepsSection() {
  const t = useTranslations('marketing');

  return (
    <div className="mt-10 rounded-2xl border border-border bg-muted/20 p-5 sm:p-6">
      <p className="text-[10px] uppercase tracking-[0.2em] font-medium text-muted-foreground font-mono">
        {t('download.installSteps.title')}
      </p>
      <div className="mt-5 grid gap-4 md:grid-cols-3">
        {INSTALL_STEP_KEYS.map((platform, index) => (
          <div key={platform} className="rounded-xl border border-border bg-card p-4">
            <p className="text-[11px] font-mono uppercase tracking-wide text-primary">
              {t('download.installSteps.stepLabel', { step: index + 1 })}
            </p>
            <h3 className="mt-2 text-[14px] font-semibold text-foreground">
              {t(`download.installSteps.${platform}.title`)}
            </h3>
            <p className="mt-2 text-[13px] leading-relaxed text-muted-foreground">
              {t(`download.installSteps.${platform}.description`)}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
