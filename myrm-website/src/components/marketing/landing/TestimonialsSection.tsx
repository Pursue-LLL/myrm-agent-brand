'use client';

import { useTranslations } from 'next-intl';
import { useMemo } from 'react';
interface Testimonial {
  name: string;
  role: string;
  platform: string;
  content: string;
}

const PLATFORM_COLORS: Record<string, string> = {
  twitter: 'oklch(0.65 0.15 230)',
  discord: 'oklch(0.6 0.18 280)',
  wechat: 'oklch(0.7 0.18 145)',
};

function TestimonialCard({ item, index }: { item: Testimonial; index: number }) {
  const accent = PLATFORM_COLORS[item.platform] ?? 'var(--ed-accent)';

  return (
    <div
      className={`ed-reveal ed-stagger-${(index % 3) + 1} rounded-2xl p-5 transition-transform duration-300 hover:scale-[1.02]`}
      style={{
        border: '1px solid var(--ed-border)',
        background: 'color-mix(in oklch, var(--ed-surface) 80%, transparent)',
        backdropFilter: 'blur(12px)',
        WebkitBackdropFilter: 'blur(12px)',
      }}
    >
      <p className="text-[13px] leading-[1.75] font-light" style={{ color: 'var(--ed-dim)' }}>
        &ldquo;{item.content}&rdquo;
      </p>

      <div className="mt-4 flex items-center gap-2.5">
        <div
          className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-[10px] font-bold text-white"
          style={{ background: accent }}
        >
          {item.name.charAt(0)}
        </div>
        <div className="min-w-0">
          <p className="truncate text-[12px] font-medium">{item.name}</p>
          <p className="truncate text-[10px] ed-mono" style={{ color: 'var(--ed-muted)' }}>
            {item.role}
          </p>
        </div>
      </div>
    </div>
  );
}

export default function TestimonialsSection() {
  const t = useTranslations('marketing');

  const items: Testimonial[] = useMemo(() => {
    const raw = t.raw('testimonials.items') as Testimonial[];
    return Array.isArray(raw) ? raw : [];
  }, [t]);

  return (
    <section className="ed-section-main py-20 sm:py-40">
      <div className="mx-auto max-w-[1080px] px-6">
        <div className="ed-reveal mx-auto max-w-md text-center">
          <h2 className="text-[clamp(1.8rem,4vw,2.6rem)] font-semibold tracking-[-0.02em]">
            {t('testimonials.title')}
          </h2>
          <p className="mt-5 text-[15px] leading-relaxed font-light" style={{ color: 'var(--ed-dim)' }}>
            {t('testimonials.subtitle')}
          </p>
        </div>

        <div className="mt-16 columns-1 gap-4 sm:columns-2 lg:columns-3">
          {items.map((item, i) => (
            <div key={`${item.name}-${i}`} className="mb-4 break-inside-avoid">
              <TestimonialCard item={item} index={i} />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
