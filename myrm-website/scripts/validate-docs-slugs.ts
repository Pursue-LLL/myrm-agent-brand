/**
 * [INPUT]
 * - src/lib/docs-contract.ts::MARKETING_DOC_PATHS (POS: 营销站 → Mintlify slug 契约)
 * - myrm-docs/docs.json, myrm-docs/docs 下全部 .mdx
 *
 * [OUTPUT]
 * - CI 校验：营销外链 slug 存在、MDX 文件存在、磁盘 MDX 无 orphan、禁止 legacy 域名、zh/ko 关键页英文句门禁
 *
 * [POS]
 * 营销站与 Mintlify 文档导航一致性校验脚本；`bun run build` 前自动执行。
 */
import { readFileSync, existsSync, readdirSync, statSync } from 'node:fs';
import { join, dirname, relative } from 'node:path';
import { fileURLToPath } from 'node:url';
import {
  localizedDocsPath,
  MARKETING_DOC_PATHS,
  type DocsLocale,
} from '../src/lib/docs-contract';
import { appendLegacyUrlViolations } from './brand-url-patterns';

const SCRIPT_DIR = dirname(fileURLToPath(import.meta.url));
const WEBSITE_ROOT = join(SCRIPT_DIR, '..');
const BRAND_ROOT = join(WEBSITE_ROOT, '..');
const DOCS_ROOT = join(BRAND_ROOT, 'myrm-docs');
const DOCS_JSON = join(DOCS_ROOT, 'docs.json');

const DOCS_SCAN_EXTENSIONS = new Set(['.json', '.mdx', '.md']);

type NavTab = { groups?: Array<{ pages?: string[] }> };
type DocsJson = {
  navigation?: {
    tabs?: NavTab[];
    languages?: Array<{ language?: string; tabs?: NavTab[] }>;
  };
};

function collectPagesFromTabs(tabs: NavTab[] | undefined, pages: Set<string>): void {
  for (const tab of tabs ?? []) {
    for (const group of tab.groups ?? []) {
      for (const page of group.pages ?? []) {
        pages.add(page);
      }
    }
  }
}

function collectMintlifyPages(doc: DocsJson): Set<string> {
  const pages = new Set<string>();
  if (doc.navigation?.languages?.length) {
    for (const lang of doc.navigation.languages) {
      collectPagesFromTabs(lang.tabs, pages);
    }
    return pages;
  }
  collectPagesFromTabs(doc.navigation?.tabs, pages);
  return pages;
}

/** Mintlify page id `docs/a/b` → public path `/a/b`. */
function mintlifyPageToUrlPath(pageId: string): string {
  if (!pageId.startsWith('docs/')) {
    throw new Error(`Unexpected Mintlify page id (expected docs/...): ${pageId}`);
  }
  return `/${pageId.slice('docs/'.length)}`;
}

function collectMdxPageIds(docsRoot: string): Set<string> {
  const docsDir = join(docsRoot, 'docs');
  const pageIds = new Set<string>();

  function walk(dir: string): void {
    for (const entry of readdirSync(dir)) {
      const fullPath = join(dir, entry);
      if (statSync(fullPath).isDirectory()) {
        walk(fullPath);
        continue;
      }
      if (!entry.endsWith('.mdx')) {
        continue;
      }
      const rel = relative(docsDir, fullPath).replace(/\.mdx$/, '').replace(/\\/g, '/');
      pageIds.add(`docs/${rel}`);
    }
  }

  walk(docsDir);
  return pageIds;
}

function collectDocsTextFiles(docsRoot: string): string[] {
  const files: string[] = [];

  function walk(dir: string): void {
    for (const entry of readdirSync(dir)) {
      const fullPath = join(dir, entry);
      if (statSync(fullPath).isDirectory()) {
        walk(fullPath);
        continue;
      }
      const ext = entry.includes('.') ? entry.slice(entry.lastIndexOf('.')) : '';
      if (DOCS_SCAN_EXTENSIONS.has(ext)) {
        files.push(fullPath);
      }
    }
  }

  walk(docsRoot);
  return files;
}

/** Zero-tolerance English prose gate for critical localized marketing MDX. */
const ZH_ENGLISH_SENTENCE =
  /\b(the|is|are|was|were|with|for|and|users|when|while|if you|this |that |from |offers|provides|implements|beyond |based on|myrm's|hermes'|don't|doesn't|can't|won't|honest scope|honest limits|what you get|key architectural|leader-worker|instant reply|visual agent|what mavis|migration wins)\b/i;

const KO_ENGLISH_SENTENCE =
  /\b(the|is|are|was|were|with|for|and|users|when|while|if you|this |that |from |offers|provides|implements|beyond |based on|myrm's|hermes'|don't|doesn't|can't|won't|honest scope|honest limits|what you get|key architectural|leader-worker|instant reply|visual agent|what mavis|migration wins)\b/i;

const ZH_CONTENT_ZERO_TOLERANCE = new Set([
  'docs/zh/getting-started/competitor-comparison.mdx',
]);

