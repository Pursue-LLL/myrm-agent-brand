# myrm-agent-brand 模块架构

## 架构概述

闭源品牌仓：营销官网与产品文档分目录维护、分托管发布。官网跳转 SaaS（`app.myrmagent.ai`）与文档站（`docs.myrmagent.ai`）经 `deploy-mode.ts` 统一 URL。

文档约定（分形自文档）：仓根 `ARCHITECTURE.md`（整体架构）；各模块文件夹 `_ARCH.md`（模块文件清单与职责）；核心源码文件头部 `INPUT` / `OUTPUT` / `POS` 注释（文件定位）。

## 目录清单

| 目录 | 地位 | 职责 | 部署 |
|------|------|------|------|
| `myrm-website/` | 核心 | Next.js 营销站、下载页、法务页 | Cloudflare Pages → `myrmagent.ai` |
| `myrm-docs/` | 核心 | Mintlify 文档（MDX + `docs.json`） | Mintlify → `docs.myrmagent.ai` |

## Cloudflare Pages（生产）

| 文件 | 职责 |
|------|------|
| `myrm-website/wrangler.toml` | `name = "myrm-agent-brand"`；`pages_build_output_dir = "out"` |
| `myrm-website/public/_redirects` | `/install.sh`、`/install.ps1` → `Pursue-LLL/myrm-agent` 安装脚本 |
| CF Pages Git 集成 | 生产发布：push `main` → `bun run build`（校验 + bake + export）→ 部署 `myrm-agent-brand` |

`myrm-website/next.config.ts` 使用 `output: 'export'`，`next build` 静态产物在 `myrm-website/out/`。

合并前本地执行 `cd myrm-website && bun run build`；应急 wrangler 上传见仓根 README。

## 模块架构文档索引

| 文档 | 范围 |
|------|------|
| [`myrm-docs/_ARCH.md`](myrm-docs/_ARCH.md) | Mintlify 文档站 |
| [`myrm-website/scripts/_ARCH.md`](myrm-website/scripts/_ARCH.md) | 构建/校验脚本 |
| [`myrm-website/src/lib/_ARCH.md`](myrm-website/src/lib/_ARCH.md) | 外链、release、docs 契约 |
| [`myrm-website/src/components/marketing/_ARCH.md`](myrm-website/src/components/marketing/_ARCH.md) | 营销站页面与 Landing |
| [`myrm-website/src/components/download/_ARCH.md`](myrm-website/src/components/download/_ARCH.md) | 桌面下载 UX |
| [`myrm-website/src/components/marketing/landing/colony/_ARCH.md`](myrm-website/src/components/marketing/landing/colony/_ARCH.md) | Hero Canvas 蚁群场景 |

## 模块依赖

- 官网桌面下载元数据：`myrm-website/src/lib/desktop-release.ts` → GitHub Releases `Pursue-LLL/myrm-agent`
- 营销 ↔ 文档 slug 契约：`myrm-website/scripts/validate-docs-slugs.ts`（orphan MDX + legacy URL grep：`myrm.ai`、`app.myrm.ai`、`github.com/myrm-ai`）
- `public/desktop-release.json`：构建链 `bake:release` 产物（CF Pages / 本地 build），静态 export 首屏用，勿手改

## 文档 i18n（en + zh）

| 项 | 约定 |
|----|------|
| Mintlify | `docs.json` → `navigation.languages[en, zh]` |
| URL | EN：`/getting-started/...`；ZH：`/zh/getting-started/...` |
| 官网跳转 | `getDocsUrl(path, locale)`、`localizedDocsPath()`、`useDocsLocale` |
| App locale 接力 | `getAppUrl(path, locale)` → `middleware.ts` 写 cookie → 登录后 `locale-personal-sync` 写 `personalSettings` |
| 营销契约 | `MARKETING_DOC_PATHS` + `validate-docs-slugs` 双 locale（`bun run build` 门禁） |
| zh MDX 内链 | `/zh/...`（非 `/docs/...`） |
| 脚本 | `apply-i18n-docs-json.ts`（导航 + zh footer）、`build-zh-navigation.ts` |

## 约束

- 仓根不得再放置第二套 Next 应用（`package.json` / `src/` 等于废弃副本）。
- 勿对子目录执行 rsync 覆盖（会破坏 submodule `.git`）。
- 对外域名统一 `myrmagent.ai` / `app.myrmagent.ai` / `docs.myrmagent.ai`；GitHub 统一 `Pursue-LLL/myrm-agent`。
