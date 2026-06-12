# components/i18n 模块架构

## 架构概述

客户端 i18n 根组件；与 `src/i18n/` 配置层配合，在静态 export 下提供运行时 locale 切换。

## 文件清单

| 文件 | 地位 | 职责 | I/O/P |
|------|------|------|-------|
| `LocaleRootProvider.tsx` | 核心 | NextIntlClientProvider + localStorage 持久化 | ✅ |

## 模块依赖

- `src/i18n/config.ts`（POS: locale 配置单一入口）
- `locales/en.json`、`locales/zh.json`
