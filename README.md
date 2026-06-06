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
| `deploy-website-cf.yml` | 仅手动 `workflow_dispatch` | wrangler 应急上传 CF Pages（生产走 CF Git 集成） |

## 生产发布（Cloudflare Pages Git）

push `main` → Cloudflare Pages 项目 `myrm-agent-brand` 自动构建部署 → `myrmagent.ai`。

**install 脚本短链**（`/install.sh`、`/install.ps1`）：`myrm-website/public/_redirects`（随 `out/` 发布）。

见 [ARCHITECTURE.md](ARCHITECTURE.md)「Cloudflare Pages」节。

## 架构文档

分形自文档约定：仓级 [ARCHITECTURE.md](ARCHITECTURE.md)（整体架构）；各模块子目录 `_ARCH.md`（模块文件清单与职责）；核心源码文件头部 `INPUT` / `OUTPUT` / `POS` 注释（文件定位）。本 README 仅为 clone 入口，细节以 ARCHITECTURE 为准。
