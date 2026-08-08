/**
 * Adds Mintlify navigation.languages[] ko block (mirrors zh pattern).
 * Run: bun run scripts/apply-ko-docs-json.ts
 */
import { readFileSync, writeFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const docsJsonPath = join(root, 'docs.json');

type Tab = { tab: string; groups: Array<{ group: string; pages: string[] }> };
type LangBlock = {
  language: string;
  tabs: Tab[];
  navbar?: unknown;
  footer?: unknown;
};

type DocsJson = {
  navigation: { languages: LangBlock[] };
};

const doc = JSON.parse(readFileSync(docsJsonPath, 'utf8')) as DocsJson;
const enBlock = doc.navigation.languages.find((l) => l.language === 'en');
if (!enBlock) {
  throw new Error('docs.json missing navigation.languages[en]');
}
if (doc.navigation.languages.some((l) => l.language === 'ko')) {
  console.log('docs.json already has ko language block — skipping');
  process.exit(0);
}

const TAB_KO: Record<string, string> = {
  Documentation: '문서',
  'API Reference': 'API 참조',
  Tutorials: '튜토리얼',
  Contributing: '기여하기',
};

const GROUP_KO: Record<string, string> = {
  'Getting Started': '시작하기',
  'Core Concepts': '핵심 개념',
  Guides: '가이드',
  'Self-Hosting': '셀프 호스팅',
  'API Reference': 'API 참조',
  Contributing: '기여하기',
  'Quick Start': '빠른 시작',
  'Real-World Cases': '실전 사례',
  'Advanced Practices': '고급 실습',
  'Roles & Industries': '직무 및 산업',
};

const FOOTER_KO: Record<string, string> = {
  Product: '제품',
  Community: '커뮤니티',
  Legal: '법적 고지',
  Home: '홈',
  Pricing: '요금',
  App: '앱',
  Privacy: '개인정보 처리방침',
  Terms: '이용약관',
};

type FooterLink = { label: string; href: string };
type FooterGroup = { header: string; items: FooterLink[] };
type Footer = { links: FooterGroup[] };

function localizeFooter(footer: Footer | undefined): Footer | undefined {
  if (!footer?.links) return footer;
  return {
    links: footer.links.map((group) => ({
      header: FOOTER_KO[group.header] ?? group.header,
      items: group.items.map((item) => ({
        ...item,
        label: FOOTER_KO[item.label] ?? item.label,
      })),
    })),
  };
}

const koTabs: Tab[] = enBlock.tabs.map((tab) => ({
  tab: TAB_KO[tab.tab] ?? tab.tab,
  groups: tab.groups.map((group) => ({
    group: GROUP_KO[group.group] ?? group.group,
    pages: group.pages.map((page) =>
      page.startsWith('docs/ko/') ? page : page.replace(/^docs\//, 'docs/ko/'),
    ),
  })),
}));

const koBlock: LangBlock = {
  language: 'ko',
  tabs: koTabs,
  navbar: {
    primary: {
      type: 'button',
      label: '시작하기',
      href: 'https://app.myrmagent.ai/auth/login',
    },
  },
  footer: localizeFooter(enBlock.footer as Footer | undefined),
};

doc.navigation.languages.push(koBlock);

writeFileSync(docsJsonPath, `${JSON.stringify(doc, null, 2)}\n`, 'utf8');
console.log('Updated docs.json with ko language block');
