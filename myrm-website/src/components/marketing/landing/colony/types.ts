/**
 * [INPUT]
 * - 无外部模块依赖
 *
 * [OUTPUT]
 * - 场景类型、调色常量、Grid 参数
 *
 * [POS]
 * Hero Colony 场景的类型定义层。
 */

export interface Vec2 {
  x: number;
  y: number;
}

export interface WorkAnchor {
  id: string;
  x: number;
  y: number;
  radius: number;
  strength: number;
}

export type AntTone = 'teal' | 'warm';

export interface AntAgent {
  x: number;
  y: number;
  angle: number;
  speed: number;
  carrying: boolean;
  tone: AntTone;
  wanderPhase: number;
  anchorId: string | null;
}

export interface CanvasMetrics {
  width: number;
  height: number;
  dpr: number;
}

export interface MouseState {
  x: number;
  y: number;
  active: boolean;
}

export interface ColonyRuntime {
  ants: AntAgent[];
  pheromoneCols: number;
  pheromoneRows: number;
  antCount: number;
  reducedMotion: boolean;
  mobile: boolean;
}

export interface ScenePalette {
  teal: { r: number; g: number; b: number };
  warm: { r: number; g: number; b: number };
}

export const SCENE_PALETTE: ScenePalette = {
  teal: { r: 88, g: 142, b: 149 },
  warm: { r: 255, g: 140, b: 0 },
};

export const GRID_GAP = 40;
export const GRID_DOT_RADIUS = 1;
export const MOUSE_INFLUENCE_RADIUS = 150;
