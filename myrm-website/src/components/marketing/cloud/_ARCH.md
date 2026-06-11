# Cloud Marketing Page

## 路由

| 路由 | 组件 | i18n |
|------|------|------|
| `/cloud` | `LandingCloud.tsx` | `cloud.*` |
| `/pricing` | 302 → `/cloud` | — |

## 定位

SaaS 转化页，与开源首页 `/` 分离。当前 `robots: noindex`，首页不链入。

## 文件

| 文件 | 职责 |
|------|------|
| `LandingCloud.tsx` | Hero · 三步 · 定价 · FAQ · Final CTA |
| `CloudShell.tsx` | 顶栏 + 页脚（含链回 `/` 自托管） |
| `cloud-marketing-keys.ts` | `CLOUD_PLAN_KEYS` / `CLOUD_FAQ_KEYS` / `CLOUD_STEP_KEYS` |
| `../../lib/cloud-paths.ts` | App 登录/注册/账单 URL + UTM |
| `../../lib/cloud-marketing-nav.ts` | 云页 Nav |

## 上线

见 `docs/CLOUD_HOSTING_RESTORE.md`。
