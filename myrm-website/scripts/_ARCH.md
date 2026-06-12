# myrm-website/scripts 模块架构

## 文件清单

| 文件 | 地位 | 职责 | I/O/P |
|------|------|------|-------|
| `brand-url-patterns.ts` | 核心 | 禁止 legacy 域名/org 的正则；validate 脚本共用 | ✅ |
| `validate-marketing-locales.ts` | 核心 | locales 键契约 + legacy URL 扫描 | ✅ |
| `validate-docs-slugs.ts` | 核心 | 营销 slug ↔ Mintlify nav ↔ MDX orphan | ✅ |
| `bake-desktop-release.ts` | 核心 | 构建前写入 `public/desktop-release.json` | ✅ |
| `release-website.ts` | 核心 | tag + CF Deploy Hook preflight | ✅ |
| `check-fractal-docs.ts` | 核心 | 品牌仓 _ARCH 存在 + 核心文件 IOP 门禁 | ✅ |
| `docs-contract.test.ts` | 辅助 | docs-contract locale 单测 | — |
| `desktop-release.test.ts` | 辅助 | desktop-release 解析单测 | — |
| `baked-manifest-smoke.test.ts` | 辅助 | bake 后 manifest 冒烟 | — |
| `deploy-paths.test.ts` | 辅助 | deploy-paths 单测 | — |
| `generate-hero-demo-webm.ts` | 辅助 | 生成 hero-demo.webm（可选） | — |
| `release-website.test.ts` | 辅助 | release-website 单测 | — |
| `check-fractal-docs.test.ts` | 辅助 | fractal 门禁单测 | — |

## 构建链

`bun run build` → `validate:locales` → `validate:docs-slugs` → `bake:release` → `next build`

CF Pages / 本地 `bun run build` 按序执行 `validate:locales` → `validate:docs-slugs` → `bake:release` → `next build`。

**部署仅走 Cloudflare Pages Deploy Hook**（见仓根 `ARCHITECTURE.md`）；GHA 仅 `website-release.yml` 作 preflight 触发器；勿新增 workflow 或 Vercel 配置。

发布（推荐）：`git push origin website-v1.2.0` → GHA `website-release.yml`（Secret `CF_PAGES_DEPLOY_HOOK`）

本地应急：`CF_PAGES_DEPLOY_HOOK=… bun run release:website -- website-v1.2.0`

桌面联动（可选）：`myrm-agent` `trigger-website-release.sh` 代打 `website-v*` tag → 同上 GHA 触发。

安全校验（不 push tag / hook）：`RELEASE_WEBSITE_SKIP_ENV_LOCAL=1 bun run release:website:dry-run -- website-v1.2.0 --dry-run`（`SKIP_ENV_LOCAL` + `bun --no-env-file` 双重隔离 `.env.local`；**禁止**测试时不带 `--dry-run` 跑 release）
