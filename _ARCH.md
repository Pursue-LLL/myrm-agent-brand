# myrm-agent-brand 模块架构

## 架构概述

闭源品牌与文档仓：营销官网（Next.js）与产品文档（Mintlify）分目录维护、分托管发布。MIT 开源产品在 [Pursue-LLL/myrm-agent](https://github.com/Pursue-LLL/myrm-agent)；本仓负责 `myrmagent.ai` 与 `docs.myrmagent.ai`。

整体架构、部署流程与跨包契约见 **[ARCHITECTURE.md](ARCHITECTURE.md)**；快速启动见 **[README.md](README.md)**。

## 根目录文件

| 文件 | 职责 |
|------|------|
| `ARCHITECTURE.md` | L1：双包边界、CF Pages 发布、文档 i18n、模块导航 |
| `README.md` | GitHub 仓库说明（常用命令、发布流程） |
| `CONTRIBUTING.md` | 贡献指南（PR 前检查清单） |
| `LICENSE` | Proprietary |
| `.gitignore` | 仓级忽略（`.agent/`、`.myrm/`、遗留根 Next 产物） |

## 目录清单

| 目录 | 地位 | 职责 | 文档 |
|------|------|------|------|
| `myrm-website/` | 核心 | Next.js 静态导出营销站（`myrmagent.ai`） | [myrm-website/_ARCH.md](myrm-website/_ARCH.md) |
| `myrm-docs/` | 核心 | Mintlify 文档站（`docs.myrmagent.ai`） | [myrm-docs/_ARCH.md](myrm-docs/_ARCH.md) |
| `.github/` | 辅助 | GitHub Actions（PR 校验 + tag 发布） | [.github/_ARCH.md](.github/_ARCH.md) |

## 约束

- 仓根不得再放置第二套 Next 应用（`package.json` / `src/` 等于废弃副本）
- 营销站 CI/CD **仅 Cloudflare Pages**；GHA 不直接部署 Vercel
- 对外域名统一 `myrmagent.ai` / `app.myrmagent.ai` / `docs.myrmagent.ai`
- 分形文档门禁：`myrm-website/scripts/check-fractal-docs.ts`（`bun run validate:fractal-docs`）；`myrm-docs/scripts/check-fractal-docs.ts`（`cd myrm-docs && bun run validate:fractal-docs`）
