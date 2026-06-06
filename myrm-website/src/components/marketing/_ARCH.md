# Marketing Components Architecture

## 概述

`myrm-website` 是 `myrm-agent-brand` 仓内的 Next.js 营销站（Cloudflare Pages → `myrmagent.ai`）。纯展示页；App CTA 经 `getAppUrl(path, docsLocale)` 跳转 `app.myrmagent.ai`；文档经 `getDocsUrl()` 跳转 `docs.myrmagent.ai`。

## 页面路由

| 路由 | 说明 |
|------|------|
| `/` | Landing Page（LandingEditorial） |
| `/download` | 桌面端下载（embedded JSON + 平台矩阵 + release notes + 安装步骤 + SHA256） |
| `/pricing` | 定价展示（`pricingPage.plans` i18n；CTA 跳转 App 账单） |
| `/terms` | 服务条款 |
| `/privacy` | 隐私政策 |
| `/refund` | 退款政策 |
| 404 | 品牌化 Not Found（`not-found.tsx`） |

## SEO

- `sitemap.ts`：`/sitemap.xml`
- `robots.ts`：`/robots.txt`
- `layout.tsx`：Open Graph + Twitter Card + robots metadata

## 组件结构

| 文件 | 地位 | 职责 | I/O |
|------|------|------|-----|
| `LandingEditorial.tsx` | 核心 | 主 Landing 编排 | ✅ |
| `download/SmartDownloadButton.tsx` | 核心 | OS 智能下载 CTA | ✅ |
| `download/DownloadPageContent.tsx` | 核心 | `/download` 页编排 | ✅ |
| `download/PlatformDownloadGrid.tsx` | 核心 | 平台矩阵 + Recommended + size | ✅ |
| `download/ReleaseNotesSection.tsx` | 辅助 | Release notes | ✅ |
| `download/InstallStepsSection.tsx` | 辅助 | 三平台安装引导 | ✅ |
| `download/ChecksumSection.tsx` | 辅助 | SHA256 内联 + 复制 | ✅ |
| `landing/DeploySection.tsx` | 核心 | 三部署模式卡片 + 决策对比矩阵 | ✅ |
| `landing/HeroTypography.tsx` | 辅助 | Hero 多行标题 + differentiator flex 条 | — |
| `landing/PathStrip.tsx` | 核心 | Hero / Final CTA 三路径 chip 条 | ✅ |
| `landing/HowItWorksSection.tsx` | 核心 | 路径 Tab 化三步上手 | ✅ |
| `landing/deploy-path-context.tsx` | 核心 | HowItWorks + QuickStart 共享路径 Tab 状态 | — |
| `../../lib/deploy-paths.ts` | 核心 | 部署路径 registry（href/UTM/hash） | — |
| `MarketingShell.tsx` | 核心 | 法务/定价页顶栏壳层 | ✅ |
| `LegalPage.tsx` | 辅助 | 法务页模板 | — |
| `landing/marketing-keys.ts` | 核心 | Bento/对比表/折叠区 i18n 键清单（`validate:locales`） | — |
| `../../lib/marketing-nav.ts` | 核心 | 共享 Nav 链接 DRY（`buildMarketingNavLinks`） | — |
| `landing/marketing-i18n.ts` | 辅助 | 类型安全的 `marketingHas` | — |
| `landing/AdvantagesSection.tsx` | 核心 | 六项 Bento 核心能力 | ✅ |
| `landing/EngineeringDepthSection.tsx` | 核心 | 折叠工程深度 + docs 对比链 | ✅ |
| `landing/BenchmarkSection.tsx` | 核心 | Token 实测数字条 | — |
| `landing/WhyMyrmAgentSection.tsx` | 核心 | 竞品对比表（分类 Tab + 行过滤） | — |
| `landing/WorkspacePreview.tsx` | 备用 | 产品预览组件（录屏就绪后在 LandingEditorial 挂载） | — |
| `landing/colony/` | 辅助 | Hero 蚁群 Canvas | 见 `colony/_ARCH.md` |
| `landing/TestimonialsSection.tsx` | 辅助 | 用户评价 | — |
| `landing/FooterSection.tsx` | 辅助 | 页脚（docs locale 深链） | ✅ |
| `landing/QuickStartSection.tsx` | 核心 | 快速开始（路径 Tab + 深链） | ✅ |

## Landing 区块顺序（LandingEditorial.tsx）

Hero → HowItWorks（路径 Tab）→ QuickStart → Marquee → **Advantages（6 Bento）** → Benchmark → **EngineeringDepth（5 组）** → UseCases → Deploy（矩阵）→ Integrations → Testimonials → WhyMyrmAgent → Pricing → FAQ → Final CTA（PathStrip 收口）

## 外部链接

