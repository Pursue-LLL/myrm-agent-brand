# myrm-docs 模块架构

## 架构概述

Mintlify 文档站源码；导航与主题由 `docs.json` 定义。对外域名 `docs.myrmagent.ai`（与 `myrm-website` 的 `NEXT_PUBLIC_DOCS_URL` 一致）。

## 文件清单

| 文件 | 地位 | 职责 |
|------|------|------|
| `docs.json` | 核心 | 站点配置、侧栏、主题色；`navigation.languages[en,zh]` |
| `docs/**/*.mdx` | 核心 | 英文文档正文 |
| `docs/zh/**/*.mdx` | 核心 | 中文文档（URL 前缀 `/zh/`） |
| `scripts/apply-i18n-docs-json.ts` | 辅助 | 一次性生成双语 `docs.json`（含 zh footer） |
| `scripts/build-zh-navigation.ts` | 辅助 | 从 EN 导航生成 zh 页面路径 |

## 依赖

- 官网外链：`myrm-agent-brand/myrm-website/src/lib/deploy-mode.ts`（`myrmagent.ai` / `app.myrmagent.ai` / `docs.myrmagent.ai`）
- GitHub：`Pursue-LLL/myrm-agent`（与 desktop-release、development-setup 一致）
- orphan MDX 检测 + legacy URL grep + zh 关键页英文句门禁：`myrm-website/scripts/validate-docs-slugs.ts`（禁止 `myrm.ai`、`app.myrm.ai`、`github.com/myrm-ai`；`competitor-comparison` zh 零容忍）
