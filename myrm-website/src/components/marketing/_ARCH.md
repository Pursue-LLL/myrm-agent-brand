# Marketing Components Architecture

## 概述

`myrm-website` 是独立的闭源营销官网，承载纯展示性页面。登录、支付等操作通过 `getAppUrl()` 跳转 `app.myrmagent.ai`。

## 页面路由

| 路由 | 说明 |
|------|------|
| `/` | Landing Page（LandingEditorial） |
| `/download` | 桌面端下载（embedded JSON + 平台矩阵 + release notes + 安装步骤 + SHA256） |
| `/pricing` | 轻量定价展示（CTA 跳转 App） |
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
| `LandingEditorial.tsx` | 核心 | 主 Landing 编排 | — |
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
| `MarketingShell.tsx` | 核心 | 法务页布局 | — |
| `LegalPage.tsx` | 辅助 | 法务页模板 | — |
| `landing/marketing-keys.ts` | 核心 | Bento/对比表/折叠区 i18n 键清单（`validate:locales`） | — |
| `../../lib/marketing-nav.ts` | 核心 | 共享 Nav 链接 DRY（`buildMarketingNavLinks`） | — |
| `landing/marketing-i18n.ts` | 辅助 | 类型安全的 `marketingHas` | — |
| `landing/AdvantagesSection.tsx` | 核心 | 六项 Bento 核心能力 | ✅ |
| `landing/EngineeringDepthSection.tsx` | 核心 | 折叠工程深度 + docs 对比链 | ✅ |
| `landing/BenchmarkSection.tsx` | 核心 | Token 实测数字条 | — |
| `landing/WhyMyrmAgentSection.tsx` | 核心 | 竞品对比表（分类 Tab + 行过滤） | — |
| `landing/WorkspacePreview.tsx` | 核心 | Hero 产品预览（浏览器框 + WebP；有 `hero-demo.webm` 时播录屏/生成动效） | — |
| `landing/colony/` | 辅助 | Hero 蚁群 Canvas | 见 `colony/_ARCH.md` |
| `landing/TestimonialsSection.tsx` | 辅助 | 用户评价 | — |
| `landing/FooterSection.tsx` | 辅助 | 页脚 | — |
| `landing/QuickStartSection.tsx` | 核心 | 快速开始（路径 Tab + 深链） | ✅ |

## Landing 区块顺序（LandingEditorial.tsx）

Hero → WorkspacePreview → HowItWorks（路径 Tab）→ QuickStart → Marquee → **Advantages（6 Bento）** → Benchmark → **EngineeringDepth（折叠 4 组）** → UseCases → Deploy（矩阵）→ Integrations → Testimonials → WhyMyrmAgent → Pricing → FAQ → Final CTA（PathStrip 收口，无单独 SaaS 按钮）

## 外部链接

| 函数 | 环境变量 | 默认 |
|------|----------|------|
| `getAppUrl()` | `NEXT_PUBLIC_APP_URL` | `https://app.myrmagent.ai` |
| `getDocsUrl()` | `NEXT_PUBLIC_DOCS_URL` | `https://docs.myrmagent.ai` |
| `getDesktopDownloadPath()` | — | `/download` |
| `getDeployPathHref()` / `getDeployPathSectionLink()` | — | 见 `lib/deploy-paths.ts` |
| `buildMarketingNavLinks()` | — | 见 `lib/marketing-nav.ts` |
| `getGitHubReleasesPageUrl()` | `NEXT_PUBLIC_GITHUB_RELEASE_REPO` | GitHub latest release |

工程深度区竞品全文对比：`getDocsUrl('/getting-started/competitor-comparison')`

## i18n

- `locales/zh.json` + `locales/en.json`：`marketing` 命名空间
- **首屏 Bento**：`advantages.items` — 仅 `memory` / `webSearchFetch` / `security` / `orchestration` / `deployment` / `migration`，每卡 ≤3 个 `pointN`
- **工程深度**：`engineeringDepth.groups.*` + 复用 `highlights.items` / `extendedHighlights.items` / 部分 `advantages.items`；桌面端 `automation`+`knowledge` 默认展开，`<md` 全部折叠（`useMinWidth`）
- **advantages.items 键**：`BENTO_KEYS` ∪ `depthAdvantageItemKeys()`（深度区专用四项，非首屏 Bento）
- **Bento 证据链**：`BENTO_DOC_PATHS` 按主题映射 docs 竞品对比锚点
- **对比表**：`whyMyrmAgent.rows.*` + `whyMyrmAgent.tabs.*`（`COMPARE_TAB_ROWS` 映射）
- **迁移 CTA**：主链 `/download`；次链 `getAppLoginRedirectUrl(APP_MIGRATION_WIZARD_PATH)`（Local 已部署用户）
- **同步规则**：见 `temp-docs/materials/COMPETITIVE_ADVANTAGE.md` 官网落地页条款；禁止脚本批量灌入 7+ bullet
- **键校验**：`bun run validate:locales`（`scripts/validate-marketing-locales.ts` + `landing/marketing-keys.ts`）；`bun run build` 前自动执行

## 与 App 的关系

- CTA 经 `getAppUrl()` 跳转 App
- 文档经 `getDocsUrl()` 跳转文档站
- Pricing 为静态展示，订阅在 App 完成

## 部署

- CI/CD：GitHub Actions + Vercel
- 域名：`myrm.ai`
- 本地开发：`bun run dev:3002`（端口 3002，与 App 3000 分离）
- 桌面 release bake：`bun run bake:release`（写入 `public/desktop-release.json`；CI 使用 `GITHUB_TOKEN`）
- Hero 动效：`public/marketing/hero-demo.webm`；从预览图生成：`bun run generate:hero-webm`（可用真实 App 录屏覆盖）

桌面下载模块详情见 [`download/_ARCH.md`](../download/_ARCH.md)。
