# myrm-docs/scripts 模块架构

## 架构概述

Mintlify 文档站维护脚本；非常规开发路径，仅在导航结构或双语配置批量变更时运行。

## 文件清单

| 文件 | 地位 | 职责 | I/O/P |
|------|------|------|-------|
| `check-fractal-docs.ts` | 核心 | 分形 `_ARCH.md` + 导航页 + EN/zh/ko 分区对齐门禁 | ✅ |
| `check-fractal-docs.test.ts` | 测试 | 门禁 smoke test | — |
| `apply-i18n-docs-json.ts` | 辅助 | 一次性将 `docs.json` 改写为 `navigation.languages[en,zh]` 双语结构 | — |
| `apply-ko-docs-json.ts` | 辅助 | 向 `docs.json` 追加 `navigation.languages[ko]` 导航块 | — |
| `seed-ko-docs.ts` | 辅助 | 从 EN 复制并改写 `/ko/` 内链，满足 orphan 门禁 | — |
| `docs-ko-bulk-translate.py` | 辅助 | EN/zh→ko MDX 批量机器翻译（`.venv` + deep-translator）；`PROTECTED_KO_MDX` 跳过已手工韩文化的页面（如 Compare 主表） | — |
| `build-zh-navigation.ts` | 辅助 | 从 EN 导航生成 zh 页面路径列表 | — |

## 运行方式

```bash
cd myrm-docs
bun run dev                  # mint dev
bun run validate:fractal-docs
bun run test
bun run apply-i18n           # 导航结构大改时
bun run apply-ko             # 首次或重建 ko 导航块
bun run translate:ko         # EN → ko MDX 批量翻译（需 .venv）
bun run build-zh-nav         # 新增 EN 页面后同步 zh 路径
```

运行后须人工检查 `docs/zh/**/*.mdx` 是否已翻译，并执行 `myrm-website` 侧 `bun run validate:docs-slugs`。

## 约束

- 新增 `docs/`、`docs/zh/` 或 `docs/ko/` 顶层分区时，须同步更新 `check-fractal-docs.ts` 内 `DOC_SECTIONS` 常量
- orphan MDX 仍以 `validate-docs-slugs.ts` 为 SSOT；本门禁不替代 slug 契约校验

## 模块依赖

- `docs.json`（POS: Mintlify 站点配置与导航 SSOT）
- `myrm-website/scripts/validate-docs-slugs.ts`（orphan MDX 与 legacy URL 门禁）
