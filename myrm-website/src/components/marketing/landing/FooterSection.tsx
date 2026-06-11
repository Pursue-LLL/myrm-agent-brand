/**
 * [INPUT]
 * - deploy-mode::getDocsUrl, getDesktopDownloadPath (POS: 营销站外部链接统一入口)
 * - hooks/useDocsLocale (POS: 站点 locale → Mintlify docs locale)
 *
 * [OUTPUT]
 * - FooterSection: 落地页页脚（VortexAI 主体、法务链、社区链、docs locale 深链）
 *
 * [POS]
 * 落地页底部收口；docs 链接随站点语言跳转 EN/ZH Mintlify。
 */
'use client';

import Link from 'next/link';
import { useDocsLocale } from '@/hooks/useDocsLocale';
import { getDocsUrl, getDesktopDownloadPath } from '@/lib/deploy-mode';
import { useTranslations } from 'next-intl';
import BrandLogo from '../BrandLogo';

export default function FooterSection() {
  const t = useTranslations('marketing');
  const docsLocale = useDocsLocale();

  return (
    <footer style={{ borderTop: '1px solid var(--ed-border)', background: 'var(--ed-surface)' }}>
      <div className="mx-auto max-w-[1080px] px-6 py-20">
        <div className="flex flex-col gap-12 md:flex-row md:justify-between">
          <div className="max-w-xs">
            <div className="flex items-center gap-2.5">
              <BrandLogo />
              <span className="text-sm font-semibold tracking-tight">{t('brand')}</span>
            </div>
            <p className="mt-4 text-[14px] leading-[1.8] font-light" style={{ color: 'var(--ed-dim)' }}>{t('footer.tagline')}</p>
            <p className="mt-3 text-[12px] leading-[1.7] font-light" style={{ color: 'var(--ed-dim)' }}>{t('footer.operator')}</p>
            <p className="mt-5 text-[11px] ed-mono" style={{ color: 'var(--ed-muted)' }}>{t('footer.contact')}</p>
          </div>
          <div className="flex flex-col gap-3 text-[13px] font-light" style={{ color: 'var(--ed-dim)' }}>
            <p className="mb-2 text-[10px] uppercase tracking-[0.2em] font-medium ed-mono" style={{ color: 'var(--ed-muted)' }}>Links</p>
            <Link href="/privacy" className="transition-colors hover:text-[var(--ed-accent)]">{t('footer.privacy')}</Link>
            <Link href="/terms" className="transition-colors hover:text-[var(--ed-accent)]">{t('footer.terms')}</Link>
            <Link href={getDesktopDownloadPath()} className="transition-colors hover:text-[var(--ed-accent)]">{t('footer.download')}</Link>
          </div>
          <div className="flex flex-col gap-3 text-[13px] font-light" style={{ color: 'var(--ed-dim)' }}>
            <p className="mb-2 text-[10px] uppercase tracking-[0.2em] font-medium ed-mono" style={{ color: 'var(--ed-muted)' }}>{t('footer.community')}</p>
            <a href="https://github.com/Pursue-LLL/myrm-agent" target="_blank" rel="noopener noreferrer" className="transition-colors hover:text-[var(--ed-accent)]">{t('footer.github')}</a>
            <a href={getDocsUrl('/', docsLocale)} target="_blank" rel="noopener noreferrer" className="transition-colors hover:text-[var(--ed-accent)]">{t('footer.docs')}</a>
          </div>
        </div>
      </div>
      <div className="py-5 text-center text-[11px] ed-mono" style={{ borderTop: '1px solid var(--ed-border)', color: 'var(--ed-muted)' }}>
        {t('footer.copyright', { year: new Date().getFullYear() })}
      </div>
    </footer>
  );
}
