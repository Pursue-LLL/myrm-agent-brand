# Hero Colony Scene

## 概述
Hero 区统一 Canvas 场景：交互 Grid 点阵 + 蚂蚁 Agent 模拟（信息素场仅参与寻路，不绘制 heatmap）。单 rAF 循环，DOM 锚点驱动工作区吸引。

## 文件清单
| 文件 | 职责 | I/O/P |
|------|------|-------|
| `types.ts` | 场景类型与调色常量 | ✅ |
| `pheromone-field.ts` | 信息素栅格 deposit/decay/gradient | ✅ |
| `ant-simulation.ts` | 蚂蚁 step 与初始化 | ✅ |
| `ant-sprite.ts` | 侧视蚂蚁高 DPI 离屏精灵 | ✅ |
| `draw-scene.ts` | Grid + 精灵绘制调度 | ✅ |
| `useColonyCanvas.ts` | Canvas 生命周期与模拟调度 | ✅ |
| `ColonyLayer.tsx` | React 挂载层 | ✅ |

## 锚点协议
- 根容器：`data-colony-root`（LandingEditorial Hero 包裹层）
- 工作锚点：`data-colony-anchor="cta"`（`preview` 锚点在产品预览区块挂载时启用）
- 同步：200ms 节流 + resize 即时刷新

## 性能与无障碍
- 桌面 28 蚁 / 移动 8 蚁；60fps rAF；Grid 离屏缓存；鼠标靠近蚂蚁 **闪避**
- Canvas 与内容层 **无 parallax 偏移**（锚点与 DOM 对齐）
- `prefers-reduced-motion`：静态帧，不跑模拟循环
- Hero 不可见时（`data-colony-root` IO，ratio ≤3%）**完全暂停** rAF 与模拟；同步 `data-colony-active="true|false"`
- `MouseGlowLayer` 全页跟随鼠标（仅 tab 隐藏时停）；不与 Hero IO 绑定

## 依赖
- `LandingEditorial.tsx` 挂载 `ColonyLayer` 与锚点 DOM
- 主题色：`--ed-accent` / `--ed-accent-warm`（draw-scene 硬编码与 CSS 一致）
