# myrm-website/scripts 模块架构

## 文件清单

| 文件 | 地位 | 职责 | I/O/P |
|------|------|------|-------|
| `brand-url-patterns.ts` | 核心 | 禁止 legacy 域名/org 的正则；validate 脚本共用 | ✅ |
| `cp-billing-contract.json` | 核心 | 独立仓 CI 云定价回退（对齐 CP catalog/plans） | — |
| `validate-marketing-locales.ts` | 核心 | locales 键契约 + cloud 定价与 CP `catalog.py`/`plans.py` 数值对齐（本地优先读 CP，否则读 contract）+ legacy URL 扫描 | ✅ |
| `validate-docs-slugs.ts` | 核心 | 营销 slug ↔ Mintlify nav ↔ MDX orphan | ✅ |
| `bake-desktop-release.ts` | 核心 | 构建前写入 `public/desktop-release.json` | ✅ |
| `release-website.ts` | 核心 | 本地应急：preflight + push tag（GHA POST Hook） | ✅ |
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

**部署仅两条路径**（见仓根 `ARCHITECTURE.md`）：

1. `git push origin website-v1.2.0` → GHA `website-release.yml`（`CF_PAGES_DEPLOY_HOOK` 仅 GHA Secret）
2. 本地应急：`bun run release:website -- website-v1.2.0`（preflight + push tag，不 POST Hook）

禁止：`wrangler pages deploy`、Vercel、GHA `workflow_dispatch`、本地/跨仓直接 POST Hook。

安全校验（不 push tag）：`bun run release:website:dry-run -- website-v1.2.0 --dry-run`（**禁止**不带 `--dry-run` 跑 release）
