# myrm-docs 模块架构

## 架构概述

Mintlify 文档站源码；导航与主题由 `docs.json` 定义。对外域名 `docs.myrmagent.ai`（与 `myrm-website` 的 `NEXT_PUBLIC_DOCS_URL` 一致）。

## 文件清单

| 文件 | 地位 | 职责 |
|------|------|------|
| `docs.json` | 核心 | 站点配置、侧栏、主题色 |
| `docs/**/*.mdx` | 核心 | 用户文档正文 |

## 依赖

- 官网外链：`myrm-agent-brand/myrm-website/src/lib/deploy-mode.ts` (POS: 营销站外部链接统一入口)
