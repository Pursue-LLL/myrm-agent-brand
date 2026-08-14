/**
 * One-off helper: prints zh navigation tabs JSON (pages prefixed with docs/zh/).
 * Run: bun run scripts/build-zh-navigation.ts
 */
import { readFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const doc = JSON.parse(readFileSync(join(root, 'docs.json'), 'utf8')) as {
  navigation: {
    tabs?: Array<{ tab: string; groups: Array<{ group: string; pages: string[] }> }>;
    languages?: Array<{ tabs: Array<{ tab: string; groups: Array<{ group: string; pages: string[] }> }> }>;
  };
};

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

const zhTabs = (doc.navigation.tabs ?? doc.navigation.languages?.[0]?.tabs ?? []).map((tab) => ({
  tab: TAB_ZH[tab.tab] ?? tab.tab,
  groups: tab.groups.map((group) => ({
    group: GROUP_ZH[group.group] ?? group.group,
    pages: group.pages.map((page) =>
      page.startsWith('docs/zh/') ? page : page.replace(/^docs\//, 'docs/zh/'),
    ),
  })),
}));

console.log(JSON.stringify(zhTabs, null, 2));
