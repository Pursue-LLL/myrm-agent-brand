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
  '但是', '而且', '由于', '对于', '关于', '根据', '为了',
  // 本轮人工复核后确认的「中日同形不同词」：日语对应词为 システム / コア / ユーザー /
  // 重複 / 書く / できない / プロジェクト / 推奨 / 状態 / 製品，因此可作为硬错误。
  '系统', '核心', '用户', '重复', '写在', '做不到', '项目', '推荐', '状态', '的利点',
];


/**
 * 简体专用汉字（这些字形在现代日语里不存在，日文应写作繁体/日字形）：
 * 本轮实战里出现的残留有「款 / 护 / 没 / 这 / 个 / 们 / 时 / 说 / 对 / 后 / 员 / 产 / 务 /
 * 网 / 应 / 图 / 标 / 测 / 试 / 构 / 权 / 类 / 传 / 输 / 据 / 库 / 维 / 认 / 证 / 拦 /
 * 优 / 势 / 竞 / 迁 / 规 / 则 / 杂 / 查 / 页 / 链 / 缓 / 队 / 默 / 闭 / 启 / 暂 / 败 /
 * 广 / 乐 / 卖 / 买 / 脑 / 电 / 车 / 站 / 银 / 钱 / 药 / 检 / 验 / 诊 / 疗 / 专 / 团 /
 * 众 / 达 / 适 / 换 / 头 / 脸 / 鱼 / 马 / 饭 / 菜 / 汤 / 茶 / 酒 / 睡 / 觉 / 醒 / 记 /
 * 录 / 练 / 习 / 译 / 阅 / 读 / 讲 / 座 / 论 / 坛 / 议 / 题 / 词 / 句 / 段 / 章 / 节 /
 * 码 / 号 / 针 / 线 / 布 / 纸 / 笔 / 画 / 曲 / 址 / 频 / 剧 / 场 / 票 / 价 / 币 / 折 / 扣 /
 * 惠 / 赠 / 送 / 购 / 物 / 辆 / 房 / 屋 / 庭 / 院 / 楼 / 层 / 室 / 间 / 厅 / 厨 / 卫 /
 * 浴 / 客 / 卧 / 岛 / 钟 / 锁 / 键 / 钉 / 锈 / 锋 / 镜 / 铸 / 铺 / 释 / 顿 / 颗 / 齐 /
 * 龄 / 严」等。日文里同形的汉字（会 / 与 / 结 / 设 / 计 / 实 / 现 / 执 / 绑 / 环 / 变 /
 * 创 / 删 / 询 / 统 / 视 / 窗 / 压 / 缩 / 扩 / 错 / 误 / 确 / 择 / 开 / 关 / 复 / 简 /
 * 单 / 杂 / 败 / 态 / 状 等）不列入，避免误报。
 */
const SIMPLIFIED_ONLY_CHARS = [
  '个', '这', '说', '时', '对', '没', '们', '员', '产', '务', '网', '应', '图', '标', '测',
  '试', '构', '权', '类', '传', '输', '据', '库', '维', '护', '认', '证', '拦', '优', '势',
  '竞', '迁', '规', '则', '杂', '查', '页', '链', '缓', '队', '默', '闭', '启', '暂', '败',
  '广', '乐', '卖', '买', '脑', '电', '车', '站', '银', '钱', '药', '检', '验', '诊', '疗',
  '专', '团', '众', '达', '适', '换', '头', '脸', '鱼', '马', '饭', '汤',
  '觉', '醒', '记', '录', '练', '习', '译', '阅', '读', '讲', '论', '坛', '议',
  '题', '词', '节', '码', '针', '线', '纸', '笔',
  '址', '频', '剧', '场', '价', '币', '扣', '惠', '赠', '购', '辆',
  '楼', '层', '间', '厅', '厨', '卫', '卧', '岛',
  '钟', '锁', '键', '钉', '锈', '锋', '镜', '铸', '铺', '释', '顿', '颗', '齐', '龄', '严',
  '款', '伤', '让', '请', '让', '给', '让', '并', '让', '过', '还', '让', '让',
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
    const prose = text.replace(/```[\s\S]*?```/g).replace(/`[^`\n]*`/g);

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
    // 简体专用汉字：日文里不存在这些字形，出现即残留
    for (const ch of SIMPLIFIED_ONLY_CHARS) {
      if (prose.includes(ch)) {
        errors.push(`${rel}: 简体汉字残留 → 「${ch}」（日文应使用日/繁体字形）`);
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
