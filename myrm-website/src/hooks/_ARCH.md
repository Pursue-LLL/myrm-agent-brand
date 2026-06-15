# src/hooks 模块架构

## 架构概述

营销站客户端 hooks；桥接 lib 契约与 React 组件。

## 文件清单

| 文件 | 地位 | 职责 | I/O/P |
|------|------|------|-------|
| `useDocsLocale.ts` | 核心 | App locale → Mintlify docs locale | ✅ |
| `useDesktopReleaseState.ts` | 核心 | embedded manifest 优先 + live GitHub 刷新 | ✅ |

## 模块依赖

- `src/lib/docs-contract.ts`（POS: 营销站 → Mintlify 路径契约）
- `src/lib/desktop-release.ts`（POS: 桌面端安装包元数据单一入口）
- `landing/landing-interaction.ts`（POS: Landing 页交互 hooks，非本目录）
- `next-intl`（POS: 营销站应用 locale）
