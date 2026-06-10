# myrm-agent-brand 模块架构

## 架构概述

开源品牌仓：营销官网与产品文档分目录维护、分托管发布。官网跳转 SaaS（`app.myrmagent.ai`）与文档站（`docs.myrmagent.ai`）经 `deploy-mode.ts` 统一 URL。

文档约定（分形自文档）：仓根 `ARCHITECTURE.md`（整体架构）；各模块文件夹 `_ARCH.md`（模块文件清单与职责）；核心源码文件头部 `INPUT` / `OUTPUT` / `POS` 注释（文件定位）。

## 目录清单

| 目录 | 地位 | 职责 | 部署 |
|------|------|------|------|
| `myrm-website/` | 核心 | Next.js 营销站、下载页、法务页 | Cloudflare Pages → `myrmagent.ai` |
| `myrm-docs/` | 核心 | Mintlify 文档（MDX + `docs.json`） | Mintlify → `docs.myrmagent.ai` |

## Cloudflare Pages（生产）

**本仓营销站仅通过 Cloudflare Pages 部署（不用 Vercel）。** 正式发布：`push` `website-v*` tag → GitHub Actions `website-release.yml`（preflight `build`+`test` → POST Deploy Hook）；本地应急用 `release-website.ts`。日常合并前亦建议本地跑 `build`+`test`。除营销站发布 workflow 外勿引入其他 GHA 或 `vercel.json`。

### Dashboard 配置（已生效）

| 项 | 值 |
|----|-----|
| Production branch | `main` |
| Automatic deployments | **Disabled**（push 不触发构建） |
| Preview deployments | **None** |
| Deploy hook | `website-release` → branch `main` |
| Build command | `bun install && bun run build && bun run test` |
| Build env（可选） | `GITHUB_TOKEN` — 提高 bake 时 GitHub API 限额；缺则公开 API（失败时 build 会 fail 而非静默空 manifest） |
| Root directory | `myrm-website` |
| Output directory | `out` |

### 发布流程

1. 日常：`git push origin main` → 仅更新代码，不上线（CF 可能显示 skipped 记录，可忽略）
2. **推荐（GitHub 自动）**：`git tag website-v1.2.0 && git push origin website-v1.2.0` → Actions `website-release.yml` preflight → POST Deploy Hook → CF 构建部署
3. 本地应急：`bun run release:website -- website-v1.2.0` → 同 preflight + tag push + Hook（见 [`release-website.ts`](myrm-website/scripts/release-website.ts)）
4. **桌面发版联动（可选）**：`myrm-agent` finalize 的 `trigger-website-release.sh` 可代打 `website-v{semver}` tag（tag push 即触发步骤 2）；需 `BRAND_RELEASE_PAT`。`REQUIRE_WEBSITE_DEPLOY=false` 可跳过 finalize 自动 trigger。

| Secret | 仓库 | 用途 |
|--------|------|------|
| `CF_PAGES_DEPLOY_HOOK` | **myrm-agent-brand** | GHA / 本地 `release:website` POST Hook |
| `BRAND_RELEASE_PAT` | myrm-agent（可选） | finalize 代打 `website-v*` tag |
| `CF_PAGES_DEPLOY_HOOK` | myrm-agent（可选） | finalize 直接 POST Hook（无 tag 时） |

| 文件 | 职责 |
|------|------|
| `myrm-website/wrangler.toml` | `name = "myrm-agent-brand"`；`pages_build_output_dir = "out"` |
| `myrm-website/public/_redirects` | `/install.sh`、`/install.ps1` → `Pursue-LLL/myrm-agent` 安装脚本 |
| `myrm-website/scripts/release-website.ts` | preflight + tag + Deploy Hook 触发 CF 构建 |

`myrm-website/next.config.ts` 使用 `output: 'export'`，`next build` 静态产物在 `myrm-website/out/`。

`release-website.ts` 内置 `build`+`test` preflight；应急 wrangler 上传见仓根 README。

## 模块架构文档索引

| 文档 | 范围 |
|------|------|
| [`myrm-website/_ARCH.md`](myrm-website/_ARCH.md) | Next.js 营销站模块 |
| [`myrm-docs/_ARCH.md`](myrm-docs/_ARCH.md) | Mintlify 文档站 |
| [`myrm-website/scripts/_ARCH.md`](myrm-website/scripts/_ARCH.md) | 构建/校验脚本 |
| [`myrm-website/src/lib/_ARCH.md`](myrm-website/src/lib/_ARCH.md) | 外链、release、docs 契约 |
| [`myrm-website/src/components/marketing/_ARCH.md`](myrm-website/src/components/marketing/_ARCH.md) | 营销站页面与 Landing |
| [`myrm-website/src/components/download/_ARCH.md`](myrm-website/src/components/download/_ARCH.md) | 桌面下载 UX |
| [`myrm-website/src/components/marketing/landing/colony/_ARCH.md`](myrm-website/src/components/marketing/landing/colony/_ARCH.md) | Hero Canvas 蚁群场景 |

## 模块依赖

- 官网桌面下载元数据：`myrm-website/src/lib/desktop-release.ts` → GitHub Releases `Pursue-LLL/myrm-agent`；无 release 时 `/download` SaaS 优先、`CliInstallFallback` 诚实标注 localWebui 终端路径（非桌面 App），主 CTA 不暴露 GitHub Releases
- 营销 ↔ 文档 slug 契约：`myrm-website/scripts/validate-docs-slugs.ts`（orphan MDX + legacy URL grep：`myrm.ai`、`app.myrm.ai`、`github.com/myrm-ai`）
- `public/desktop-release.json`：构建链 `bake:release` 产物（CF Pages / 本地 build），静态 export 首屏用；**不入库**（见 `myrm-website/.gitignore`），本地 dev 可选 `bun run bake:release` 或依赖 live GitHub fetch

## 文档 i18n（en + zh）

| 项 | 约定 |
|----|------|
| Mintlify | `docs.json` → `navigation.languages[en, zh]` |
| URL | EN：`/getting-started/...`；ZH：`/zh/getting-started/...` |
| 官网跳转 | `getDocsUrl(path, locale)`、`localizedDocsPath()`、`useDocsLocale` |
| App locale 接力 | `getAppUrl(path, locale)` → `middleware.ts` 写 cookie → 登录后 `locale-personal-sync` 写 `personalSettings` |
| 营销契约 | `MARKETING_DOC_PATHS` + `validate-docs-slugs` 双 locale（`bun run build` 门禁） |
| zh MDX 内链 | `/zh/...`（非 `/docs/...`） |
| 脚本 | `apply-i18n-docs-json.ts`（导航 + zh footer）、`build-zh-navigation.ts` |

## 约束

- 仓根不得再放置第二套 Next 应用（`package.json` / `src/` 等于废弃副本）。
- **营销站 CI/CD 仅 Cloudflare Pages**；禁止 GitHub Actions、Vercel；push `main` 不自动部署，仅 Deploy Hook / wrangler 应急可上线
- 勿对子目录执行 rsync 覆盖（会破坏 submodule `.git`）。
- 对外域名统一 `myrmagent.ai` / `app.myrmagent.ai` / `docs.myrmagent.ai`；GitHub 统一 `Pursue-LLL/myrm-agent`。
