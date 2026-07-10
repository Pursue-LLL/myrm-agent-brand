# .github 模块架构

## 架构概述

闭源 `myrm-agent-brand` 仓库 GitHub Actions CI 根。营销站变更经 PR 门禁；生产发布仅 `website-v*` tag → Deploy Hook。

## 子目录

| 目录 | 职责 |
|------|------|
| `workflows/` | CI 流水线（见下表） |

## workflows 清单

| 文件 | 触发 | 职责 |
|------|------|------|
| `pr-check.yml` | PR → `main`（`myrm-website/**`、`myrm-docs/**`、workflows） | `lint` + `validate:locales` + `validate:docs-slugs` + `test` |
| `website-release.yml` | `website-v*` tag push | preflight → assert `origin/main == tag` → POST `CF_PAGES_DEPLOY_HOOK` → smoke |

详情见 [workflows/_ARCH.md](workflows/_ARCH.md)。

## 依赖

- [myrm-website/scripts/_ARCH.md](../myrm-website/scripts/_ARCH.md) — 构建/校验/分形门禁脚本
- [ARCHITECTURE.md](../ARCHITECTURE.md) — Cloudflare Pages 发布 SSOT
