/**
 * [INPUT]
 * - myrm-docs/_ARCH.md, scripts/_ARCH.md (POS: Mintlify 模块分形文档)
 * - docs.json navigation page ids
 * - docs/** and docs/zh/** section directories
 *
 * [OUTPUT]
 * - 分形文档门禁：必检 _ARCH 存在、无 stub 占位符、导航页可解析、EN/zh 分区对齐
 *
 * [POS]
 * Mintlify 文档站轻量分形 CI 守门；导航 orphan 仍由 myrm-website validate-docs-slugs 负责。
 */
import { existsSync, readFileSync, readdirSync, statSync } from 'node:fs';
import { join } from 'node:path';

const DOCS_ROOT = join(import.meta.dir, '..');
const DOCS_DIR = join(DOCS_ROOT, 'docs');
const DOCS_JSON_PATH = join(DOCS_ROOT, 'docs.json');

const REQUIRED_ARCH_PATHS = ['_ARCH.md', 'scripts/_ARCH.md'] as const;

const REQUIRED_ASSETS = ['images/logo-icon.webp', 'images/favicon.png'] as const;

const DOC_SECTIONS = [
  'getting-started',
  'core-concepts',
  'guides',
  'tutorials',
  'api-reference',
  'contributing',
  'self-hosting',
] as const;

const STUB_MARKERS = ['待补', '（见目录）'] as const;

type NavTab = { groups?: Array<{ pages?: string[] }> };
type DocsJson = {
  navigation?: {
    tabs?: NavTab[];
    languages?: Array<{ language?: string; tabs?: NavTab[] }>;
  };
};

function collectMintlifyPages(doc: DocsJson): Set<string> {
  const pages = new Set<string>();
  const collectFromTabs = (tabs: NavTab[] | undefined): void => {
    for (const tab of tabs ?? []) {
      for (const group of tab.groups ?? []) {
        for (const page of group.pages ?? []) {
          pages.add(page);
        }
      }
    }
  };

  if (doc.navigation?.languages?.length) {
    for (const lang of doc.navigation.languages) {
      collectFromTabs(lang.tabs);
    }
    return pages;
  }

  collectFromTabs(doc.navigation?.tabs);
  return pages;
}

function listTopLevelMdxSections(root: string): Set<string> {
  const sections = new Set<string>();
  for (const entry of readdirSync(root)) {
    const fullPath = join(root, entry);
    if (!statSync(fullPath).isDirectory() || entry === 'zh') {
      continue;
    }
    const hasMdx = readdirSync(fullPath).some((name) => name.endsWith('.mdx'));
    if (hasMdx) {
      sections.add(entry);
    }
  }
  return sections;
}

export function collectFractalDocViolations(): string[] {
  const errors: string[] = [];

  for (const rel of REQUIRED_ARCH_PATHS) {
    const abs = join(DOCS_ROOT, rel);
    if (!existsSync(abs)) {
      errors.push(`missing required doc: ${rel}`);
      continue;
    }
    const content = readFileSync(abs, 'utf8');
    for (const stub of STUB_MARKERS) {
      if (content.includes(stub)) {
        errors.push(`stub marker ${JSON.stringify(stub)} in ${rel}`);
      }
    }
  }

  for (const rel of REQUIRED_ASSETS) {
    if (!existsSync(join(DOCS_ROOT, rel))) {
      errors.push(`missing required asset: ${rel}`);
    }
  }

  if (!existsSync(DOCS_JSON_PATH)) {
    errors.push('missing docs.json');
    return errors;
  }

  let doc: DocsJson;
  try {
    doc = JSON.parse(readFileSync(DOCS_JSON_PATH, 'utf8')) as DocsJson;
  } catch (error) {
    errors.push(`docs.json is not valid JSON: ${String(error)}`);
    return errors;
  }

  for (const pageId of collectMintlifyPages(doc)) {
    const mdxPath = join(DOCS_ROOT, `${pageId}.mdx`);
    if (!existsSync(mdxPath)) {
      errors.push(`docs.json page missing mdx: ${pageId}`);
    }
  }

  for (const section of DOC_SECTIONS) {
    const enDir = join(DOCS_DIR, section);
    const zhDir = join(DOCS_DIR, 'zh', section);
    if (!existsSync(enDir)) {
      errors.push(`missing EN docs section directory: docs/${section}`);
    }
    if (!existsSync(zhDir)) {
      errors.push(`missing ZH docs section directory: docs/zh/${section}`);
    }
  }

  const enSections = listTopLevelMdxSections(DOCS_DIR);
  const expectedSections = new Set<string>(DOC_SECTIONS);
  const extraEn = [...enSections].filter((section) => !expectedSections.has(section));
  if (extraEn.length > 0) {
    errors.push(
      `undocumented EN docs sections (update DOC_SECTIONS in check-fractal-docs.ts): ${extraEn.sort().join(', ')}`,
    );
  }

  const zhRoot = join(DOCS_DIR, 'zh');
  const zhSections = listTopLevelMdxSections(zhRoot);
  const extraZh = [...zhSections].filter((section) => !expectedSections.has(section));
  if (extraZh.length > 0) {
    errors.push(
      `undocumented ZH docs sections (update DOC_SECTIONS in check-fractal-docs.ts): ${extraZh.sort().join(', ')}`,
    );
  }

  return errors;
}

export function assertFractalDocsCompliant(): void {
  const errors = collectFractalDocViolations();
  if (errors.length > 0) {
    throw new Error(`Fractal documentation gate failed:\n${errors.join('\n')}`);
  }
}

if (import.meta.main) {
  const errors = collectFractalDocViolations();
  if (errors.length > 0) {
    console.error('Fractal documentation gate failed:\n' + errors.join('\n'));
    process.exit(1);
  }
  console.log(
    `Fractal docs OK (${REQUIRED_ARCH_PATHS.length} arch paths, ${DOC_SECTIONS.length} bilingual sections)`,
  );
}
