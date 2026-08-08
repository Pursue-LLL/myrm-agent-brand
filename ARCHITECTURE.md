# myrm-agent-brand 模块架构

## 架构概述

闭源品牌与文档仓：营销官网与产品文档分目录维护、分托管发布。MIT 开源产品在 [Pursue-LLL/myrm-agent](https://github.com/Pursue-LLL/myrm-agent)；本仓负责 `myrmagent.ai` 与 `docs.myrmagent.ai`。官网跳转 SaaS（`app.myrmagent.ai`）与文档站经 `deploy-mode.ts` 统一 URL。

文档约定（分形自文档）：仓根 `ARCHITECTURE.md`（整体架构）；跨模块方案 `xxx_SYSTEM.md`（如 `myrm-website/DUAL_PAGE_SYSTEM.md`）；各模块文件夹 `_ARCH.md`（模块文件清单与职责）；核心源码文件头部 `INPUT` / `OUTPUT` / `POS` 注释（文件定位）。**仅仓根允许 `README.md` 作 clone 入口**，子模块不用 README。

## 目录清单

| 路径 | 地位 | 职责 | 部署 |
|------|------|------|------|
| `_ARCH.md` | 核心 | 仓级目录索引（链至 ARCHITECTURE 与子包） | — |
| `README.md` | 入口 | Clone 与常用命令 | — |
| `CONTRIBUTING.md` | 辅助 | 贡献指南（链至 docs 详细说明） | — |
| `ARCHITECTURE.md` | 核心 | 仓级架构 SSOT | — |
| `myrm-website/` | 核心 | Next.js 营销站、下载页、法务页 | Cloudflare Pages → `myrmagent.ai` |
| `myrm-docs/` | 核心 | Mintlify 文档（MDX + `docs.json` + `package.json`） | Mintlify → `docs.myrmagent.ai` |

## Cloudflare Pages（生产）

**唯一部署路径：Cloudflare Pages。** 构建与部署在 CF Pages 完成；GHA 保留 **`website-release.yml`**（tag preflight + Deploy Hook）与 **`pr-check.yml`**（PR 校验，不部署）。禁止 Vercel、`workflow_dispatch` 或其他 deploy workflow。

### Dashboard 配置（已生效）

| 项 | 值 |
|----|-----|
| Production branch | `main` |
| Automatic deployments | **Disabled**（push 不触发构建） |
| Preview deployments | **None** |
| Deploy hook | `website-release` → branch `main` |
| Build command | `bun install && bun run build && bun run test` |
| Build env（可选） | `GITHUB_TOKEN` — 提高 bake 时 GitHub API 限额；`REQUIRE_BAKED_RELEASE=1`（GHA preflight 已设）— 空 manifest 时 bake exit 1 |
| Root directory | `myrm-website` |
| Output directory | `out` |

### 发布流程（仅两条路径）

1. 日常：`git push origin main` → 仅更新代码，不上线（CF 可能显示 skipped 记录，可忽略）
2. **正式发布**：`git tag website-v1.2.0 && git push origin main && git push origin website-v1.2.0` → Actions `website-release.yml` preflight → **assert origin/main == tag** → POST Deploy Hook → CF 构建部署
3. **本地应急**：`bun run release:website -- website-v1.2.0` → 本地 preflight + push tag → GHA POST Hook（见 [`release-website.ts`](myrm-website/scripts/release-website.ts)）；tag 已在 HEAD 时删远程 tag 后重推以重新触发 GHA

| Secret | 仓库 | 用途 |
|--------|------|------|
| `CF_PAGES_DEPLOY_HOOK` | **myrm-agent-brand**（仅 GHA） | `website-release.yml` POST Hook |

| 文件 | 职责 |
|------|------|
| `myrm-website/wrangler.toml` | CF Pages 项目元数据（`pages_build_output_dir = "out"`）；**非** CLI 上传入口 |
| `myrm-website/public/_redirects` | `/install.sh`、`/install.ps1` → `Pursue-LLL/myrm-agent` 安装脚本 |
| `myrm-website/scripts/release-website.ts` | 本地应急：preflight + push tag（不 POST Hook） |

`myrm-website/next.config.ts` 使用 `output: 'export'`，`next build` 静态产物在 `myrm-website/out/`。

`release-website.ts` 内置 `build`+`test` preflight。禁止 `wrangler pages deploy`、Vercel、GHA `workflow_dispatch`、本地/跨仓直接 POST Hook。

## 模块架构文档索引

| 文档 | 范围 |
|------|------|
| [`_ARCH.md`](_ARCH.md) | 仓级目录索引 |
| [`.github/_ARCH.md`](.github/_ARCH.md) | GitHub Actions CI 根 |
| [`myrm-website/_ARCH.md`](myrm-website/_ARCH.md) | Next.js 营销站模块 |
| [`myrm-docs/_ARCH.md`](myrm-docs/_ARCH.md) | Mintlify 文档站 |
| [`myrm-website/scripts/_ARCH.md`](myrm-website/scripts/_ARCH.md) | 构建/校验脚本 |
| [`myrm-website/src/lib/_ARCH.md`](myrm-website/src/lib/_ARCH.md) | 外链、release、docs 契约 |
| [`myrm-website/src/components/marketing/_ARCH.md`](myrm-website/src/components/marketing/_ARCH.md) | 营销站页面与 Landing |
| [`myrm-website/src/components/download/_ARCH.md`](myrm-website/src/components/download/_ARCH.md) | 桌面下载 UX |
| [`myrm-website/DUAL_PAGE_SYSTEM.md`](myrm-website/DUAL_PAGE_SYSTEM.md) | OSS `/` vs SaaS `/cloud` 双页方案 |
| [`myrm-website/src/app/_ARCH.md`](myrm-website/src/app/_ARCH.md) | App Router 路由 |
| [`myrm-website/src/hooks/_ARCH.md`](myrm-website/src/hooks/_ARCH.md) | 客户端 hooks |
| [`myrm-website/src/i18n/_ARCH.md`](myrm-website/src/i18n/_ARCH.md) | i18n 配置 |
| [`myrm-website/src/components/marketing/landing/_ARCH.md`](myrm-website/src/components/marketing/landing/_ARCH.md) | Landing sections |
| [`myrm-docs/scripts/_ARCH.md`](myrm-docs/scripts/_ARCH.md) | 文档导航维护脚本 |
| [`myrm-website/src/components/i18n/_ARCH.md`](myrm-website/src/components/i18n/_ARCH.md) | 客户端 locale 根 |
| [`myrm-website/src/components/ui/_ARCH.md`](myrm-website/src/components/ui/_ARCH.md) | shadcn primitives |
| [`myrm-website/src/components/marketing/landing/colony/_ARCH.md`](myrm-website/src/components/marketing/landing/colony/_ARCH.md) | Hero Canvas 蚁群场景 |

## 模块依赖

- 官网桌面下载元数据：`myrm-website/src/lib/desktop-release.ts` → GitHub Releases `Pursue-LLL/myrm-agent`；无 release 时 `/download` SaaS 优先、`CliInstallFallback` 诚实标注 localWebui 终端路径（非桌面 App），主 CTA 不暴露 GitHub Releases
- 营销 ↔ 文档 slug 契约：`myrm-website/scripts/validate-docs-slugs.ts`（orphan MDX + legacy URL grep：`myrm.ai`、`app.myrm.ai`、`github.com/myrm-ai`）
- 分形文档门禁：`myrm-website/scripts/check-fractal-docs.ts`（`bun run test` / `validate:fractal-docs`）；`myrm-docs/scripts/check-fractal-docs.ts`（`cd myrm-docs && bun run validate:fractal-docs` / `bun run test`）
- `public/desktop-release.json`：构建链 `bake:release` 产物（CF Pages / 本地 build），静态 export 首屏用；**不入库**（见 `myrm-website/.gitignore`），本地 dev 可选 `bun run bake:release` 或依赖 live GitHub fetch

## 文档 i18n（en + zh + ko）

| 项 | 约定 |
|----|------|
| Mintlify | `docs.json` → `navigation.languages[en, zh, ko]` |
| URL | EN：`/getting-started/...`；ZH：`/zh/getting-started/...`；KO：`/ko/getting-started/...` |
| 官网跳转 | `getDocsUrl(path, locale)`、`localizedDocsPath()`、`useDocsLocale` |
| App locale 接力 | `getAppUrl(path, locale)` → **主产品** `myrm-agent/myrm-agent-frontend` 的 `middleware.ts` 写 cookie → 登录后 `locale-personal-sync` 写 `personalSettings` |
| 营销站首访 locale | 静态 export 无 middleware；`detectBrowserLocale.ts` 优先级 `?locale=` > localStorage > navigator；`LocaleRootProvider` 首 render 同步读取 |
| 营销契约 | `MARKETING_DOC_PATHS` + `validate-docs-slugs` 三 locale（`bun run build` 门禁） |
| zh/ko MDX 内链 | `/zh/...`、`/ko/...`（非 `/docs/...`） |
| 脚本 | `myrm-docs/package.json`：`validate:fractal-docs` / `test` / `apply-i18n` / `apply-ko` / `translate:ko` / `build-zh-nav`；`check-fractal-docs.ts`（分形 `_ARCH` + 导航页 + EN/zh/ko 分区）；`apply-i18n-docs-json.ts`（导航 + zh footer）、`apply-ko-docs-json.ts`（ko 导航块）、`docs-ko-bulk-translate.py`（EN→ko MDX） |

## 约束

- 仓根不得再放置第二套 Next 应用（`package.json` / `src/` 等于废弃副本）。
- 仓根 `.gitignore` 含 `.agent/`、`.myrm/`（本地联调 agent workspace 产物，勿提交）。
- **营销站 CI/CD 仅 Cloudflare Pages**；GHA 仅 **`website-release.yml`**（tag 发布）+ **`pr-check.yml`**（PR lint/validate/test）；禁止 Vercel 与其他 deploy workflow；push `main` 不自动部署
- 勿对子目录执行 rsync 覆盖（会破坏 submodule `.git`）。
- 对外域名统一 `myrmagent.ai` / `app.myrmagent.ai` / `docs.myrmagent.ai`；GitHub 统一 `Pursue-LLL/myrm-agent`。
