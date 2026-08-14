/**
 * Rewrites docs.json navigation to Mintlify languages[] (en + zh).
 * Run once: bun run scripts/apply-i18n-docs-json.ts
 */
import { readFileSync, writeFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const docsJsonPath = join(root, 'docs.json');

type Tab = { tab: string; groups: Array<{ group: string; pages: string[] }> };

const doc = JSON.parse(readFileSync(docsJsonPath, 'utf8')) as {
  navigation: { tabs?: Tab[]; languages?: Array<{ tabs: Tab[] }> };
  topbar?: { links?: Array<{ name: string; url: string }> };
  footer?: unknown;
};

// Support both the legacy single-language `navigation.tabs` shape and the
// current `navigation.languages[].tabs` shape (en first).
const enTabs: Tab[] =
  doc.navigation.tabs ?? doc.navigation.languages?.[0]?.tabs ?? [];

if (!doc.navigation.tabs && doc.navigation.languages?.length) {
  console.error(
    'docs.json already uses navigation.languages[] (en/zh/ko). ' +
      'This one-shot en+zh migration tool is obsolete; refusing to overwrite.',
  );
  process.exit(1);
}

const TAB_ZH: Record<string, string> = {
  Documentation: '文档',
  'API Reference': 'API 参考',
  Contributing: '贡献指南',
};

const GROUP_ZH: Record<string, string> = {
  'Getting Started': '快速入门',
  'Core Concepts': '核心概念',
  Guides: '使用指南',
  'Self-Hosting': '自托管',
  'API Reference': 'API 参考',
  Contributing: '贡献指南',
};

const FOOTER_LINK_ZH: Record<string, string> = {
  Product: '产品',
  Community: '社区',
  Legal: '法律',
  Home: '首页',
  Pricing: '定价',
  App: '应用',
  Privacy: '隐私政策',
  Terms: '服务条款',
};

type FooterLink = { name: string; url: string };
type FooterGroup = { title: string; links: FooterLink[] };
type Footer = { links: FooterGroup[] };

function localizeFooter(footer: Footer | undefined): Footer | undefined {
  if (!footer?.links) return footer;
  return {
    links: footer.links.map((group) => ({
      title: FOOTER_LINK_ZH[group.title] ?? group.title,
      links: group.links.map((link) => ({
        ...link,
        name: FOOTER_LINK_ZH[link.name] ?? link.name,
      })),
    })),
  };
}

const zhTabs: Tab[] = enTabs.map((tab) => ({
  tab: TAB_ZH[tab.tab] ?? tab.tab,
  groups: tab.groups.map((group) => ({
    group: GROUP_ZH[group.group] ?? group.group,
    pages: group.pages.map((page) =>
      page.startsWith('docs/zh/') ? page : page.replace(/^docs\//, 'docs/zh/'),
    ),
  })),
}));

const next = {
  ...doc,
  navigation: {
    languages: [
      {
        language: 'en',
        tabs: enTabs,
        topbar: doc.topbar,
        footer: doc.footer,
      },
      {
        language: 'zh',
        tabs: zhTabs,
        topbar: {
          links: [{ name: '开始使用', url: 'https://app.myrmagent.ai/auth/login' }],
        },
        footer: localizeFooter(doc.footer as Footer | undefined),
      },
    ],
  },
};

delete (next as { topbar?: unknown }).topbar;
delete (next as { footer?: unknown }).footer;

writeFileSync(docsJsonPath, `${JSON.stringify(next, null, 2)}\n`, 'utf8');
console.log('Updated docs.json with en + zh languages');
