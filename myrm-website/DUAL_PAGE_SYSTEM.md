# 双营销页系统设计（OSS `/` vs SaaS `/cloud`）

## 设计目标

在 `myrmagent.ai` 上维护两条独立转化路径，避免开源自托管与云端 SaaS 叙事混在同一 Landing 造成定位模糊（「四不像」）。

| 路由 | 受众 | 首页链入 | SEO |
|------|------|----------|-----|
| `/` | 开源 / 自托管 | 是 | index |
| `/cloud` | 云端 SaaS | 否（上线前） | `noindex` |

`/pricing` 经 `public/_redirects` 302 → `/download`（云上线前）；推广 SaaS 后改指 `/cloud`。

## 系统架构

```
                    myrmagent.ai
                         │
           ┌─────────────┴─────────────┐
           ▼                           ▼
      src/app/page.tsx           src/app/cloud/page.tsx
           │                           │
   LandingEditorial.tsx         LandingCloud.tsx
   marketing.* i18n             cloud.* i18n
   deploy-paths (local+desktop)  cloud-paths (App+UTM)
           │                           │
           └─────────┬─────────────────┘
                     ▼
            lib/deploy-mode.ts (外链 SSOT)
                     ▼
         app.myrmagent.ai / docs.myrmagent.ai
```

## 核心组件

### 开源页 `/`

- **编排**：`src/components/marketing/LandingEditorial.tsx`
- **i18n**：`locales/*.json` → `marketing.*`
- **部署路径**：`src/lib/deploy-paths.ts`（仅 `localWebui` + `tauri`）
- **区块顺序**：Hero → WorkspacePreview → HowItWorks → QuickStart → Marquee → Advantages → Benchmark → HighlightsCarousel → UseCases → Deploy → Integrations → Testimonials → WhyMyrmAgent → FAQ → Final CTA
- **禁止**：云登录、WU 定价、SaaS CTA

### 云端 SaaS 页 `/cloud`

- **编排**：`src/components/marketing/cloud/LandingCloud.tsx` + `CloudShell.tsx`
- **预览**：`landing/WorkspacePreview.tsx`（`messagesNamespace="cloud"`、`shell="shell"`）
- **i18n**：`cloud.*`（与 `marketing.*` 隔离）
- **URL**：`src/lib/cloud-paths.ts`（登录/注册/账单 → `app.myrmagent.ai`，`utm_campaign=cloud`）
- **Nav**：`src/lib/cloud-marketing-nav.ts`
- **键契约**：`cloud/cloud-marketing-keys.ts`（`free|companion|plus|pro|max`）
- **定价 SSOT**：运行时 App 读 CP `GET /api/billing/catalog`；官网 `cloud.pricingPreview.*` 为静态 i18n，**build 前** `validate-marketing-locales.ts` 自动比对 CP `catalog.py` + `plans.py`
- **区块顺序**：Hero → WorkspacePreview → How it works → Pricing → FAQ → Final CTA
- **页脚**：链回 `/` 自托管；含 Privacy · Terms · Refund（OSS `/` 页脚无 Refund）

### 法务页

- 路由：`/privacy`、`/terms`、`/refund`
- i18n：`marketing.legal.*`（覆盖网站、自托管、桌面与 Cloud）
- 组件：`LegalPage.tsx` + `MarketingShell.tsx`

## 文件映射

| 文件 | 职责 |
|------|------|
| `src/app/page.tsx` | OSS 首页路由 |
| `src/app/cloud/page.tsx` | SaaS 页路由（`robots: noindex`） |
| `src/lib/deploy-paths.ts` | 本地/桌面部署 registry |
| `src/lib/cloud-paths.ts` | SaaS App URL + UTM |
| `src/lib/cloud-marketing-nav.ts` | 云页 Nav |
| `src/components/marketing/cloud/LandingCloud.tsx` | SaaS 编排 |
| `src/components/marketing/cloud/CloudShell.tsx` | SaaS 壳层 |
| `src/components/marketing/cloud/cloud-marketing-keys.ts` | 定价/FAQ/步骤 i18n 键 |
| `src/components/marketing/landing/WorkspacePreview.tsx` | 双页共用产品预览 |
| `locales/en.json` / `zh.json` | `marketing.*` + `cloud.*` |

## 云页上线清单

1. 移除 `src/app/cloud/page.tsx` 中 `robots: { index: false }`
2. `src/app/sitemap.ts` 加入 `/cloud`
3. 可选：OSS `/` 页脚或 Nav 加入 `/cloud` 入口
4. 更新 `cloud.*` 文案（若定价变动）
5. `public/_redirects`：`/pricing` 302 → `/cloud`
6. `bun run validate:locales && bun run build`

## 不推荐：合并回单页

若强行合并 SaaS 回首页：

1. `DEPLOY_PATH_IDS` 重新加入 `saas`
2. `cloud.*` 键并入 `marketing.*`
3. 删除 `/cloud` 路由

**建议保持双页分离。**

## 参考资料

- [src/components/marketing/_ARCH.md](src/components/marketing/_ARCH.md)
- [src/components/marketing/cloud/_ARCH.md](src/components/marketing/cloud/_ARCH.md)
- [src/lib/deploy-paths.ts](src/lib/deploy-paths.ts)
