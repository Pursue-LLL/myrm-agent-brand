# myrm-website/ 模块架构

## 架构概述

Next.js 静态导出营销站（Cloudflare Pages → `myrmagent.ai`）。双页面：`/` 开源自托管 + `/cloud` SaaS（indexable，OSS 页脚入口）。下载页、法务页、Landing。桌面 release 元数据与文档站 slug 契约。部署见 [../ARCHITECTURE.md](../ARCHITECTURE.md)；双页设计见 [DUAL_PAGE_SYSTEM.md](DUAL_PAGE_SYSTEM.md)。

## 目录清单

| 目录/文件 | 地位 | 职责 | I/O/P |
| --- | --- | --- | --- |
| `src/app/` | 核心 | App Router 页面与布局 | [_ARCH.md](src/app/_ARCH.md) |
| `src/hooks/` | 核心 | 客户端 hooks | [_ARCH.md](src/hooks/_ARCH.md) |
| `src/i18n/` | 核心 | next-intl 配置 | [_ARCH.md](src/i18n/_ARCH.md) |
| `src/components/i18n/` | 核心 | 客户端 locale 根 | [_ARCH.md](src/components/i18n/_ARCH.md) |
| `src/components/ui/` | 辅助 | shadcn primitives | [_ARCH.md](src/components/ui/_ARCH.md) |
| `DUAL_PAGE_SYSTEM.md` | 核心 | OSS `/` vs SaaS `/cloud` 技术方案 | — |
| `src/components/marketing/` | 核心 | 营销页与 Landing | [_ARCH.md](src/components/marketing/_ARCH.md) |
| `src/components/download/` | 核心 | 桌面下载 UX | [_ARCH.md](src/components/download/_ARCH.md) |
| `src/lib/` | 核心 | 外链、release、docs 契约 | [_ARCH.md](src/lib/_ARCH.md) |
| `scripts/` | 辅助 | 构建/校验/发布 | [_ARCH.md](scripts/_ARCH.md) |
| `public/` | 辅助 | 静态资源、`_redirects` | — |
| `next.config.ts` | 配置 | `output: 'export'` → `out/` | — |
| `wrangler.toml` | 配置 | Cloudflare Pages 项目名与 output 目录 | — |

## 发布

- 日常：`git push origin main` 不自动上线（CF Automatic deployments Disabled）
- 发布：`git push origin website-vX.Y.Z` → GHA preflight + Deploy Hook（Secret `CF_PAGES_DEPLOY_HOOK`）
- 本地应急：`bun run release:website -- website-vX.Y.Z`
- 桌面联动（可选）：`myrm-agent` finalize 代打 `website-v*` tag → 触发 GHA
- 应急：wrangler 上传（见仓根 README）

## 模块依赖

- 桌面 release：`src/lib/desktop-release.ts` → GitHub `Pursue-LLL/myrm-agent` Releases
- 文档 slug 契约：`scripts/validate-docs-slugs.ts` ↔ `myrm-docs/`
- SaaS 跳转：`deploy-mode` 类 URL 与 `app.myrmagent.ai`

## 子模块文档索引

| 文档 | 范围 |
| --- | --- |
| [scripts/_ARCH.md](scripts/_ARCH.md) | 构建/校验/发布脚本 |
| [src/lib/_ARCH.md](src/lib/_ARCH.md) | 外链与 release 契约 |
| [src/components/marketing/_ARCH.md](src/components/marketing/_ARCH.md) | 营销页面 |
| [src/components/download/_ARCH.md](src/components/download/_ARCH.md) | 下载页 |
| [src/app/_ARCH.md](src/app/_ARCH.md) | App Router 路由 |
| [src/hooks/_ARCH.md](src/hooks/_ARCH.md) | 客户端 hooks |
| [src/i18n/_ARCH.md](src/i18n/_ARCH.md) | i18n 配置 |
| [src/components/marketing/landing/_ARCH.md](src/components/marketing/landing/_ARCH.md) | Landing sections |
| [DUAL_PAGE_SYSTEM.md](DUAL_PAGE_SYSTEM.md) | 双营销页技术方案 |
| [src/components/marketing/landing/colony/_ARCH.md](src/components/marketing/landing/colony/_ARCH.md) | Hero Canvas |
