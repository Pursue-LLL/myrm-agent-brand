/**
 * Ensures marketing doc links match Mintlify pages and on-disk MDX files.
 * Also fails when an MDX file exists but is not listed in docs.json navigation.
 */
import { readFileSync, existsSync, readdirSync, statSync } from 'node:fs';
import { join, dirname, relative } from 'node:path';
import { fileURLToPath } from 'node:url';
import { MARKETING_DOC_PATHS } from '../src/lib/docs-contract';

const SCRIPT_DIR = dirname(fileURLToPath(import.meta.url));
const WEBSITE_ROOT = join(SCRIPT_DIR, '..');
const BRAND_ROOT = join(WEBSITE_ROOT, '..');
const DOCS_ROOT = join(BRAND_ROOT, 'myrm-docs');
const DOCS_JSON = join(DOCS_ROOT, 'docs.json');

type DocsJson = {
  navigation?: {
    tabs?: Array<{
      groups?: Array<{ pages?: string[] }>;
    }>;
  };
};

function collectMintlifyPages(doc: DocsJson): Set<string> {
  const pages = new Set<string>();
  for (const tab of doc.navigation?.tabs ?? []) {
    for (const group of tab.groups ?? []) {
      for (const page of group.pages ?? []) {
        pages.add(page);
      }
    }
  }
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

function main(): void {
  const doc = JSON.parse(readFileSync(DOCS_JSON, 'utf8')) as DocsJson;
  const mintlifyPages = collectMintlifyPages(doc);
  const urlPathToPageId = new Map<string, string>();
  for (const pageId of mintlifyPages) {
    urlPathToPageId.set(mintlifyPageToUrlPath(pageId), pageId);
  }

  const errors: string[] = [];

  for (const marketingPath of MARKETING_DOC_PATHS) {
    const pageId = urlPathToPageId.get(marketingPath);
    if (!pageId) {
      errors.push(`Marketing path ${marketingPath} is not listed in myrm-docs/docs.json`);
      continue;
    }
    const mdxPath = join(DOCS_ROOT, `${pageId}.mdx`);
    if (!existsSync(mdxPath)) {
      errors.push(`Missing MDX file for ${pageId}: ${mdxPath}`);
    }
  }

  const diskPageIds = collectMdxPageIds(DOCS_ROOT);
  for (const pageId of diskPageIds) {
    if (!mintlifyPages.has(pageId)) {
      errors.push(`Orphan MDX (on disk but not in docs.json navigation): ${pageId}`);
    }
  }

  if (errors.length > 0) {
    console.error('Docs slug contract validation failed:\n' + errors.map((e) => `  - ${e}`).join('\n'));
    process.exit(1);
  }

  console.log(
    `Docs slug contract OK (${MARKETING_DOC_PATHS.length} marketing paths, ${mintlifyPages.size} Mintlify pages, ${diskPageIds.size} MDX files)`,
  );
}

main();
