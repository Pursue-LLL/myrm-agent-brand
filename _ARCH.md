# myrm-agent-brand 模块架构

## 架构概述

闭源品牌仓：营销官网与产品文档分目录维护、分托管发布。官网跳转 SaaS（`app.myrmagent.ai`）与文档站（`docs.myrmagent.ai`）经 `deploy-mode.ts` 统一 URL。

## 目录清单

| 目录 | 地位 | 职责 | 部署 |
|------|------|------|------|
| `myrm-website/` | 核心 | Next.js 营销站、下载页、法务页 | Vercel（仓根 `vercel.json` 或 Root Directory = `myrm-website`） |
| `myrm-docs/` | 核心 | Mintlify 文档（MDX + `docs.json`） | Mintlify → `docs.myrmagent.ai` |
| `.github/workflows/` | 辅助 | `website-ci.yml` 构建 `myrm-website` | GitHub Actions |

## 模块依赖

- 官网桌面下载元数据：`myrm-website/src/lib/desktop-release.ts` → GitHub Releases `Pursue-LLL/myrm-agent`
- 营销模块详述：`myrm-website/src/components/marketing/_ARCH.md`

## 约束

- 仓根不得再放置第二套 Next 应用（`package.json` / `src/` 等于废弃副本）。
- 勿对子目录执行 rsync 覆盖（会破坏 submodule `.git`）。
