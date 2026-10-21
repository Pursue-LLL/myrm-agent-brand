/**
 * [INPUT]
 * - myrm-docs/docs/**\/*.mdx（全部语言的文档页）
 * - myrm-agent / myrm-agent-harness 的源码与测试（标识符语料）
 *
 * [OUTPUT]
 * - CI 校验：文档里**我方代码符号**（指标名 / 工具名 / 测试名）必须真实存在于代码或测试中
 *
 * [POS]
 * 符号级守门人。背景：文档站的 statistics 页曾写着 `myrm_policy_denial_total` 这个
 * **并不存在**的 Prometheus 指标，还把 16 条告警规则说成 12 条——读者照着配告警就会落空。
 * 路径级体检（check-docs-links）抓不到这类问题，因为它检查的是链接不是符号。
 *
 * 判定范围刻意收窄到「一定属于我方」的符号形态：
 * - `myrm_*`（我方指标前缀）
 * - `*_tool`（我方工具命名）
 * - `test_*`（我方测试命名）
 * 其余反引号符号（第三方库名、竞品参数、协议字段、英文散文）不纳入判定，避免误报。
 */
import { readFileSync, readdirSync, statSync } from 'node:fs';
import { join, relative } from 'node:path';
import { fileURLToPath } from 'node:url';

const REPO_ROOT = join(fileURLToPath(new URL('.', import.meta.url)), '..', '..', '..');
const DOCS_DIR = join(REPO_ROOT, 'myrm-agent-brand', 'myrm-docs', 'docs');
const CODE_ROOTS = [
  'myrm-agent/myrm-agent-server/app',
  'myrm-agent/myrm-agent-server/tests',
  'myrm-agent/myrm-agent-frontend/src',
  'myrm-agent-harness/src',
  'myrm-agent-harness/tests',
];
const SKIP_DIRS = new Set([
  '.venv', 'site-packages', 'node_modules', '__pycache__', '.git', 'dist', 'build', '.next', '.myrm',
]);

/** 明确豁免：第三方 / 竞品 / 协议侧的同名符号，不属于我方代码。 */
const ALLOW = new Set<string>([]);

function collect(dir: string, out: string[] = []): string[] {
  for (const entry of readdirSync(dir)) {
    const full = join(dir, entry);
    if (SKIP_DIRS.has(entry)) continue;
    if (statSync(full).isDirectory()) collect(full, out);
    else if (entry.endsWith('.mdx')) out.push(full);
  }
  return out;
}

function collectCode(dir: string, ids: Set<string>): void {
  for (const entry of readdirSync(dir)) {
    const full = join(dir, entry);
    if (SKIP_DIRS.has(entry)) continue;
    if (statSync(full).isDirectory()) {
      collectCode(full, ids);
    } else if (/\.(py|ts|tsx)$/.test(entry)) {
      const text = readFileSync(full, 'utf8');
      for (const m of text.matchAll(/[A-Za-z_][A-Za-z0-9_]{4,}/g)) ids.add(m[0]);
      ids.add(entry.replace(/\.[^.]+$/, ''));
    }
  }
}

const SYMBOL_RE = /`((?:myrm_[a-z0-9_]+)|(?:[a-z0-9]+_tool)|(?:test_[a-z0-9_]+))`/g;

function main(): void {
  const ids = new Set<string>();
  for (const root of CODE_ROOTS) {
    const dir = join(REPO_ROOT, root);
    try {
      collectCode(dir, ids);
    } catch {
      /* 目录不存在时跳过 */
    }
  }

  const errors: string[] = [];
  let checked = 0;

  for (const file of collect(DOCS_DIR)) {
    const rel = relative(REPO_ROOT, file);
    const text = readFileSync(file, 'utf8');
    for (const m of text.matchAll(SYMBOL_RE)) {
      const symbol = m[1];
      checked += 1;
      if (ALLOW.has(symbol)) continue;
      let resolved = false;
      for (const id of ids) {
        if (id === symbol || id.startsWith(symbol)) {
          resolved = true;
          break;
        }
      }
      if (!resolved) errors.push(`${rel}: 文档引用的我方符号在代码中不存在 → ${symbol}`);
    }
  }

  if (errors.length) {
    console.error(`[error] 文档符号校验失败，共 ${errors.length} 条:`);
    for (const e of errors) console.error(`  ${e}`);
    process.exit(1);
  }
  console.log(`Docs symbol check OK (${checked} symbol references)`);
}

main();
