# Cloud Marketing Page

## 路由

| 路由 | 组件 | i18n |
|------|------|------|
| `/cloud` | `LandingCloud.tsx` | `cloud.*` |
| `/pricing` | 302 → `/download`（云上线前） |

## 架构概述

SaaS 转化页，与开源首页 `/` 分离。当前 `robots: noindex`，首页不链入。详细设计见 [DUAL_PAGE_SYSTEM.md](../../../../DUAL_PAGE_SYSTEM.md)。

## 文件清单

| 文件 | 地位 | 职责 | I/O/P |
|------|------|------|-------|
| `LandingCloud.tsx` | 核心 | Hero · WorkspacePreview · 三步 · 定价 · FAQ · Final CTA | ✅ |
| `CloudShell.tsx` | 核心 | 顶栏 + 页脚（含链回 `/` 自托管） | ✅ |
| `cloud-marketing-keys.ts` | 核心 | `CLOUD_PLAN_KEYS` / `CLOUD_FAQ_KEYS` / `CLOUD_STEP_KEYS` | ✅ |
| `../landing/WorkspacePreview.tsx` | 核心 | 产品预览（`shell="shell"` + `cloud.demo.*`） | ✅ |
| `../../lib/cloud-paths.ts` | 核心 | App 登录/注册/账单 URL + UTM | ✅ |
| `../../lib/cloud-marketing-nav.ts` | 核心 | 云页 Nav | ✅ |

## 上线

见 [DUAL_PAGE_SYSTEM.md](../../../../DUAL_PAGE_SYSTEM.md)「云页上线清单」。
