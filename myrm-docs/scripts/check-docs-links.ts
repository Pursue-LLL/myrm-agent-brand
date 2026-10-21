/**
 * [INPUT]
 * - myrm-docs/docs/**\/*.mdx（全部语言的文档页）
 *
 * [OUTPUT]
 * - CI 校验：文档内部链接必须能落到真实页面；ja 页面允许回退到同路径的英语页（但必须显式标注「英語」）
 *
 * [POS]
 * 文档站链接守门人。背景：ja 文档站长期只有少量页面，日译页里大量指向尚未翻译的 ja 路径，
 * 读者点进去就是 404（一次性就查出了 24 处）。本脚本做两件事：
 * ① 任意语言页面里的站内链接必须解析到某个真实页面；
 * ② ja 页面若指向尚未存在的 ja 路径，必须已经回退到英语路径并在链接文字上标注「英語」，
 *     避免「看起来是日文链接、点进去却是英文页」这种无提示的降级。
 */
import { readFileSync, readdirSync, statSync, existsSync } from 'node:fs';
import { join, relative } from 'node:path';
import { fileURLToPath } from 'node:url';

const DOCS_ROOT = join(fileURLToPath(new URL('.', import.meta.url)), '..');
const DOCS_DIR = join(DOCS_ROOT, 'docs');

function collectMdx(dir: string, out: string[] = []): string[] {
  for (const entry of readdirSync(dir)) {
    const full = join(dir, entry);
    if (statSync(full).isDirectory()) collectMdx(full, out);
    else if (entry.endsWith('.mdx')) out.push(full);
  }
  return out;
}

/** 页面 URL 集合（不含语言前缀的本地页 + 各语言前缀页）。 */
function pageIds(): Set<string> {
  const ids = new Set<string>();
  for (const file of collectMdx(DOCS_DIR)) {
    ids.add('/' + relative(DOCS_DIR, file).replace(/\.mdx$/, ''));
  }
  return ids;
}

const LINK_RE = /\]\(([^)\s#]+)\)/g;

function main(): void {
  const ids = pageIds();
  const errors: string[] = [];
  let checked = 0;

  for (const file of collectMdx(DOCS_DIR)) {
    const rel = relative(DOCS_ROOT, file);
    const text = readFileSync(file, 'utf8');
    const isJa = rel.startsWith('docs/ja/');
    for (const m of text.matchAll(LINK_RE)) {
      const href = m[1];
      if (!href.startsWith('/')) continue;
      checked += 1;
      const target = href.replace(/\/$/, '');
      if (ids.has(target)) continue;
      if (isJa && target.startsWith('/ja/')) {
        // ja 路径尚不存在：必须已回退到英语路径（由链接文字上的「英語」标注）
        const en = target.slice(3);
        if (ids.has(en) && text.includes(`${href.slice(4)}（英語）`)) continue;
        errors.push(`${rel}: ja 链接未回退或未标注「英語」→ ${href}`);
        continue;
      }
      errors.push(`${rel}: 站内链接无对应页面 → ${href}`);
    }
  }

  if (errors.length) {
    console.error(`[error] 文档链接校验失败，共 ${errors.length} 条:`);
    for (const e of errors) console.error(`  ${e}`);
    process.exit(1);
  }
  console.log(`Docs link check OK (${ids.size} pages, ${checked} internal links)`);
}

main();
