# src/app 模块架构

## 架构概述

Next.js App Router 路由层；静态 export（`output: 'export'`）。双营销页设计见 [DUAL_PAGE_SYSTEM.md](../../DUAL_PAGE_SYSTEM.md)。

## 文件清单

| 文件 | 地位 | 职责 | I/O/P |
|------|------|------|-------|
| `layout.tsx` | 核心 | 根布局、ThemeProvider、LocaleRootProvider、全局 metadata | ✅ |
| `page.tsx` | 核心 | `/` → `LandingEditorial` | ✅ |
| `cloud/page.tsx` | 核心 | `/cloud` → `LandingCloud`（indexable） | ✅ |
| `download/page.tsx` | 核心 | `/download` → `DownloadPageContent` + release provider | ✅ |
| `privacy/page.tsx` | 辅助 | 隐私政策 | ✅ |
| `privacy/layout.tsx` | 辅助 | 法务页 metadata | ✅ |
| `terms/page.tsx` | 辅助 | 服务条款 | ✅ |
| `terms/layout.tsx` | 辅助 | 法务页 metadata | ✅ |
| `refund/page.tsx` | 辅助 | 退款政策 | ✅ |
| `refund/layout.tsx` | 辅助 | 法务页 metadata | ✅ |
| `not-found.tsx` | 辅助 | 品牌化双语 404（`notFound.*` i18n） | ✅ |
| `robots.ts` | 辅助 | `/robots.txt` | ✅ |
| `sitemap.ts` | 辅助 | `/sitemap.xml`（含 `/cloud`） | ✅ |
| `globals.css` | 配置 | 全局样式 | — |

## 模块依赖

- 编排组件：`src/components/marketing/`、`src/components/download/`
- i18n：`src/i18n/` + `locales/*.json`
- 外链：`src/lib/deploy-mode.ts`
