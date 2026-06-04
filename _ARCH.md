# myrm-agent-brand 模块架构

## 架构概述

闭源品牌仓：营销官网与产品文档分目录维护、分托管发布。官网跳转 SaaS（`app.myrmagent.ai`）与文档站（`docs.myrmagent.ai`）经 `deploy-mode.ts` 统一 URL。

## 目录清单

| 目录 | 地位 | 职责 | 部署 |
|------|------|------|------|
| `myrm-website/` | 核心 | Next.js 营销站、下载页、法务页 | Vercel（见下方 vercel 配置说明） |
| `myrm-docs/` | 核心 | Mintlify 文档（MDX + `docs.json`） | Mintlify → `docs.myrmagent.ai` |
| `.github/workflows/` | 辅助 | `website-ci.yml` 构建 `myrm-website` | GitHub Actions |

## Vercel 配置

| 文件 | 使用场景 |
|------|----------|
| 仓根 `vercel.json` | Vercel 项目 Root Directory = 仓根；`installCommand` / `buildCommand` 进入 `myrm-website/` |
| `myrm-website/vercel.json` | Vercel 项目 Root Directory = `myrm-website`；含 `/install.sh`、`/install.ps1` 重定向 |

二者互斥，按 Vercel 项目 Root Directory 选其一，勿同时改两处 build 路径。

## 模块架构文档索引

| 文档 | 范围 |
|------|------|
| [`myrm-docs/_ARCH.md`](myrm-docs/_ARCH.md) | Mintlify 文档站 |
| [`myrm-website/src/lib/_ARCH.md`](myrm-website/src/lib/_ARCH.md) | 外链、release、docs 契约 |
| [`myrm-website/src/components/marketing/_ARCH.md`](myrm-website/src/components/marketing/_ARCH.md) | 营销站页面与 Landing |
| [`myrm-website/src/components/download/_ARCH.md`](myrm-website/src/components/download/_ARCH.md) | 桌面下载 UX |
| [`myrm-website/src/components/marketing/landing/colony/_ARCH.md`](myrm-website/src/components/marketing/landing/colony/_ARCH.md) | Hero Canvas 蚁群场景 |

## 模块依赖

- 官网桌面下载元数据：`myrm-website/src/lib/desktop-release.ts` → GitHub Releases `Pursue-LLL/myrm-agent`
- 营销 ↔ 文档 slug 契约：`myrm-website/scripts/validate-docs-slugs.ts`（含 orphan MDX 检测）
- `public/desktop-release.json`：CI `bake:release` 产物，静态 export 首屏用，勿手改

## 约束

- 仓根不得再放置第二套 Next 应用（`package.json` / `src/` 等于废弃副本）。
- 勿对子目录执行 rsync 覆盖（会破坏 submodule `.git`）。
- 对外域名统一 `myrmagent.ai` / `app.myrmagent.ai` / `docs.myrmagent.ai`；GitHub 统一 `Pursue-LLL/myrm-agent`。
