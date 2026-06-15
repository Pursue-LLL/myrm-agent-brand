# myrm-docs/scripts 模块架构

## 架构概述

Mintlify 文档站维护脚本；非常规开发路径，仅在导航结构或双语配置批量变更时运行。

## 文件清单

| 文件 | 地位 | 职责 | I/O/P |
|------|------|------|-------|
| `apply-i18n-docs-json.ts` | 辅助 | 一次性将 `docs.json` 改写为 `navigation.languages[en,zh]` 双语结构 | — |
| `build-zh-navigation.ts` | 辅助 | 从 EN 导航生成 zh 页面路径列表 | — |

## 运行方式

```bash
cd myrm-docs
bun run dev                  # mint dev
bun run apply-i18n           # 导航结构大改时
bun run build-zh-nav         # 新增 EN 页面后同步 zh 路径
```

运行后须人工检查 `docs/zh/**/*.mdx` 是否已翻译，并执行 `myrm-website` 侧 `bun run validate:docs-slugs`。

## 模块依赖

- `docs.json`（POS: Mintlify 站点配置与导航 SSOT）
- `myrm-website/scripts/validate-docs-slugs.ts`（orphan MDX 与 legacy URL 门禁）