| 函数 | 环境变量 | 默认 |
|------|----------|------|
| `getAppUrl(path, locale?)` | `NEXT_PUBLIC_APP_URL` | `https://app.myrmagent.ai`；CTA 附 `?locale=en\|zh` 接力 App `NEXT_LOCALE` |
| `getDocsUrl(path, locale?)` | `NEXT_PUBLIC_DOCS_URL` | `https://docs.myrmagent.ai`；zh 前缀 `/zh/` |
| 文档路径契约 | `lib/docs-contract.ts` | `localizedDocsPath()`；双 locale CI `validate:docs-slugs` |
| 文档 locale | `hooks/useDocsLocale.ts` | 营销组件按站点 locale 生成 docs 链接 |
| `getDesktopDownloadPath()` | — | `/download` |
| `getDeployPathHref()` / `getDeployPathSectionLink()` | — | 见 `lib/deploy-paths.ts` |
| `buildMarketingNavLinks()` | — | 见 `lib/marketing-nav.ts` |
| `getGitHubReleasesPageUrl()` | `NEXT_PUBLIC_GITHUB_RELEASE_REPO` | GitHub latest release |

工程深度区竞品全文对比：`getDocsUrl(COMPETITOR_COMPARISON_DOC_PATH, docsLocale)`

## i18n

- `locales/zh.json` + `locales/en.json`：`marketing` 命名空间
- **首屏 Bento**：`advantages.items` — 仅 `BENTO_KEYS`（`selfEvolution` / `security` / `reliability` / `costEfficiency` / `visualControl` / `taskModes`），每卡 ≤3 个 `pointN`
- **工程深度**：`engineeringDepth.groups.*` + 复用 `highlights.items` / `extendedHighlights.items` / 部分 `advantages.items`；桌面端侧栏默认选中 `compounding`（`marketing-keys.ts` 唯一 `defaultOpen: true`）；`<md` 手风琴默认全折叠（`useMinWidth`）
- **advantages.items 键**：`BENTO_KEYS` ∪ `depthAdvantageItemKeys()`（深度区专用四项，非首屏 Bento）
- **Bento 细节**：首屏六项仅展示要点；完整竞品对比链见 `EngineeringDepthSection` → `getDocsUrl(COMPETITOR_COMPARISON_DOC_PATH, docsLocale)`
- **对比表**：`whyMyrmAgent.rows.*` + `whyMyrmAgent.tabs.*`（`COMPARE_TAB_ROWS` 映射）
- **定价页**：`/pricing` 使用 `pricingPage.plans.*`（`PRICING_PAGE_PLAN_KEYS`）；Landing 预览仍用 `pricingPreview.*`
- **迁移 CTA**：主链 `/download`；次链 `getAppLoginRedirectUrl(APP_MIGRATION_WIZARD_PATH)`（Local 已部署用户）
- **同步规则**：落地页 Bento / 对比表条款与 `getDocsUrl(COMPETITOR_COMPARISON_DOC_PATH, docsLocale)` 保持一致；禁止脚本批量灌入 7+ bullet
- **键校验**：`bun run validate:locales`（含 pricingPreview ↔ pricingPage、locales legacy URL）+ `bun run validate:docs-slugs`（含 orphan MDX + docs legacy URL）；`bun run build` 前自动执行

## 与 App 的关系

- CTA 经 `getAppUrl(path, docsLocale)` 跳转 App；App `middleware.ts` 写 cookie；登录后 `locale-personal-sync` 写 `personalSettings`
- 文档经 `getDocsUrl()` 跳转文档站
- Pricing 为静态展示，订阅在 App 完成

## 品牌静态资源（`public/brand/`）

仅保留代码引用的格式；`BrandLogo.tsx` 与 `layout.tsx` 为唯一消费方。

| 文件 | 用途 |
|------|------|
| `logo-icon-32.png` / `logo-icon-192.png` | Favicon / Apple touch（`layout.tsx`） |
| `logo-icon-80.webp` / `logo-icon-128.webp` / `logo-icon.webp` | `BrandLogo` icon 尺寸阶梯 |
| `logo-wordmark.webp` / `logo-wordmark-light-text.webp` | `BrandLogo` wordmark（深/浅底） |
| `logo-full.jpg` | `BrandLogo` full 变体 |

## 部署

- 生产：**CF Pages Git**（push `main` → `bun run build` → 部署）；合并前本地 `bun run build` 校验
- 应急：本地 build + `wrangler pages deploy out --project-name=myrm-agent-brand`；`public/_redirects` install 短链
- 域名：`myrmagent.ai`
- 本地开发：`bun run dev:3002`（端口 3002，与 App 3000 分离）
- 桌面 release bake：`bun run bake:release`（写入 `public/desktop-release.json`；可选 `GITHUB_TOKEN` 提高 API 限额）
- Hero 动效：`public/marketing/hero-demo.webm`；从预览图生成：`bun run generate:hero-webm`（可用真实 App 录屏覆盖）

桌面下载模块详情见 [`download/_ARCH.md`](../download/_ARCH.md)。
