# Download Components

## 概述

桌面端安装包分发 UX：与 Tauri updater `latest.json` 共用数据源，静态 export 站点通过 embedded JSON + client SWR 解析发布信息。

## 模块

| 文件 | 地位 | 职责 | I/O |
|------|------|------|-----|
| `../../lib/desktop-release.ts` | 核心 | Release 元数据解析、平台检测、embedded/live fetch | — |
| `../../hooks/useDesktopReleaseState.ts` | 核心 | embedded 优先 + SWR 刷新 + 状态 | — |
| `DesktopReleaseProvider.tsx` | 核心 | 单页共享 release 状态 | ✅ |
| `SmartDownloadButton.tsx` | 核心 | OS 智能下载 CTA | ✅ |
| `PlatformDownloadGrid.tsx` | 核心 | 全平台安装包矩阵 + Recommended + size | ✅ |
| `ReleaseNotesSection.tsx` | 辅助 | Release notes 折叠展示 | ✅ |
| `InstallStepsSection.tsx` | 辅助 | 三平台安装引导 | ✅ |
| `ChecksumSection.tsx` | 辅助 | SHA256 内联展示 + 复制 | ✅ |
| `DownloadPageContent.tsx` | 核心 | `/download` 页面内容；`useDocsLocale` 生成 zh/en 部署文档链 | ✅ |

## 路由与触达

- `/download` — 功能页（矩阵 + notes + 安装步骤 + SHA256 + 系统要求 + 替代路径）
- Landing Hero — `SmartDownloadButton` 次 CTA（`DesktopReleaseProvider` 包裹 Landing）
- Nav / Footer — `getDesktopDownloadPath()`
- `DeploySection` — Desktop 卡 → `/download`
- `QuickStartSection` desktop tab — 内嵌 Smart Download

## 环境变量

| 变量 | 默认 |
|------|------|
| `NEXT_PUBLIC_GITHUB_RELEASE_REPO` | `Pursue-LLL/myrm-agent` |

## 构建

- `bun run bake:release` — CI/本地构建前写入 `public/desktop-release.json`（GitHub API + inline SHA256）
- `bun run build` — validate locales → bake → next export

## 测试

- `bun test scripts/desktop-release.test.ts` — 解析、平台回退、sha256、file size

## 发布数据策略

- **首屏**：同域 `public/desktop-release.json`（CI bake）
- **后台刷新**：GitHub Releases API → Tauri `latest.json` 兜底
- **Mac 架构不确定**：Landing/QuickStart → `/download`；download 页展示双 Mac 按钮
- **sessionStorage**：5 分钟 live fetch 缓存
