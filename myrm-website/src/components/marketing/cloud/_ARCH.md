# Cloud Marketing Page

## 路由

| 路由 | 组件 | i18n |
|------|------|------|
| `/cloud` | `LandingCloud.tsx` | `cloud.*` |
| `/pricing` | 302 → `/cloud` |

## 架构概述

SaaS 转化页，与开源首页 `/` 分离。复用 `landing-editorial.css` 视觉体系（`ed-*` token、TiltCard、scroll reveal）。OSS 页脚链入 `/cloud`。详细设计见 [DUAL_PAGE_SYSTEM.md](../../../../DUAL_PAGE_SYSTEM.md)。

## 区块顺序

Hero → Advantages → HowItWorks → UseCases → Pricing → Trust → FAQ → Final CTA

## 文件清单

| 文件 | 地位 | 职责 | I/O/P |
|------|------|------|-------|
| `LandingCloud.tsx` | 核心 | 主编排 + scroll reveal 容器 | ✅ |
| `CloudShell.tsx` | 核心 | editorial 顶栏 + 页脚 + scroll progress | ✅ |
| `CloudHeroSection.tsx` | 核心 | Hero（DifferentiatorStrip + MagneticButton） | ✅ |
| `CloudAdvantagesSection.tsx` | 核心 | 4 项 Bento 优势卡 | ✅ |
| `CloudHowItWorksSection.tsx` | 核心 | 3 步上手 TiltCard | ✅ |
| `CloudUseCasesSection.tsx` | 核心 | 3 场景用例卡 | ✅ |
| `CloudPricingSection.tsx` | 核心 | 定价预览（Companion 推荐标 + WU 说明条；Max 含 8C/200GB） | ✅ |
| `CloudTrustSection.tsx` | 核心 | Creem MoR / 安全 / 支持 | ✅ |
| `CloudFaqSection.tsx` | 核心 | FAQ（ed-faq 样式，7 条） | ✅ |
| `CloudFinalCtaSection.tsx` | 核心 | 页尾 Final CTA | ✅ |
| `cloud-marketing-keys.ts` | 核心 | 定价/FAQ/步骤/优势/场景/信任 i18n 键 SSOT | ✅ |
| `../../lib/cloud-paths.ts` | 核心 | App 登录/注册/账单 URL + UTM | ✅ |
| `../../lib/cloud-marketing-nav.ts` | 核心 | 云页 Nav | ✅ |

## 上线

见 [DUAL_PAGE_SYSTEM.md](../../../../DUAL_PAGE_SYSTEM.md)「云页上线清单」。
