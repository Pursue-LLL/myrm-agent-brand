/**
 * [INPUT]
 * - myrm-docs/docs/ko/**\/*.mdx（韩语本地化文档页）
 *
 * [OUTPUT]
 * - CI 校验：韩语正文里不得混入成段中文；输出疑似残留清单（警告）与未登记残留（错误）
 *
 * [POS]
 * 韩语质检守卫。日语与韩语都大量借用汉字，靠「是否出现在词表」判断不可靠，因此本脚本
 * 只把**成段连续的中文**（≥2 个汉字）视为硬错误，其余（单个汉字、明确登记的产品名 /
 * 代码字面量 / 双语对照标签）放进白名单或仅作警告。白名单每一条都必须写清「为什么合法」，
 * 防止白名单变成藏污纳垢的垃圾桶。
 *
 * 背景：一次抽查发现 ko 落地的竞品对比页仍留着中文的「待分析」，架构总览页把
 * 「可追溯性 / 可靠性」当括号注音——韩语读者读到的是一段没有意义的汉字。
 */
import { readFileSync, readdirSync, statSync } from 'node:fs';
import { join, relative } from 'node:path';
import { fileURLToPath } from 'node:url';

const DOCS_ROOT = join(fileURLToPath(new URL('.', import.meta.url)), '..');
const KO_ROOT = join(DOCS_ROOT, 'docs', 'ko');

/** 成段中文（≥2 个汉字）才算残留；单字多为专名或排版残留，列为警告。 */
const CJK_RUN_RE = /[\u4e00-\u9fff]{2,}/g;
const CJK_SINGLE_RE = /[\u4e00-\u9fff]/g;

/** 合法中文白名单：每条都必须是「代码字面量 / 产品名 / 双语对照 / 提示注入样例」。 */
const KO_ALLOWED = new Set<string>([
  '忽略之前的指令', // security-architecture：提示注入检测样例（与代码同源）
  '删除', '移除', '付款', '购买', '注销', '关闭账号', '管理', '权限', '发布', '发表', '分享', '发送', '密码', '信用卡', // security-architecture：与代码同源的触发词双语对照
  '代码', '社区', '财经', // browser-automation：分类标签的中英对照
  '转发', '轉發', // multi-channel：邮件主题前缀字面量（Fwd:/FW:/转发:/轉發:）
  '官方', '媒体', '个人', // web-search-and-fetch：authority_description 的接口枚举值
  '中文', '日本語', '繁體', // memory-plugin-agent-plugins：语言清单
  '微信公众号', // wechat-official-publishing：产品名
  '花生壳', // tunnel：产品名
  '云效', // multi-channel：产品名
  '雪球', // memory-system：公司名
]);

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
  const files = collectMdx(KO_ROOT);
  const errors: string[] = [];
  const warnings: string[] = [];

  for (const file of files) {
    const rel = relative(DOCS_ROOT, file);
    const text = readFileSync(file, 'utf8');
    const prose = text.replace(/```[\s\S]*?```/g).replace(/`[^`\n]*`/g);

    for (const m of prose.matchAll(CJK_RUN_RE)) {
      if (KO_ALLOWED.has(m[0])) continue;
      errors.push(`${rel}: 中文残留 → ${JSON.stringify(m[0])}`);
    }
    // 单字告警：白名单成词里的字不再单独告警（它们已随成词被登记）
    const allowedChars = new Set(Array.from(KO_ALLOWED).join('').split(''));
    for (const m of prose.matchAll(CJK_SINGLE_RE)) {
      const ch = m[0];
      if (allowedChars.has(ch)) continue;
      warnings.push(`${rel}: 单个汉字「${ch}」（人工复核）`);
    }
  }

  if (warnings.length) {
    console.log(`[warn] ${warnings.length} 条单字残留（人工复核）:`);
    for (const w of warnings.slice(0, 20)) console.log(`  ${w}`);
  }

  if (errors.length) {
    console.error(`[error] ko 译文残留检查失败，共 ${errors.length} 条:`);
    for (const e of errors.slice(0, 80)) console.error(`  ${e}`);
    process.exit(1);
  }

  console.log(`KO translation residue check OK (${files.length} mdx, ${warnings.length} soft warnings)`);
}

main();
