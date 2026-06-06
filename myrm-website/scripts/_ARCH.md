# myrm-website/scripts 模块架构

## 文件清单

| 文件 | 地位 | 职责 |
|------|------|------|
| `brand-url-patterns.ts` | 核心 | 禁止 legacy 域名/org 的正则；validate 脚本共用 |
| `validate-marketing-locales.ts` | 核心 | locales 键契约 + pricingPreview ↔ pricingPage + legacy URL |
| `validate-docs-slugs.ts` | 核心 | 营销 slug ↔ Mintlify nav ↔ MDX；orphan MDX；docs legacy URL；zh `competitor-comparison` 英文句零容忍（`ZH_CONTENT_ZERO_TOLERANCE` 单页集合） |
| `docs-contract.test.ts` | 辅助 | `localizedDocsPath` / `getDocsUrl` / `getAppUrl` locale 单测 |
| `bake-desktop-release.ts` | 核心 | 构建前写入 `public/desktop-release.json` |
| `desktop-release.test.ts` | 辅助 | desktop-release 解析单测 |
| `deploy-paths.test.ts` | 辅助 | deploy-paths 单测 |
| `generate-hero-demo-webm.ts` | 辅助 | 从 workspace 预览图生成 hero-demo.webm（可选） |

## 构建链

`bun run build` → `validate:locales` → `validate:docs-slugs` → `bake:release` → `next build`

CF Pages / 本地 `bun run build` 按序执行 `validate:locales` → `validate:docs-slugs` → `bake:release` → `next build`。
