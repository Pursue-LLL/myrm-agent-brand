# landing 模块架构

## 架构概述

开源首页 `/` 的 section 组件与共享 landing 工具；SaaS `/cloud` 复用部分组件（如 `WorkspacePreview`）。双页设计见 [DUAL_PAGE_SYSTEM.md](../../../../DUAL_PAGE_SYSTEM.md)。

## 编排入口

`../LandingEditorial.tsx` 按固定顺序挂载下列 section。

## Section 文件清单

| 文件 | 地位 | 职责 | I/O/P |
|------|------|------|-------|
| `HeroTypography.tsx` | 核心 | Hero 多行标题排版 | ✅ |
| `WorkspacePreview.tsx` | 核心 | 产品预览（OSS editorial / cloud shell 双模式） | ✅ |
| `HowItWorksSection.tsx` | 核心 | 路径 Tab 三步上手 | ✅ |
| `QuickStartSection.tsx` | 核心 | Quick Start 面板 | ✅ |
| `QuickStartPanel.tsx` | 核心 | Quick Start 内容区 | ✅ |
| `IntegrationMarquee.tsx` | 辅助 | 集成 logo 跑马灯 | — |
| `integration-marquee-icons.tsx` | 辅助 | Marquee 图标集 | — |
| `AdvantagesSection.tsx` | 核心 | 优势 Bento | ✅ |
| `BenchmarkSection.tsx` | 辅助 | 竞品对比表 | — |
| `HighlightsCarouselSection.tsx` | 核心 | 8 卡亮点轮播 | ✅ |
| `DeploySection.tsx` | 核心 | 部署模式卡片 + 对比矩阵 | ✅ |
| `TestimonialsSection.tsx` | 辅助 | 用户评价（暂未挂载，待真实用户证言后恢复） | — |
| `WhyMyrmAgentSection.tsx` | 辅助 | 差异化叙事 | — |
| `UseCasesSection.tsx` | 核心 | 场景卡片网格 | ✅ |
| `IntegrationsSection.tsx` | 辅助 | LLM / 工具集成 chip 列表（locale ` · ` 短标签） | ✅ |
| `FaqSection.tsx` | 核心 | OSS 首页 FAQ（`#faq`） | ✅ |
| `FinalCtaSection.tsx` | 核心 | 页尾 Final CTA + PathStrip | ✅ |
| `FooterSection.tsx` | 核心 | 页脚 | ✅ |
| `PathStrip.tsx` | 核心 | Final CTA 双路径 chip | ✅ |
| `deploy-path-context.tsx` | 核心 | HowItWorks + QuickStart 共享路径状态 | ✅ |
| `marketing-keys.ts` | 核心 | OSS i18n 键契约（含 USE_CASE / FAQ 键） | ✅ |
| `marketing-i18n.ts` | 辅助 | section 文案读取工具 | ✅ |
| `landing-interaction.ts` | 辅助 | Landing 滚动/光标/计数交互 hooks | ✅ |
| `hero-viewport.ts` | 辅助 | Hero 视口计算 | — |
| `interactive.tsx` | 辅助 | 磁吸按钮等交互 | — |
| `landing-editorial.css` | 配置 | Landing 专用样式 | — |

## 子模块

| 目录 | 文档 |
|------|------|
| `colony/` | [colony/_ARCH.md](colony/_ARCH.md) — Hero Canvas 蚁群动画 |
