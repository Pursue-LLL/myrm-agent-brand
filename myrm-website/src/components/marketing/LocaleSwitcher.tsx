'use client';

import { useLocale } from 'next-intl';
import { cn } from '@/lib/utils/classnameUtils';
import { useAppLocale } from '@/components/i18n/LocaleRootProvider';
import { locales, type Locale } from '@/i18n/config';

interface LocaleSwitcherProps {
  className?: string;
  variant?: 'editorial' | 'shell';
}

const LOCALE_LABELS: Record<Locale, string> = {
  en: 'EN',
  ko: '한',
  zh: '中',
};

export default function LocaleSwitcher({ className, variant = 'editorial' }: LocaleSwitcherProps) {
  const locale = useLocale() as Locale;
  const { setAppLocale } = useAppLocale();

  const switchTo = (next: Locale) => {
    if (next === locale) return;
    setAppLocale(next);
  };

  const isEditorial = variant === 'editorial';

  return (
    <div
      className={cn(
        'inline-flex items-center rounded-full p-0.5',
        isEditorial ? 'border' : 'border border-border/60 bg-muted/30',
        className,
      )}
      style={isEditorial ? { borderColor: 'var(--ed-border)' } : undefined}
      role="group"
      aria-label="Language"
    >
      {locales.map((code) => {
        const active = locale === code;
        return (
          <button
            key={code}
            type="button"
            onClick={() => switchTo(code)}
            className={cn(
              'rounded-full px-2.5 py-1 text-[11px] font-medium transition-colors',
              isEditorial && active && 'text-white',
              isEditorial && !active && 'hover:text-[var(--ed-accent)]',
              !isEditorial && active && 'bg-primary text-primary-foreground',
              !isEditorial && !active && 'text-muted-foreground hover:text-foreground',
            )}
            style={
              isEditorial
                ? {
                    background: active ? 'var(--ed-accent)' : 'transparent',
                    color: active ? undefined : 'var(--ed-dim)',
                  }
                : undefined
            }
          >
            {LOCALE_LABELS[code]}
          </button>
        );
      })}
    </div>
  );
}
