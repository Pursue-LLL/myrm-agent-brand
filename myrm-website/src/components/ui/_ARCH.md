# components/ui 模块架构

## 架构概述

shadcn 风格基础 UI  primitives；营销站局部使用，非完整 design system。

## 文件清单

| 文件 | 地位 | 职责 | I/O/P |
|------|------|------|-------|
| `button.tsx` | 辅助 | Radix Slot + CVA 按钮变体 | — |
| `carousel.tsx` | 核心 | Embla Carousel 封装（亮点轮播） | — |

## 模块依赖

- `lib/utils/classnameUtils.ts`（`cn()`）
