# Download Components

## 概述

桌面端安装包分发 UX：与 Tauri updater `latest.json` 共用数据源，静态 export 站点通过 embedded JSON + client SWR 解析发布信息。

## 模块

| 文件 | 地位 | 职责 | I/O |
|------|------|------|-----|
| `../../lib/desktop-release.ts` | 核心 | Release 元数据解析、平台检测、embedded/live fetch | — |
| `../../hooks/useDesktopReleaseState.ts` | 核心 | embedded 优先 + SWR 刷新 + 状态 | — |
| `DesktopReleaseProvider.tsx` | 核心 | 单页共享 release 状态 | ✅ |
| `platform-display.ts` | 核心 | 平台分组与 i18n 键映射（CTA + footnote 共用） | ✅ |
| `PlatformGlyph.tsx` | 核心 | Hero 下载 CTA 平台 SVG 图标 | ✅ |
| `SmartDownloadButton.tsx` | 核心 | OS 智能下载 CTA；Hero 直链 / Mac 选型 / 筹备中诚实文案 | ✅ |
| `CliInstallFallback.tsx` | 核心 | 无桌面包：筹备说明 + localWebui 终端引导（非桌面 App） | ✅ |
| `PlatformDownloadGrid.tsx` | 核心 | 全平台安装包矩阵 + Recommended + size；无包时 CliInstallFallback | ✅ |
| `ReleaseNotesSection.tsx` | 辅助 | Release notes 折叠展示 | ✅ |
| `InstallStepsSection.tsx` | 辅助 | 三平台安装引导 | ✅ |
| `ChecksumSection.tsx` | 辅助 | SHA256 内联展示 + 复制 | ✅ |
| `DownloadPageContent.tsx` | 核心 | `/download` 编排；无包时 localWebui 终端引导 | ✅ |

## 路由与触达

- `/download` — 功能页（矩阵或 CLI 兜底 + notes + 安装步骤 + SHA256 + 系统要求 + 替代路径）
- Landing Hero — `SmartDownloadButton` **主 CTA**（左，ed-cta + MagneticButton；`DesktopReleaseProvider` 包裹 Landing）
- Landing Hero — Quick Start **次 CTA**（右，ed-secondary-cta）
- Nav / Footer — `getDesktopDownloadPath()`
- `DeploySection` — Desktop 卡 → `/download`
- `QuickStartSection` desktop tab — 内嵌 Smart Download

## 环境变量

| 变量 | 默认 |
|------|------|
| `NEXT_PUBLIC_GITHUB_RELEASE_REPO` | `Pursue-LLL/myrm-agent` |

## 构建

- `bun run bake:release` — CI/本地构建前写入 `public/desktop-release.json`（GitHub API + inline SHA256；**gitignored，不入库**）
- `bun run build` — validate locales → bake → next export

## 测试

- `bun test scripts/desktop-release.test.ts` — 解析、平台回退、sha256、file size、Linux `AppImage.tar.gz` 分类

## 发布数据策略

- **首屏**：同域 `public/desktop-release.json`（`bun run build` 前 bake 生成；未 bake 时 fallback live GitHub API）
- **安装包 vs OTA**：bake/`parseGitHubRelease` 暴露 `.dmg`/`.exe`/`.AppImage*` 给用户安装；`latest.json` 仅服务 Tauri OTA（`.tar.gz`/`.nsis.zip`）
- **后台刷新**：GitHub Releases API → Tauri `latest.json` 兜底
- **Mac 架构不确定**：Landing/QuickStart → `/download`；download 页展示双 Mac 按钮
- **无 release**：Hero → `/download`；页内 localWebui 终端引导（诚实标注非桌面 App），不暴露 GitHub Releases
- **sessionStorage**：5 分钟 live fetch 缓存
