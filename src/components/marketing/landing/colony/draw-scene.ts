/**
 * [INPUT]
 * - types.ts (POS: 场景类型定义)
 * - pheromone-field.ts (POS: 信息素栅格场)
 *
 * [OUTPUT]
 * - drawInteractiveGrid / drawAnt / drawColonyLayer / drawStaticColony
 *
 * [POS]
 * Hero Colony Canvas 全部绘制逻辑（Grid 点阵 + 信息素 + 蚂蚁）。
 */

import type { AntAgent, MouseState } from './types';
import { GRID_DOT_RADIUS, GRID_GAP, MOUSE_INFLUENCE_RADIUS, SCENE_PALETTE } from './types';
import type { PheromoneField } from './pheromone-field';
import { drawAntSprite } from './ant-sprite';

function mixColor(t: number, alpha: number): string {
  const { teal, warm } = SCENE_PALETTE;
  const r = Math.round(teal.r + (warm.r - teal.r) * t);
  const g = Math.round(teal.g + (warm.g - teal.g) * t);
  const b = Math.round(teal.b + (warm.b - teal.b) * t);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

function influenceAt(x: number, y: number, mx: number, my: number): number {
  if (mx < 0 || my < 0) return 0;
  const dist = Math.hypot(x - mx, y - my);
  if (dist >= MOUSE_INFLUENCE_RADIUS) return 0;
  const t = 1 - dist / MOUSE_INFLUENCE_RADIUS;
  return t * t;
}

function drawStaticGridOnly(ctx: CanvasRenderingContext2D, canvasW: number, canvasH: number): void {
  const cols = Math.ceil(canvasW / GRID_GAP) + 1;
  const rows = Math.ceil(canvasH / GRID_GAP) + 1;

  for (let r = 0; r < rows; r += 1) {
    for (let c = 0; c < cols; c += 1) {
      const x = c * GRID_GAP;
      const y = r * GRID_GAP;
      const rightX = c + 1 < cols ? (c + 1) * GRID_GAP : null;
      const downY = r + 1 < rows ? (r + 1) * GRID_GAP : null;
      const baseT = Math.min(1, (x / Math.max(canvasW, 1)) * 0.55 + (y / Math.max(canvasH, 1)) * 0.35);

      ctx.strokeStyle = mixColor(baseT, 0.14);
      ctx.lineWidth = 0.55;
      if (rightX !== null) {
        ctx.beginPath();
        ctx.moveTo(x, y);
        ctx.lineTo(rightX, y);
        ctx.stroke();
      }
      if (downY !== null) {
        ctx.beginPath();
        ctx.moveTo(x, y);
        ctx.lineTo(x, downY);
        ctx.stroke();
      }
    }
  }

  for (let r = 0; r < rows; r += 1) {
    for (let c = 0; c < cols; c += 1) {
      const x = c * GRID_GAP;
      const y = r * GRID_GAP;
      const baseT = Math.min(1, (x / Math.max(canvasW, 1)) * 0.55 + (y / Math.max(canvasH, 1)) * 0.35);
      ctx.beginPath();
      ctx.arc(x, y, GRID_DOT_RADIUS, 0, Math.PI * 2);
      ctx.fillStyle = mixColor(baseT, 0.28);
      ctx.fill();
    }
  }
}

let gridCache: { canvas: HTMLCanvasElement; w: number; h: number } | null = null;

export function invalidateGridCache(): void {
  gridCache = null;
}

function getGridCache(canvasW: number, canvasH: number): HTMLCanvasElement {
  if (gridCache && gridCache.w === canvasW && gridCache.h === canvasH) {
    return gridCache.canvas;
  }
  const canvas = document.createElement('canvas');
  canvas.width = Math.max(1, Math.floor(canvasW));
  canvas.height = Math.max(1, Math.floor(canvasH));
  const cacheCtx = canvas.getContext('2d');
  if (cacheCtx) {
    drawStaticGridOnly(cacheCtx, canvasW, canvasH);
  }
  gridCache = { canvas, w: canvasW, h: canvasH };
  return canvas;
}

function drawMouseGridOverlay(
  ctx: CanvasRenderingContext2D,
  canvasW: number,
  canvasH: number,
  mx: number,
  my: number,
  time: number,
): void {
  const colMin = Math.max(0, Math.floor((mx - MOUSE_INFLUENCE_RADIUS) / GRID_GAP) - 1);
  const colMax = Math.min(Math.ceil(canvasW / GRID_GAP) + 1, Math.ceil((mx + MOUSE_INFLUENCE_RADIUS) / GRID_GAP) + 1);
  const rowMin = Math.max(0, Math.floor((my - MOUSE_INFLUENCE_RADIUS) / GRID_GAP) - 1);
  const rowMax = Math.min(Math.ceil(canvasH / GRID_GAP) + 1, Math.ceil((my + MOUSE_INFLUENCE_RADIUS) / GRID_GAP) + 1);

  const grid: { x: number; y: number; inf: number }[][] = [];
  for (let r = rowMin; r <= rowMax; r += 1) {
    grid[r] = [];
    for (let c = colMin; c <= colMax; c += 1) {
      const x = c * GRID_GAP;
      const y = r * GRID_GAP;
      grid[r][c] = { x, y, inf: influenceAt(x, y, mx, my) };
    }
  }

  for (let r = rowMin; r <= rowMax; r += 1) {
    for (let c = colMin; c <= colMax; c += 1) {
      const cell = grid[r][c];
      if (!cell || cell.inf <= 0) continue;
      const right = grid[r]?.[c + 1];
      const down = grid[r + 1]?.[c];
      const linkStrength = (a: number, b: number) => Math.min(a, b);

      if (right && right.inf > 0 && linkStrength(cell.inf, right.inf) > 0.08) {
        const t = linkStrength(cell.inf, right.inf);
        ctx.strokeStyle = mixColor(t * 0.85, 0.18 + t * 0.45);
        ctx.lineWidth = 0.55 + t * 1.1;
        ctx.beginPath();
        ctx.moveTo(cell.x, cell.y);
        ctx.lineTo(right.x, right.y);
        ctx.stroke();
      }
      if (down && down.inf > 0 && linkStrength(cell.inf, down.inf) > 0.08) {
        const t = linkStrength(cell.inf, down.inf);
        ctx.strokeStyle = mixColor(t * 0.85, 0.18 + t * 0.45);
        ctx.lineWidth = 0.55 + t * 1.1;
        ctx.beginPath();
        ctx.moveTo(cell.x, cell.y);
        ctx.lineTo(down.x, down.y);
        ctx.stroke();
      }
    }
  }

  for (let r = rowMin; r <= rowMax; r += 1) {
    for (let c = colMin; c <= colMax; c += 1) {
      const cell = grid[r]?.[c];
      if (!cell || cell.inf <= 0) continue;
      const { x, y, inf } = cell;
      const pulse = 1 + Math.sin(time * 4 + c * 0.4 + r * 0.3) * 0.1 * inf;
      const alpha = 0.25 + inf * 0.7;
      const radius = (GRID_DOT_RADIUS + inf * 2) * pulse;

      if (inf > 0.25) {
        ctx.beginPath();
        ctx.arc(x, y, radius * 2.2, 0, Math.PI * 2);
        ctx.fillStyle = mixColor(inf, 0.06 + inf * 0.14);
        ctx.fill();
      }

      ctx.beginPath();
      ctx.arc(x, y, radius, 0, Math.PI * 2);
      ctx.fillStyle = mixColor(inf, alpha);
      ctx.fill();
    }
  }

  const halo = ctx.createRadialGradient(mx, my, 0, mx, my, MOUSE_INFLUENCE_RADIUS * 0.4);
  halo.addColorStop(0, 'rgba(255, 140, 0, 0.06)');
  halo.addColorStop(0.3, 'rgba(255, 140, 0, 0.03)');
  halo.addColorStop(0.6, 'rgba(88, 142, 149, 0.14)');
  halo.addColorStop(1, 'rgba(88, 142, 149, 0)');
  ctx.fillStyle = halo;
  ctx.beginPath();
  ctx.arc(mx, my, MOUSE_INFLUENCE_RADIUS * 0.4, 0, Math.PI * 2);
  ctx.fill();
}

export function drawInteractiveGrid(
  ctx: CanvasRenderingContext2D,
  canvasW: number,
  canvasH: number,
  mouse: MouseState,
  time: number,
): void {
  const base = getGridCache(canvasW, canvasH);
  ctx.drawImage(base, 0, 0, canvasW, canvasH);

  if (mouse.active && mouse.x >= 0 && mouse.y >= 0) {
    drawMouseGridOverlay(ctx, canvasW, canvasH, mouse.x, mouse.y, time);
  }
}

export function drawAnt(
  ctx: CanvasRenderingContext2D,
  ant: AntAgent,
  mobile: boolean,
  dpr: number,
): void {
  drawAntSprite(ctx, ant.x, ant.y, ant.angle, ant.tone, mobile, dpr, ant.wanderPhase);
}

export function drawColonyLayer(
  ctx: CanvasRenderingContext2D,
  canvasW: number,
  canvasH: number,
  mouse: MouseState,
  time: number,
  _field: PheromoneField,
  ants: AntAgent[],
  mobile: boolean,
  dpr: number,
): void {
  ctx.clearRect(0, 0, canvasW, canvasH);
  drawInteractiveGrid(ctx, canvasW, canvasH, mouse, time);
  for (const ant of ants) {
    drawAnt(ctx, ant, mobile, dpr);
  }
}

export function drawStaticColony(
  ctx: CanvasRenderingContext2D,
  canvasW: number,
  canvasH: number,
  ants: AntAgent[],
  mobile: boolean,
  dpr: number,
): void {
  ctx.clearRect(0, 0, canvasW, canvasH);
  drawInteractiveGrid(ctx, canvasW, canvasH, { x: -1, y: -1, active: false }, 0);
  for (const ant of ants) {
    drawAnt(ctx, ant, mobile, dpr);
  }
}
