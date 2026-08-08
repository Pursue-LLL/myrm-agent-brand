# src/i18n 模块架构

## 架构概述

next-intl 配置；静态 export 下 build 固定 `defaultLocale`，运行时由 `LocaleRootProvider` 客户端切换；首访由 `detectBrowserLocale.ts` 按 ?locale= > localStorage > navigator 解析。

## 文件清单

| 文件 | 地位 | 职责 | I/O/P |
|------|------|------|-------|
| `config.ts` | 核心 | `locales`、`defaultLocale`、`defaultTimeZone` | ✅ |
| `request.ts` | 核心 | `getRequestConfig`；加载 `locales/*.json` | ✅ |
| `detectBrowserLocale.ts` | 核心 | ?locale= / localStorage / navigator 优先级链；首 render SSOT | ✅ |

## 文案来源

| 路径 | 职责 |
|------|------|
| `locales/en.json` | 英文文案（`marketing.*`、`cloud.*`、`notFound.*`、`metadata.*`） |
| `locales/zh.json` | 中文文案 |
| `locales/ko.json` | 韩文文案 |
| `src/components/marketing/landing/marketing-keys.ts` | OSS 页 i18n 键契约 |
| `src/components/marketing/cloud/cloud-marketing-keys.ts` | 云页 i18n 键契约 |

## 模块依赖

- [components/i18n/LocaleRootProvider.tsx](../components/i18n/LocaleRootProvider.tsx)（POS: 客户端 locale 切换与消息注入）— 见 [components/i18n/_ARCH.md](../components/i18n/_ARCH.md)
