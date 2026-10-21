/**
 * [INPUT]
 * - myrm-docs/docs/ja 配下のすべての mdx ファイル（日本語ロケールの日译页面）
 *
 * [OUTPUT]
 * - CI 校验：ja 译文中不得混入韩文与非日语汉字碎片；输出疑似残留清单（警告）与韩文（错误）
 *
 * [POS]
 * 日译质检守卫。日文与中文共享大量汉字，靠「是否出现在词表」判断不可靠，因此本脚本
 * 只把**韩文音节**（가-힣）与**中文专有虚词/结构词**（我们 / 这个 / 一个 / 从而 …）视为
 * 硬错误，其余候选（例如「用户」「数据」这类中日共用词）仅作为警告列出，由人复核。
 * 该守卫的直接来源：一次日译里混入了韩文碎片（`3 種類の)に会遇到입니다`）与中文残留
 * （`技能マーケット`），而首轮扫描词表没覆盖韩文区间，导致漏检。
 */
import { readFileSync, readdirSync, statSync } from 'node:fs';
import { join, relative } from 'node:path';
import { fileURLToPath } from 'node:url';

const DOCS_ROOT = join(fileURLToPath(new URL('.', import.meta.url)), '..');
const JA_ROOT = join(DOCS_ROOT, 'docs', 'ja');

/** 韩文音节：ja 页面里出现即错误。 */
const HANGUL_RE = /[가-힣ᄀ-ᇿ㄰-㆏]+/g;

/** 中文专有虚词与结构词：中日不通用，视为硬错误。 */
const CN_HARD = [
  '我们', '你们', '他们', '这个', '那个', '一个', '一些', '什么', '怎么', '为什么',
  '从而', '因此', '并且', '以及', '来自', '之类', '等等', '通过', '进行', '已经',
  '无法', '必须', '能够', '应该', '或者', '然后', '这样', '那么', '这里',
  '那里', '不是', '的话', '这些', '那些', '之后', '如果', '因为', '所以',
  '但是', '而且', '我们', '由于', '对于', '关于', '根据', '由于', '为了', '可以',
];

/** 中日共用或日语中也常用的词：仅警告，由人复核。 */
const CN_SOFT = [
  '的', '了', '们', '个', '这', '为', '与', '或', '在', '是', '有', '和',
  '使用', '更新', '提供', '支持', '需要', '可以', '功能', '数据', '文件', '用户',
  '设置', '目录', '内容', '网络', '服务', '系统', '配置', '测试', '安装', '运行',
  '点击', '打开', '语言', '文档', '技能', '全部', '其他', '不会', '智能体', '渠道',
];

function collectMdx(dir: string, out: string[] = []): string[] {
  for (const entry of readdirSync(dir)) {
    const full = join(dir, entry);
    if (statSync(full).isDirectory()) {
      collectMdx(full, out);
    } else if (entry.endsWith('.mdx')) {
      out.push(full);
    }
  }
  return out;
}

function main(): void {
  const files = collectMdx(JA_ROOT);
  const errors: string[] = [];
  const warnings: string[] = [];

  for (const file of files) {
    const rel = relative(DOCS_ROOT, file);
    const text = readFileSync(file, 'utf8');
    // 代码块与内联代码不参与检查（可能含英文标识符或示例）
    const prose = text.replace(/```[\s\S]*?```/g, '').replace(/`[^`\n]*`/g, '');

    for (const m of prose.matchAll(HANGUL_RE)) {
      // 「한국어」是支持语言列表里的语言名，属合法用法
      if (m[0] === '한국어') continue;
      errors.push(`${rel}: 韩文残留 → ${JSON.stringify(m[0])}`);
    }
    for (const word of CN_HARD) {
      let idx = prose.indexOf(word);
      while (idx >= 0) {
        errors.push(`${rel}: 中文残留 → ${word}（${prose.slice(Math.max(0, idx - 12), idx + word.length + 12).replace(/\n/g, ' ')}）`);
        idx = prose.indexOf(word, idx + word.length);
        if (errors.length > 200) break;
      }
    }
    for (const word of CN_SOFT) {
      const count = (prose.match(new RegExp(word, 'g')) ?? []).length;
      if (count > 0) warnings.push(`${rel}: 共用词「${word}」出现 ${count} 次（人工复核）`);
    }
  }

  if (warnings.length) {
    console.log(`[warn] ${warnings.length} 条中日共用词提示（需人工复核）:`);
    for (const w of warnings.slice(0, 40)) console.log(`  ${w}`);
  }

  if (errors.length) {
    console.error(`[error] ja 译文残留检查失败，共 ${errors.length} 条:`);
    for (const e of errors.slice(0, 80)) console.error(`  ${e}`);
    process.exit(1);
  }

  console.log(`JA translation residue check OK (${files.length} mdx, ${warnings.length} soft warnings)`);
}

main();
