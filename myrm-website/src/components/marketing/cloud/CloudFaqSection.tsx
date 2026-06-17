/**
 * [INPUT]
 * - next-intl cloud.faq.*
 * - cloud/cloud-marketing-keys::CLOUD_FAQ_KEYS
 *
 * [OUTPUT]
 * - CloudFaqSection: SaaS 页 FAQ（ed-faq 样式）
 *
 * [POS]
 * `/cloud` 常见问题；键契约由 cloud-marketing-keys 驱动。
 */
'use client';

import { useTranslations } from 'next-intl';
import { CLOUD_FAQ_KEYS } from './cloud-marketing-keys';

export default function CloudFaqSection() {
  const t = useTranslations('cloud');

  return (
    <section id="faq" className="ed-section-alt py-20 sm:py-32">
      <div className="mx-auto max-w-[620px] px-6">
        <h2 className="ed-reveal text-center text-[clamp(1.8rem,4vw,2.6rem)] font-semibold tracking-[-0.02em]">
          {t('faq.title')}
        </h2>
        <div className="mt-16 space-y-0">
          {CLOUD_FAQ_KEYS.map((key) => (
            <details
              key={key}
              className="ed-reveal ed-faq py-5"
              style={{ borderBottom: '1px solid var(--ed-border)' }}
            >
              <summary className="text-[15px] font-medium">
                <span className="flex items-center justify-between gap-4">
                  {t(`faq.items.${key}.question`)}
                  <span
                    className="shrink-0 text-lg leading-none transition-transform duration-300"
                    style={{ color: 'var(--ed-muted)' }}
                  >
                    +
                  </span>
                </span>
              </summary>
              <div className="ed-faq-body">
                <div className="ed-faq-inner">
                  <p className="pb-1 pt-4 text-[14px] font-light leading-[1.8]" style={{ color: 'var(--ed-dim)' }}>
                    {t(`faq.items.${key}.answer`)}
                  </p>
                </div>
              </div>
            </details>
          ))}
        </div>
      </div>
    </section>
  );
}
