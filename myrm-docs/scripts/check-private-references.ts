/**
 * [INPUT]
 * - 品牌仓里所有被 git 跟踪的文本文件（git grep）
 *
 * [OUTPUT]
 * - 私有引用门禁：文档与站点文案里不得出现只在私有开发环境才能解析的名字
 *
 * [POS]
 * 品牌仓 PR 守门。读者打不开私有规划目录、内部素材文件和规划条目编号，写进文档只会留下死引用，
 * 条目编号还会暴露内部路线图的规模与进度；公共代码仓有同类门禁
 * （myrm-agent-server/tests/architecture/test_no_private_references.py）。
 * 匹配串由片段拼接，脚本和测试才不会命中自己。
 */
import { join } from 'node:path';

const REPO_ROOT = join(import.meta.dir, '..', '..');
const MAX_REPORTED_HITS = 20;

const PLANNING_DIR = 'temp-' + 'docs';
const MATERIALS_FILE = '_ADVANT' + 'AGE\\.md';
// 条目编号两侧用显式的非单词边界而不是 \b，贴着中日韩文字的编号也能命中；下划线开头的会话键和更长的数字串不算。
const ITEM_ID = '(^|[^A-Za-z0-9_])topic' + '_[0-9]{2}([^0-9]|$)';

export const PRIVATE_REFERENCE_PATTERN = `${PLANNING_DIR}|${MATERIALS_FILE}|${ITEM_ID}`;

/** 返回 `路径:行号:文本` 形式的命中行；git grep 退出码 1 表示没有命中。 */
export function findPrivateReferences(cwd: string = REPO_ROOT, pathspec: string[] = ['--', '.']): string[] {
  const result = Bun.spawnSync(['git', 'grep', '-I', '-n', '-i', '-E', '-e', PRIVATE_REFERENCE_PATTERN, ...pathspec], {
    cwd,
  });
  if (result.exitCode !== 0 && result.exitCode !== 1) {
    throw new Error(`git grep failed with status ${result.exitCode}: ${result.stderr.toString().trim()}`);
  }
  return result.stdout.toString().split('\n').filter(Boolean);
}

function main(): void {
  const hits = findPrivateReferences();
  if (hits.length === 0) {
    console.info('Private reference check OK');
    return;
  }
  const shown = hits.slice(0, MAX_REPORTED_HITS).map((row) => row.slice(0, 200));
  if (hits.length > MAX_REPORTED_HITS) shown.push(`... and ${hits.length - MAX_REPORTED_HITS} more`);
  console.error(
    'Tracked files reference names that only resolve in the private dev environment (planning directory, ' +
      'internal material files, planning item ids). Describe the fact in public wording instead.\n' +
      shown.join('\n'),
  );
  process.exit(1);
}

if (import.meta.main) main();
