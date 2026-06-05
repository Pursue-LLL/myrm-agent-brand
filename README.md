# myrm-agent-brand

品牌仓：Myrm 营销官网（Next.js）与产品文档（Mintlify），分目录维护、分托管发布。

| 包 | 职责 | 本地开发 | 线上 |
| --- | --- | --- | --- |
| `myrm-website/` | 落地页、下载页、定价与法务页 | `cd myrm-website && bun install && bun run dev:3002` | [myrmagent.ai](https://myrmagent.ai) |
| `myrm-docs/` | 用户文档（MDX + `docs.json`） | [Mintlify CLI](https://www.mintlify.com/docs/development)：`cd myrm-docs && mint dev` | [docs.myrmagent.ai](https://docs.myrmagent.ai) |

官网 CTA 跳转 SaaS（`app.myrmagent.ai`）；文档外链经 `myrm-website/src/lib/deploy-mode.ts` 统一为 `docs.myrmagent.ai`。

## 常用命令（`myrm-website/`）

```bash
bun run dev:3002          # 本地营销站（端口 3002，与 App :3000 分离）
bun run build             # validate → bake release → next export
bun run validate:locales  # i18n 键契约 + legacy URL 扫描
bun run validate:docs-slugs  # 营销 slug ↔ Mintlify nav ↔ MDX orphan
bun run test              # deploy-paths + desktop-release 单测
```

`bun run build` 前会自动执行 locale 与 docs slug 校验，并 `bake:release` 写入 `public/desktop-release.json`（GitHub Releases 元数据；**CI 生成，勿手改**，用于静态 export 首屏）。

## CI

| Workflow | 触发 | 作用 |
| --- | --- | --- |
| `website-ci.yml` | `myrm-website/**`、`myrm-docs/**` | `validate:docs-slugs` → `bake:release` → `build`（含 `validate:locales`） |
| `deploy-website-cf.yml` | 仅手动 `workflow_dispatch` | 构建 `out/` 并部署 **Cloudflare Pages**（灾备/迁移用；生产自动发布=Vercel） |

## 静态托管（Vercel 或 Cloudflare Pages）

**install 脚本短链**（`/install.sh`、`/install.ps1` → `myrm-agent` 仓库 raw 脚本）：

| 托管 | 配置位置 |
| --- | --- |
| Vercel | `myrm-website/vercel.json` → `redirects` |
| Cloudflare Pages | `myrm-website/public/_redirects`（随 `out/` 一并发布） |

## Vercel 部署

仓内有两份 `vercel.json`，**互斥**——按 Vercel 项目 Root Directory 选其一，勿同时改两处 build 路径：

| Root Directory | 配置文件 |
| --- | --- |
| 仓根 | `vercel.json`（`cd myrm-website` 安装/构建） |
| `myrm-website` | `myrm-website/vercel.json`（含 `/install.sh`、`/install.ps1` 重定向） |

## Cloudflare Pages（可选）

```bash
cd myrm-website && bun run build   # 产物在 out/
# wrangler pages deploy out  或在 GitHub Actions 手动运行 deploy-website-cf.yml
```

见 [ARCHITECTURE.md](ARCHITECTURE.md)「Cloudflare Pages」节。

## 架构文档

分形自文档约定：仓级 [ARCHITECTURE.md](ARCHITECTURE.md)（整体架构）；各模块子目录 `_ARCH.md`（模块文件清单与职责）；核心源码文件头部 `INPUT` / `OUTPUT` / `POS` 注释（文件定位）。本 README 仅为 clone 入口，细节以 ARCHITECTURE 为准。
