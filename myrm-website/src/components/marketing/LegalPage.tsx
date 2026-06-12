/**
 * [INPUT]
 * - components/marketing/MarketingShell.tsx (POS: 非 Landing 营销页的共享壳层)
 *
 * [OUTPUT]
 * - LegalPage: 法务页 section 排版（标题、更新日期、intro、多段正文）
 *
 * [POS]
 * 法务页通用排版。Privacy / Terms / Refund 共用。
 */
'use client';

import MarketingShell from '@/components/marketing/MarketingShell';

interface LegalSection {
  title: string;
  body: string;
}

interface LegalPageProps {
  title: string;
  updatedAt: string;
  intro: string;
  sections: LegalSection[];
}

export default function LegalPage({ title, updatedAt, intro, sections }: LegalPageProps) {
  return (
    <MarketingShell>
      <article className="mx-auto max-w-3xl px-4 py-12 sm:px-6 sm:py-16">
        <header className="mb-10 border-b border-border/60 pb-6">
          <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">{title}</h1>
          <p className="mt-3 text-sm text-muted-foreground">{updatedAt}</p>
          <p className="mt-4 text-muted-foreground">{intro}</p>
        </header>
        <div className="space-y-8">
          {sections.map((section) => (
            <section key={section.title}>
              <h2 className="text-xl font-semibold">{section.title}</h2>
              <p className="mt-3 whitespace-pre-line text-sm leading-7 text-muted-foreground">{section.body}</p>
            </section>
          ))}
        </div>
      </article>
    </MarketingShell>
  );
}
