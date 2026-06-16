# marketing 模块架构

## 概述

`myrm-website` 是 `myrm-agent-brand` 仓内的 Next.js 营销站（Cloudflare Pages → `myrmagent.ai`）。纯展示页；App CTA 经 `getAppUrl(path, docsLocale)` 跳转 `app.myrmagent.ai`；文档经 `getDocsUrl()` 跳转 `docs.myrmagent.ai`。双页技术方案见 [DUAL_PAGE_SYSTEM.md](../../DUAL_PAGE_SYSTEM.md)；Landing sections 见 [landing/_ARCH.md](landing/_ARCH.md)。

**双页面架构：**

| 路由 | 定位 | 首页链入 |
|------|------|----------|
| `/` | 开源 / 自托管（`LandingEditorial`） | 是 |
| `/cloud` | 云端 SaaS（`cloud/LandingCloud`） | 否（`noindex`，约一个月后推广） |

## 页面路由

| 路由 | 说明 |
|------|------|
| `/` | 开源 Landing（Local WebUI + 桌面客户端） |
| `/cloud` | 云端 SaaS Landing（WU 定价、登录 App） |
| `/download` | 桌面端下载 |
| `/pricing` | 302 → `/download`（云上线前）；上线后改回 `/cloud` |
| `/terms` | 服务条款 |
| `/privacy` | 隐私政策 |
| `/refund` | 退款政策 |
| 404 | 品牌化 Not Found（`not-found.tsx`） |

## SEO

- `sitemap.ts`：`/`、`/download`、法务页（不含 `/cloud`，因 noindex）
- `robots.ts`：`/robots.txt`
- `layout.tsx`：Open Graph + Twitter Card + robots metadata
- `/cloud`：`generateMetadata` 设 `robots: { index: false }`

## 组件结构

| 文件 | 地位 | 职责 | I/O/P |
|------|------|------|-------|
| `LandingEditorial.tsx` | 核心 | 开源首页编排；Hero 桌面下载主 CTA + 本地 Quick Start 次 CTA | ✅ |
| `cloud/LandingCloud.tsx` | 核心 | SaaS 页编排 | ✅ |
| `cloud/CloudShell.tsx` | 核心 | SaaS 页顶栏/页脚 | ✅ |
| `download/*` | 核心 | 桌面下载转化 |
| `landing/WorkspacePreview.tsx` | 核心 | 产品预览（OSS editorial / cloud shell 双 chrome） |
| `landing/DeploySection.tsx` | 核心 | 两部署模式卡片 + 对比矩阵（localWebui + tauri） |
| `landing/PathStrip.tsx` | 核心 | Final CTA 双路径 chip（Hero 用主按钮，不重复） |
| `landing/HowItWorksSection.tsx` | 核心 | 路径 Tab 三步上手 |
| `landing/deploy-path-context.tsx` | 核心 | HowItWorks + QuickStart 共享路径状态 |
| `../../lib/deploy-paths.ts` | 核心 | 本地/桌面部署路径 registry |
| `../../lib/cloud-paths.ts` | 核心 | SaaS App URL + UTM |
| `../../lib/marketing-nav.ts` | 核心 | Nav DRY；Header → `/download`；Hero 次 CTA → local QuickStart |
| `../../lib/cloud-marketing-nav.ts` | 核心 | SaaS 页 Nav |
| `MarketingShell.tsx` | 核心 | 非 Landing 页共享壳层（下载/法务） | ✅ |
| `LegalPage.tsx` | 核心 | 法务页 section 排版 | ✅ |
| `landing/HighlightsCarouselSection.tsx` | 核心 | 8 张亮点轮播（Embla 垂直 + 左栏导览）；IO 离屏停播 |
| `landing/UseCasesSection.tsx` | 核心 | 四场景用例卡片 |
| `landing/IntegrationsSection.tsx` | 辅助 | LLM / 工具 chip 列表（locale ` · ` 短标签，≤48 字/chip） | ✅ |
| `landing/FaqSection.tsx` | 核心 | OSS FAQ（`#faq`） | ✅ |
| `landing/FinalCtaSection.tsx` | 核心 | 页尾 Final CTA + PathStrip | ✅ |
| `ui/carousel.tsx` | 核心 | Embla Carousel 封装（shadcn 同款） |
| `landing/marketing-keys.ts` | 核心 | Bento/对比/轮播/用例/FAQ i18n 键清单 |
| `cloud/cloud-marketing-keys.ts` | 核心 | SaaS 定价/FAQ/步骤键清单 |

云页详情见 [`cloud/_ARCH.md`](cloud/_ARCH.md)。

## Landing 区块顺序（`/` LandingEditorial）

Hero → WorkspacePreview → HowItWorks → QuickStart → Marquee → Advantages → Benchmark → HighlightsCarousel → UseCases → Deploy → Integrations → WhyMyrmAgent → FAQ → Final CTA

（无 Pricing 区块；无 SaaS 路径。）

## SaaS 页区块顺序（`/cloud` LandingCloud）

Hero → WorkspacePreview → How it works → Pricing → FAQ → Final CTA

## 外部链接

| 函数 | 用途 |
|------|------|
| `getAppUrl(path, locale?)` | App CTA |
| `getDocsUrl(path, locale?)` | 文档站 |
| `getMarketingRegisterHref()` | Header ed-cta → `/download` |
| `getMarketingQuickStartHref()` | Hero 次 CTA → `?path=local#quickstart` |
| `getMarketingLoginHref()` | Nav「本地部署文档」→ localWebui docs |
| `getCloudLoginHref()` / `getCloudRegisterHref()` | SaaS 登录/注册 |
| `buildMarketingNavLinks()` | 开源页 Nav |
| `buildCloudNavLinks()` | SaaS 页 Nav |

## i18n

- `marketing.*` — 开源首页 `/`
- `cloud.*` — SaaS 页 `/cloud`
- **键校验**：`bun run validate:locales`（marketing 深度卡 + legal 法务键 + cloud 定价/FAQ/步骤/demo）+ `validate:docs-slugs`

## 与 App 的关系

- 开源页 CTA → Hero 桌面下载（主）或本地 Quick Start（次）；Final CTA PathStrip 桌面 chip 优先
- SaaS 页 CTA → `app.myrmagent.ai/auth/login`（UTM `campaign=cloud`）
- 订阅在 App 内完成

## 部署

- 生产：CF Pages Deploy Hook（`bun run release:website`）
- 本地：`bun run dev:3002`
- 双页设计：[DUAL_PAGE_SYSTEM.md](../../DUAL_PAGE_SYSTEM.md)

桌面下载模块见 [`download/_ARCH.md`](download/_ARCH.md)。
