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

`bun run build` 前会自动执行 locale 与 docs slug 校验，并 `bake:release` 写入 `public/desktop-release.json`（GitHub Releases 元数据，用于静态 export 首屏；**不入库**，见 `myrm-website/.gitignore`）。

本地开发可选 `bun run bake:release` 预热下载元数据；未 bake 时下载页会 fallback 到 live GitHub API。

## 生产发布（Cloudflare Pages）

**唯一 CI/CD 路径：Cloudflare Pages。** 本仓**不使用** GitHub Actions、Vercel 或其他第二套构建流水线；勿添加 `.github/workflows/` 或 `vercel.json`。

### 日常开发（push 不自动上线）

CF Dashboard 已配置：

- **Automatic deployments: Disabled**（push `main` 不会触发构建）
- **Preview deployments: None**
- **Deploy hook:** `website-release`（branch `main`）

合并代码后 `git push origin main` 仅更新仓库，**不会**部署到 `myrmagent.ai`。

### 正式发布（打 tag + Deploy Hook）

1. 确保 `main` 工作区干净、已与 `origin/main` 同步（无未提交改动、无落后远程）
2. 从 CF Dashboard → Settings → Deploy Hooks 复制 hook URL，写入本地环境变量（**不入库**）：

```bash
export CF_PAGES_DEPLOY_HOOK='https://api.cloudflare.com/client/v4/pages/webhooks/deploy_hooks/…'
cd myrm-website
bun run release:website -- website-v1.2.0
```

脚本会：**preflight**（干净工作区 → fetch/sync `origin/main` → `bun run build` → `bun run test`）→ 创建 git tag（或 tag 已在 HEAD 时仅 redeploy）→ `git push` tag → POST Deploy Hook → CF 从 `main` 最新 commit 构建部署。

若 tag 已指向其他 commit，脚本会中止；请使用新版本号（如 `website-v1.2.1`）。

应急部署（Deploy Hook 不可用时）：本地 build 后 `wrangler pages deploy out --project-name=myrm-agent-brand`。

**install 脚本短链**（`/install.sh`、`/install.ps1`）：`myrm-website/public/_redirects`（随 `out/` 发布）。

见 [ARCHITECTURE.md](ARCHITECTURE.md)「Cloudflare Pages」节。

## 架构文档

分形自文档约定：仓级 [ARCHITECTURE.md](ARCHITECTURE.md)（整体架构）；各模块子目录 `_ARCH.md`（模块文件清单与职责）；核心源码文件头部 `INPUT` / `OUTPUT` / `POS` 注释（文件定位）。本 README 仅为 clone 入口，细节以 ARCHITECTURE 为准。
