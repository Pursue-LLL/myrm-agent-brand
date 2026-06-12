# myrm-docs 模块架构

## 架构概述

Mintlify 文档站源码；导航与主题由 `docs.json` 定义。对外域名 `docs.myrmagent.ai`（与 `myrm-website` 的 `NEXT_PUBLIC_DOCS_URL` 一致）。

## 文件清单

| 文件 | 地位 | 职责 | I/O/P |
|------|------|------|-------|
| `docs.json` | 核心 | 站点配置、侧栏、主题色；`navigation.languages[en,zh]` | — |
| `docs/**/*.mdx` | 核心 | 英文文档正文 | — |
| `docs/zh/**/*.mdx` | 核心 | 中文文档（URL 前缀 `/zh/`） | — |
| `images/logo-light.png` | 辅助 | Mintlify logo（light/dark 共用，待设计 dark 变体） | — |
| `images/favicon.png` | 辅助 | 站点 favicon | — |
| `scripts/` | 辅助 | 导航维护脚本 | [scripts/_ARCH.md](scripts/_ARCH.md) |

## 依赖

- 官网外链：`myrm-agent-brand/myrm-website/src/lib/deploy-mode.ts`（`myrmagent.ai` / `app.myrmagent.ai` / `docs.myrmagent.ai`）
- GitHub：`Pursue-LLL/myrm-agent`（与 desktop-release、development-setup 一致）
- orphan MDX 检测 + legacy URL grep + zh 关键页英文句门禁：`myrm-website/scripts/validate-docs-slugs.ts`（禁止 `myrm.ai`、`app.myrm.ai`、`github.com/myrm-ai`；`competitor-comparison` zh 零容忍）
