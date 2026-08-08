/**
 * Seed docs/ko MDX tree from EN sources with /ko/ internal link rewrites.
 * Run before bulk translate to satisfy navigation/orphan gates quickly.
 */
import { mkdirSync, readFileSync, readdirSync, statSync, writeFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const docsDir = join(root, 'docs');
const koDir = join(docsDir, 'ko');

const LOCALE_SKIP = new Set(['zh', 'ko']);
const LINK_PREFIX = '/ko';

const SECTIONS = [
  'getting-started',
  'core-concepts',
  'guides',
  'tutorials',
  'api-reference',
  'contributing',
  'self-hosting',
] as const;

function rewriteLinks(content: string): string {
  let next = content;
  for (const section of SECTIONS) {
    const from = `/${section}`;
    const to = `${LINK_PREFIX}${from}`;
    next = next.replaceAll(`](${from}`, `](${to}`);
    next = next.replaceAll(`href="${from}`, `href="${to}`);
  }
  return next;
}

function walkEnMdx(dir: string): string[] {
  const files: string[] = [];
  for (const entry of readdirSync(dir)) {
    const fullPath = join(dir, entry);
    if (statSync(fullPath).isDirectory()) {
      if (LOCALE_SKIP.has(entry)) continue;
      files.push(...walkEnMdx(fullPath));
      continue;
    }
    if (entry.endsWith('.mdx')) {
      files.push(fullPath);
    }
  }
  return files;
}

function main(): void {
  const enFiles = walkEnMdx(docsDir);
  for (const src of enFiles) {
    const rel = src.slice(docsDir.length + 1);
    const dest = join(koDir, rel);
    mkdirSync(dirname(dest), { recursive: true });
    const raw = readFileSync(src, 'utf8');
    writeFileSync(dest, rewriteLinks(raw), 'utf8');
  }
  console.log(`Seeded ${enFiles.length} ko MDX files from EN (link prefixes → ${LINK_PREFIX}/)`);
}

main();
