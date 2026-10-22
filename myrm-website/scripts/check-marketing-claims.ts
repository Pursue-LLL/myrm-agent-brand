/**
 * [INPUT]
 * - myrm-website/locales/{zh,en,ko}.json（落地页对比表与轮播磁贴）
 * - myrm-agent / myrm-agent-harness 仓库内的代码锚点（数量型宣称的 SSOT）
 *
 * [OUTPUT]
 * - CI 校验：官网上的**数量型宣称**必须与代码 SSOT 一致；轮播磁贴不得出现
 *   「100%」这类读起来像统计结论的绝对表述；官网不得出现未交付能力的宣称
 *
 * [POS]
 * 营销数字守门人。背景：一次日译/改写里先后出现过「内置智能体 25 vs 代码 28」、
 * 「技能模式 113 vs 文档 108」、「IoT 桥能力根本不存在」等漂移。人工核对无法防止复发，
 * 因此把「数量 → 代码锚点 → 期望值」写成注册表，由本脚本在 CI 里持续断言：
 * ① 锚点文件里仍能找到期望值（防止注册表自己过期）；② 三语官网的对应数字与期望值一致；
 * ③ 轮播没有 100% 磁贴；④ 官网不含未交付能力词。
 */
import { readFileSync, existsSync, readdirSync, statSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';

const REPO_ROOT = join(fileURLToPath(new URL('.', import.meta.url)), '..', '..', '..');
const WEBSITE_ROOT = join(REPO_ROOT, 'myrm-agent-brand', 'myrm-website');

/** 数量型宣称注册表：概念 → 代码锚点（相对仓库根）→ 期望值 → 锚点里必须出现的字面量。 */
const COUNT_CLAIMS = [
  {
    id: 'builtinAgents',
    anchor: 'myrm-agent/myrm-agent-server/app/services/agent/builtin_agent_specs.py',
    expect: 28,
    literal: '28 built-in agent specs',
    slide: 'i18nLocalization',
    locales: {
      zh: [/(\d+)\s*个内置智能体/, /(\d+)×6/],
      en: [/(\d+)\s*built-in agents/, /(\d+)×6/],
      ko: [/(\d+)×6/],
    },
  },
  {
    id: 'channels',
    anchor: 'myrm-agent/myrm-agent-server/app/channels/providers/registry.py',
    expect: 26,
    literal: null, // 数量由注册项计数得到，见 countMatches
    countPattern: /^\s{4}"([a-z_]+)":\s*ChannelSpec\(/gm,
    locales: { zh: [/(\d+)\s*(?:个)?渠道/], en: [/(\d+)\s*(?:IM )?channels/], ko: [/(\d+)\s*채널/] },
  },
  {
    id: 'skillPatterns',
    anchor: 'myrm-agent-harness/src/myrm_agent_harness/backends/skills/scanning/patterns.py',
    expect: 113,
    literal: '113 patterns',
    locales: { zh: [/(\d+)\s*条模式/], en: [/(\d+)\s*patterns/], ko: [/(\d+)\s*개 패턴/] },
  },
  {
    id: 'skillHighRisk',
    anchor: 'myrm-agent-harness/src/myrm_agent_harness/backends/skills/scanning/patterns.py',
    expect: 94,
    literal: null,
    countPattern: /ScanSeverity\.(CRITICAL|HIGH)/g,
    locales: { zh: [/(\d+)\s*条为 CRITICAL\/HIGH/], en: [/(\d+)\s*CRITICAL\/HIGH/], ko: [/(\d+)\s*개 CRITICAL\/HIGH/] },
  },
  {
    id: 'evalBenchmarkTasks',
    anchor: 'myrm-agent/myrm-agent-server/app/core/eval/wb_bench/download.py',
    expect: 260,
    literal: null,
    slide: 'evalLab',
    sumPattern: /task_count\s*=\s*(\d+)/g,
    locales: { zh: [/(\d+)\s*(?:个)?(?:真实)?基准任务/], en: [/(\d+)\s*(?:real )?benchmark tasks/], ko: [] },
  },
  {
    id: 'connectorDoctorCodes',
    anchor: 'myrm-agent/myrm-agent-server/app/services/connect/doctor_check.py',
    expect: 9,
    literal: null,
    countPattern: /^DOCTOR_[A-Z_]+ = /gm,
    locales: { zh: [/(\d+)\s*种机器可读诊断码/], en: [/(\d+)\s*machine-readable diagnosis codes/], ko: [/(\d+)\s*가지 기계 판독 진단 코드/] },
  },
  {
    id: 'humanizeModes',
    anchor: 'myrm-agent-harness/src/myrm_agent_harness/toolkits/browser/pool/config.py',
    expect: 3,
    literal: null,
    slide: 'humanizedBrowsing',
    countPattern: /^\s{4}(FAST|DEFAULT|CAREFUL) = /gm,
    locales: { zh: [/(\d+)\s*档拟人化等级/], en: [/(\d+)\s*humanization levels/], ko: [] },
  },
  {
    id: 'lifecycleHooks',
    anchor: 'myrm-agent-harness/src/myrm_agent_harness/core/hooks/types.py',
    expect: 13,
    literal: null,
    countPattern: /^\s{4}([A-Z_]+)\s*=\s*"([a-z_]+)"$/gm,
    slide: 'functionHooks',
    locales: { zh: [/(\d+)\+?\s*生命周期钩点/], en: [/(\d+)\+?\s*lifecycle hooks/], ko: [] },
  },
  {
    id: 'sandboxPeekBandwidth',
    anchor: 'temp-docs/materials/BROWSER_AUTOMATION_ADVANTAGE.md',
    expect: 90,
    literal: '带宽消耗较纯 VNC 骤降 90%',
    slide: 'agentSandbox',
    slideOnlyIf: '%',
    locales: { zh: [], en: [], ko: [] },
  },
  {
    id: 'subagentTokenSaving',
    anchor: 'temp-docs/materials/SUBAGENT_AND_ORCHESTRATION_ADVANTAGE.md',
    expect: 85,
    literal: '节省 85%+ Token',
    slide: 'multiAgent',
    slideOnlyIf: '%',
    locales: { zh: [], en: [], ko: [] },
  },
  {
    id: 'adversarialDefectMiss',
    anchor: 'temp-docs/materials/SUBAGENT_AND_ORCHESTRATION_ADVANTAGE.md',
    expect: 70,
    literal: '隐蔽缺陷漏检率直接降低',
    slide: 'asyncReview',
    slideOnlyIf: '%',
    locales: { zh: [], en: [], ko: [] },
  },
  {
    id: 'artifactPreviewTypes',
    anchor: 'myrm-agent/myrm-agent-frontend/src/components/features/artifacts/renderers',
    expect: 11,
    literal: null,
    dirCount: { exclude: ['_ARCH.md', '__tests__', 'SkeletonLoader.tsx', 'NoPreview.tsx'] },
    slide: 'filePreview',
    locales: { zh: [], en: [], ko: [] },
  },
  {
    id: 'officeWriteAuditSignals',
    anchor:
      'myrm-agent-harness/src/myrm_agent_harness/agent/meta_tools/file_ops/validators/office_bash_audit.py',
    expect: 6,
    literal: null,
    countPattern: /warnings\.(append|extend)\(/g,
    slide: 'officeFidelity',
    locales: { zh: [/(\d+)\s*类写后体检信号/], en: [/(\d+)\s*post-write check signals/], ko: [] },
  },
  {
    id: 'mermaidDslKinds',
    anchor: 'myrm-agent/myrm-agent-frontend/src/components/features/artifacts/renderers/architecture/ArchitecturePreview.tsx',
    expect: 4,
    literal: null,
    countPattern: /content\.includes\('(graph |flowchart |sequenceDiagram|classDiagram)'\)/g,
    slide: 'richRendering',
    locales: { zh: [/(\d+)\s*类 DSL/], en: [/(\d+)\s*DSL kinds/], ko: [] },
  },
] as const;

/** 轮播磁贴不得出现的绝对表述。 */
const FORBIDDEN_STATS = ['100%'];

/**
 * 归属拔高词：把**我方内部对照实验**说成竞品实测。真实案例：600 条语料 0 命中是
 * 我方旧版 legacy 通道的对照（materials/MEMORY_ADVANTAGE.md:502,519），官网曾写成
 * 「竞品式通道」，读者会误以为是竞品数据。
 */
const MISATTRIBUTED_PHRASES = ['竞品式通道', 'capped channel matched'];

/** 未交付能力词：出现即说明官网把路线图当现货宣传。 */
const UNDELIVERED_WORDS = [
  '外设状态总线', 'Peripheral State Bus', '开放 Vault', '热词', 'YoooClaw', '无损迁移',
  '环回内录', 'mDNS', 'UPnP',
];

/**
 * ko 落地域名里只允许出现「品牌专名」里的汉字，其余一律视为漏翻的中文。
 * 背景：ko 落地的 `marketing.integrations.toolsList` 有 40 多项仍是中文原文，
 * 韩国访客在官网上直接看到一整段中文工具清单——这不是排版问题，是漏翻。
 */
const KO_ALLOWED_CJK = new Set(['雪', '球']);
const CJK_RE = /[\u4e00-\u9fff]+/g;

function readLocale(loc: string): Record<string, unknown> {
  return JSON.parse(readFileSync(join(WEBSITE_ROOT, 'locales', `${loc}.json`), 'utf8'));
}

function countMatches(text: string, pattern: RegExp): number {
  const re = new RegExp(pattern.source, pattern.flags.includes('g') ? pattern.flags : `${pattern.flags}g`);
  return [...text.matchAll(re)].length;
}

function main(): void {
  const errors: string[] = [];
  const locales = { zh: readLocale('zh'), en: readLocale('en'), ko: readLocale('ko') } as Record<string, Record<string, unknown>>;

  for (const claim of COUNT_CLAIMS) {
    const anchorPath = join(REPO_ROOT, claim.anchor);
    if (!existsSync(anchorPath)) {
      errors.push(`[${claim.id}] 锚点文件不存在: ${claim.anchor}`);
      continue;
    }
    // 目录型锚点没有正文可读，跳过正文校验（由 dirCount 分支负责）
    const anchorText = statSync(anchorPath).isDirectory() ? '' : readFileSync(anchorPath, 'utf8');

    // ① 锚点仍能复现期望值（注册表自身不能过期）
    if ('literal' in claim && claim.literal) {
      if (!anchorText.includes(claim.literal)) {
        errors.push(`[${claim.id}] 锚点里找不到 ${claim.literal}（期望值 ${claim.expect} 可能已过期）: ${claim.anchor}`);
        continue;
      }
    }
    if ('sumPattern' in claim && claim.sumPattern) {
      const re = new RegExp(claim.sumPattern.source, 'g');
      const total = [...anchorText.matchAll(re)].reduce((acc, m) => acc + Number(m[1]), 0);
      if (total !== claim.expect) {
        errors.push(`[${claim.id}] 锚点求和 ${total} ≠ 期望值 ${claim.expect}: ${claim.anchor}`);
        continue;
      }
    }
    if ('dirCount' in claim && claim.dirCount) {
      const dir = join(REPO_ROOT, claim.anchor);
      const entries = readdirSync(dir).filter((e) => !claim.dirCount.exclude.includes(e));
      if (entries.length !== claim.expect) {
        errors.push(`[${claim.id}] 锚点目录计数 ${entries.length} ≠ 期望值 ${claim.expect}: ${claim.anchor}`);
        continue;
      }
    }
    if ('countPattern' in claim && claim.countPattern) {
      const n = countMatches(anchorText, claim.countPattern);
      if (n !== claim.expect) {
        errors.push(`[${claim.id}] 锚点计数 ${n} ≠ 期望值 ${claim.expect}: ${claim.anchor}`);
        continue;
      }
    }

    // ②a 轮播磁贴 stat 精确匹配（若有声明）
    if ('slide' in claim && claim.slide) {
      for (const [loc, data] of Object.entries(locales)) {
        const slide = (data as any)?.marketing?.highlightsCarousel?.slides?.[claim.slide];
        if (!slide) continue;
        const stat = String(slide.stat ?? '');
        // 部分语言的轮播磁贴是另写的（内容不同），只有形态匹配时才断言
        if ('slideOnlyIf' in claim && claim.slideOnlyIf && !new RegExp(claim.slideOnlyIf).test(stat)) continue;
        const digits = stat.match(/\d+/);
        if (!digits) continue;
        if (Number(digits[0]) !== claim.expect) {
          errors.push(`[${claim.id}] ${loc} 轮播磁贴 ${claim.slide}.stat = ${stat}，与代码 SSOT ${claim.expect} 不一致`);
        }
      }
    }

    // ②b 三语官网正文里出现的对应数字必须与期望值一致
    for (const [loc, patterns] of Object.entries(claim.locales)) {
      const blob = JSON.stringify(locales[loc]);
      for (const pattern of patterns) {
        const m = blob.match(pattern);
        if (!m) continue; // 该语言未出现此宣称，跳过（不是错误）
        const value = Number(m[1]);
        if (value !== claim.expect) {
          errors.push(`[${claim.id}] ${loc} 官网数字 ${value} ≠ 代码 SSOT ${claim.expect}（${pattern.source}）`);
        }
      }
    }
  }

  // ③ 轮播磁贴不得出现 100%
  for (const [loc, data] of Object.entries(locales)) {
    const slides = (data as any)?.marketing?.highlightsCarousel?.slides ?? {};
    for (const [key, slide] of Object.entries(slides as Record<string, { stat?: string }>)) {
      for (const bad of FORBIDDEN_STATS) {
        if (slide?.stat === bad) errors.push(`[stat] ${loc} 轮播磁贴 ${key} 的 stat 仍是 ${bad}，请改为机制表述`);
      }
    }
  }

  // ③b 官网不得把内部对照实验说成竞品实测
  for (const [loc, data] of Object.entries(locales)) {
    const blob = JSON.stringify(data);
    for (const phrase of MISATTRIBUTED_PHRASES) {
      if (blob.includes(phrase)) errors.push(`[attribution] ${loc} 官网出现归属拔高表述「${phrase}」`);
    }
  }

  // ④ 官网不得出现未交付能力词
  for (const [loc, data] of Object.entries(locales)) {
    const blob = JSON.stringify(data);
    for (const word of UNDELIVERED_WORDS) {
      if (blob.includes(word)) errors.push(`[claim] ${loc} 官网出现未交付能力词「${word}」`);
    }
  }

  // ⑤ ko 落地不得混入中文（品牌专名除外）——漏翻的中文工具清单会让韩国访客直接读中文
  {
    const koBlob = JSON.stringify(locales.ko);
    for (const m of koBlob.matchAll(CJK_RE)) {
      const bad = [...new Set(m[0])].filter((ch) => !KO_ALLOWED_CJK.has(ch));
      if (bad.length) {
        errors.push(`[i18n] ko 官网出现中文残留「${bad.join('')}」（${m[0]}）——漏翻请补译，品牌专名请加入 KO_ALLOWED_CJK`);
      }
    }
  }

  if (errors.length) {
    console.error(`[error] 营销宣称守门失败，共 ${errors.length} 条:`);
    for (const e of errors) console.error(`  ${e}`);
    process.exit(1);
  }
  console.log(`Marketing claims check OK (${COUNT_CLAIMS.length} count claims, ${FORBIDDEN_STATS.length} forbidden stat, ${MISATTRIBUTED_PHRASES.length} attribution phrases, ${UNDELIVERED_WORDS.length} undelivered words)`);
}

main();
