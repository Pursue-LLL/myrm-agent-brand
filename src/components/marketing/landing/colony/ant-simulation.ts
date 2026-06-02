/**
 * [INPUT]
 * - types.ts (POS: 场景类型定义)
 *
 * [OUTPUT]
 * - createAnts / stepColony / stepAnt: 蚂蚁模拟 step
 *
 * [POS]
 * 蚂蚁 Agent 行为逻辑，纯函数，无 Canvas 依赖。
 */

import type { AntAgent, AntTone, MouseState, WorkAnchor } from './types';

const TAU = Math.PI * 2;
const MOUSE_FLEE_RADIUS = 56;

function normalizeAngle(angle: number): number {
  let a = angle;
  while (a > Math.PI) a -= TAU;
  while (a < -Math.PI) a += TAU;
  return a;
}

function steer(current: number, target: number, maxTurn: number): number {
  const delta = normalizeAngle(target - current);
  return current + Math.max(-maxTurn, Math.min(maxTurn, delta));
}

function pickAnchor(anchors: WorkAnchor[], ant: AntAgent): WorkAnchor | null {
  if (anchors.length === 0) return null;
  if (ant.anchorId) {
    const locked = anchors.find((a) => a.id === ant.anchorId);
    if (locked) return locked;
  }
  let best: WorkAnchor | null = null;
  let bestScore = Infinity;
  for (const anchor of anchors) {
    const dist = Math.hypot(anchor.x - ant.x, anchor.y - ant.y);
    const score = dist / Math.max(anchor.strength, 0.1);
    if (score < bestScore) {
      bestScore = score;
      best = anchor;
    }
  }
  if (best) ant.anchorId = best.id;
  return best;
}

export function createAnts(count: number, canvasW: number, canvasH: number): AntAgent[] {
  const tones: AntTone[] = ['teal', 'warm'];
  return Array.from({ length: count }, (_, i) => ({
    x: Math.random() * canvasW,
    y: Math.random() * canvasH,
    angle: Math.random() * TAU,
    speed: 0.45 + Math.random() * 0.35,
    carrying: i % 3 === 0,
    tone: tones[i % 2] ?? 'teal',
    wanderPhase: Math.random() * TAU,
    anchorId: null,
  }));
}

export function stepAnt(
  ant: AntAgent,
  anchors: WorkAnchor[],
  mouse: MouseState,
  pheromoneGrad: { gx: number; gy: number },
  canvasW: number,
  canvasH: number,
  dt: number,
  reducedMotion: boolean,
): void {
  if (reducedMotion) return;

  const anchor = pickAnchor(anchors, ant);
  let desired = ant.angle + Math.sin(ant.wanderPhase) * 0.35;
  let fleeBoost = 1;
  ant.wanderPhase += dt * 1.6;

  if (mouse.active) {
    const mouseDist = Math.hypot(mouse.x - ant.x, mouse.y - ant.y);
    if (mouseDist < MOUSE_FLEE_RADIUS) {
      const strength = 1 - mouseDist / MOUSE_FLEE_RADIUS;
      desired = Math.atan2(ant.y - mouse.y, ant.x - mouse.x);
      fleeBoost = 1 + strength * 2.2;
      ant.anchorId = null;
    }
  }

  if (fleeBoost <= 1.05) {
    if (Math.abs(pheromoneGrad.gx) + Math.abs(pheromoneGrad.gy) > 0.01) {
      desired = Math.atan2(pheromoneGrad.gy, pheromoneGrad.gx);
    }

    if (anchor) {
      const toAnchor = Math.atan2(anchor.y - ant.y, anchor.x - ant.x);
      const dist = Math.hypot(anchor.x - ant.x, anchor.y - ant.y);
      const pull = Math.min(1, anchor.strength * (1 - Math.min(1, dist / 280)));
      desired = desired * (1 - pull) + toAnchor * pull;

      if (dist < anchor.radius + 8) {
        ant.carrying = !ant.carrying;
        ant.anchorId = null;
      }
    }
  }

  ant.angle = steer(ant.angle, desired, dt * (fleeBoost > 1.2 ? 5.5 : 2.8));
  const velocity = ant.speed * fleeBoost * (60 * dt);
  ant.x += Math.cos(ant.angle) * velocity;
  ant.y += Math.sin(ant.angle) * velocity;

  const margin = 12;
  if (ant.x < margin) {
    ant.x = margin;
    ant.angle = normalizeAngle(Math.PI - ant.angle);
  }
  if (ant.x > canvasW - margin) {
    ant.x = canvasW - margin;
    ant.angle = normalizeAngle(Math.PI - ant.angle);
  }
  if (ant.y < margin) {
    ant.y = margin;
    ant.angle = normalizeAngle(-ant.angle);
  }
  if (ant.y > canvasH - margin) {
    ant.y = canvasH - margin;
    ant.angle = normalizeAngle(-ant.angle);
  }
}

export function stepColony(
  ants: AntAgent[],
  anchors: WorkAnchor[],
  mouse: MouseState,
  sampleGradient: (x: number, y: number) => { gx: number; gy: number },
  deposit: (x: number, y: number, amount: number) => void,
  canvasW: number,
  canvasH: number,
  dt: number,
  reducedMotion: boolean,
): void {
  for (const ant of ants) {
    const grad = sampleGradient(ant.x, ant.y);
    stepAnt(ant, anchors, mouse, grad, canvasW, canvasH, dt, reducedMotion);
    if (!reducedMotion) {
      deposit(ant.x, ant.y, ant.carrying ? 0.045 : 0.028);
    }
  }
}
