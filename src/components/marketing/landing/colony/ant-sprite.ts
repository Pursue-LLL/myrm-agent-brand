/**
 * [INPUT]
 * - types.ts (POS: AntTone)
 *
 * [OUTPUT]
 * - getAntSprite / drawAntSprite: 侧视蚂蚁精灵（🐜 比例：大腹+细腰+圆头+六足+触角）
 *
 * [POS]
 * 高 DPI 离屏绘制 + drawImage 旋转，保证 Hero 背景蚂蚁可辨认。
 */

import type { AntTone } from './types';
import { SCENE_PALETTE } from './types';

const SPRITE_PX = 48;

const spriteCache = new Map<string, HTMLCanvasElement>();

function drawEmojiStyleAnt(
  ctx: CanvasRenderingContext2D,
  tone: AntTone,
  size: number,
  legPhase: number,
): void {
  const c = tone === 'teal' ? SCENE_PALETTE.teal : SCENE_PALETTE.warm;
  const body = `rgba(${c.r}, ${c.g}, ${c.b}, 0.78)`;
  const leg = `rgba(${c.r}, ${c.g}, ${c.b}, 0.82)`;
  const s = size / 48;
  const cx = size / 2;
  const cy = size / 2 + 1 * s;

  ctx.clearRect(0, 0, size, size);
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';
  ctx.fillStyle = body;
  ctx.strokeStyle = leg;
  ctx.lineWidth = 1.05 * s;

  ctx.beginPath();
  ctx.ellipse(cx - 12 * s, cy, 8.5 * s, 7 * s, 0, 0, Math.PI * 2);
  ctx.fill();

  ctx.beginPath();
  ctx.moveTo(cx - 4.5 * s, cy);
  ctx.lineTo(cx - 7.5 * s, cy);
  ctx.lineWidth = 0.85 * s;
  ctx.stroke();
  ctx.lineWidth = 1.05 * s;

  ctx.beginPath();
  ctx.ellipse(cx + 1.5 * s, cy, 4.2 * s, 3.6 * s, 0, 0, Math.PI * 2);
  ctx.fill();

  ctx.beginPath();
  ctx.arc(cx + 12 * s, cy, 5 * s, 0, Math.PI * 2);
  ctx.fill();

  const wiggle = Math.sin(legPhase) * 0.35 * s;
  const legs: Array<[number, number, number, number]> = [
    [1.5 * s, -4 * s, 2 * s, -7.5 * s - wiggle],
    [1.5 * s, 4 * s, 2 * s, 7.5 * s + wiggle],
    [-1.5 * s, -4.5 * s, -3 * s, -8.5 * s - wiggle],
    [-1.5 * s, 4.5 * s, -3 * s, 8.5 * s + wiggle],
    [-4.5 * s, -3.5 * s, -7 * s, -7 * s - wiggle],
    [-4.5 * s, 3.5 * s, -7 * s, 7 * s + wiggle],
  ];
  for (const [x1, y1, x2, y2] of legs) {
    ctx.beginPath();
    ctx.moveTo(cx + x1, cy + y1);
    ctx.quadraticCurveTo(cx + x1 + 1.5 * s, cy + (y1 + y2) / 2, cx + x2, cy + y2);
    ctx.stroke();
  }

  ctx.beginPath();
  ctx.moveTo(cx + 14 * s, cy - 1.8 * s);
  ctx.quadraticCurveTo(cx + 18 * s, cy - 6.5 * s, cx + 19 * s, cy - 8.5 * s);
  ctx.moveTo(cx + 14 * s, cy + 1.8 * s);
  ctx.quadraticCurveTo(cx + 18 * s, cy + 6.5 * s, cx + 19 * s, cy + 8.5 * s);
  ctx.stroke();
}

export function getAntSprite(tone: AntTone, dpr: number, legPhase: number): HTMLCanvasElement {
  const phaseBucket = Math.floor(legPhase * 4);
  const key = `${tone}-${dpr}-${phaseBucket}`;
  const cached = spriteCache.get(key);
  if (cached) return cached;

  const canvas = document.createElement('canvas');
  const px = Math.round(SPRITE_PX * dpr);
  canvas.width = px;
  canvas.height = px;
  const ctx = canvas.getContext('2d');
  if (!ctx) return canvas;

  drawEmojiStyleAnt(ctx, tone, px, legPhase);
  spriteCache.set(key, canvas);
  return canvas;
}

export function drawAntSprite(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  angle: number,
  tone: AntTone,
  mobile: boolean,
  dpr: number,
  legPhase: number,
): void {
  const sprite = getAntSprite(tone, dpr, legPhase);
  const scale = mobile ? 0.46 : 0.56;
  const w = SPRITE_PX * scale;
  const h = SPRITE_PX * scale;

  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(angle);
  ctx.drawImage(sprite, -w / 2, -h / 2, w, h);
  ctx.restore();
}