const KO_CONTENT_ZERO_TOLERANCE = new Set([
  'docs/ko/getting-started/competitor-comparison.mdx',
]);

function scanLocalizedEnglishProse(
  docsRoot: string,
  localeDir: string,
  zeroTolerance: Set<string>,
  englishPattern: RegExp,
  label: string,
  errors: string[],
): void {
  const localizedDir = join(docsRoot, 'docs', localeDir);
  if (!existsSync(localizedDir)) {
    return;
  }

  function walk(dir: string): void {
    for (const entry of readdirSync(dir)) {
      const fullPath = join(dir, entry);
      if (statSync(fullPath).isDirectory()) {
        walk(fullPath);
        continue;
      }
      if (!entry.endsWith('.mdx')) {
        continue;
      }
      const rel = relative(join(docsRoot, 'docs'), fullPath).replace(/\\/g, '/');
      if (!zeroTolerance.has(rel)) {
        continue;
      }
      const lines = readFileSync(fullPath, 'utf8').split('\n');
      for (let i = 0; i < lines.length; i++) {
        const line = lines[i] ?? '';
        const trimmed = line.trim();
        if (
          !trimmed ||
          trimmed.startsWith('|') ||
          trimmed.startsWith('---') ||
          trimmed.startsWith(':::') ||
          trimmed.startsWith('title:') ||
          trimmed.startsWith('description:') ||
          trimmed.startsWith('#') ||
          trimmed.startsWith('```')
        ) {
          continue;
        }
        const alpha = [...line].filter((c) => /[A-Za-z]/.test(c)).length;
        if (alpha < 12) {
          continue;
        }
        if (englishPattern.test(line)) {
          errors.push(`${label} English prose in ${rel}:${i + 1}: ${trimmed.slice(0, 80)}`);
        }
      }
    }
  }

  walk(localizedDir);
}

function scanZhEnglishProse(docsRoot: string, errors: string[]): void {
  scanLocalizedEnglishProse(
    docsRoot,
    'zh',
    ZH_CONTENT_ZERO_TOLERANCE,
    ZH_ENGLISH_SENTENCE,
    'Zh',
    errors,
  );
}

function scanKoEnglishProse(docsRoot: string, errors: string[]): void {
  scanLocalizedEnglishProse(
    docsRoot,
    'ko',
    KO_CONTENT_ZERO_TOLERANCE,
    KO_ENGLISH_SENTENCE,
    'Ko',
    errors,
  );
}

function scanLegacyUrls(docsRoot: string, errors: string[]): void {
  const files = [
    join(docsRoot, 'docs.json'),
    ...collectDocsTextFiles(join(docsRoot, 'docs')),
  ];
  for (const filePath of files) {
    if (!existsSync(filePath)) {
      continue;
    }
    const rel = relative(docsRoot, filePath).replace(/\\/g, '/');
    const content = readFileSync(filePath, 'utf8');
    appendLegacyUrlViolations(content, `myrm-docs/${rel}`, errors);
  }
}

function main(): void {
  const doc = JSON.parse(readFileSync(DOCS_JSON, 'utf8')) as DocsJson;
  const mintlifyPages = collectMintlifyPages(doc);
  const urlPathToPageId = new Map<string, string>();
  for (const pageId of mintlifyPages) {
    urlPathToPageId.set(mintlifyPageToUrlPath(pageId), pageId);
  }

  const errors: string[] = [];

  const marketingLocales: DocsLocale[] = ['en', 'zh', 'ko'];
  for (const locale of marketingLocales) {
    for (const marketingPath of MARKETING_DOC_PATHS) {
      const urlPath = localizedDocsPath(marketingPath, locale);
      const pageId = urlPathToPageId.get(urlPath);
      if (!pageId) {
        errors.push(
          `Marketing path ${urlPath} (${locale}) is not listed in myrm-docs/docs.json`,
        );
        continue;
      }
      const mdxPath = join(DOCS_ROOT, `${pageId}.mdx`);
      if (!existsSync(mdxPath)) {
        errors.push(`Missing MDX file for ${pageId}: ${mdxPath}`);
      }
    }
  }

  const diskPageIds = collectMdxPageIds(DOCS_ROOT);
  for (const pageId of diskPageIds) {
    if (!mintlifyPages.has(pageId)) {
      errors.push(`Orphan MDX (on disk but not in docs.json navigation): ${pageId}`);
    }
  }

  scanLegacyUrls(DOCS_ROOT, errors);
  scanZhEnglishProse(DOCS_ROOT, errors);
  scanKoEnglishProse(DOCS_ROOT, errors);

  if (errors.length > 0) {
    console.error('Docs slug contract validation failed:\n' + errors.map((e) => `  - ${e}`).join('\n'));
    process.exit(1);
  }

  const langCount = doc.navigation?.languages?.length ?? 1;
  console.log(
    `Docs slug contract OK (${MARKETING_DOC_PATHS.length} marketing paths × ${langCount} locales, ${mintlifyPages.size} Mintlify pages, ${diskPageIds.size} MDX files)`,
  );
}

main();
