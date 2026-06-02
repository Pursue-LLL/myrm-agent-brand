'use client';

/**
 * [INPUT]
 * - ant-simulation.ts (POS: 蚂蚁 step 与初始化)
 * - draw-scene.ts (POS: Canvas 场景绘制)
 * - pheromone-field.ts (POS: 信息素栅格场)
 * - types.ts (POS: 场景类型定义)
 *
 * [OUTPUT]
 * - useColonyCanvas: Hero 蚁群 Canvas 生命周期 hook
 *
 * [POS]
 * 统一调度 Grid + 信息素 + 蚂蚁模拟的单 rAF 循环。
 */

import { useEffect, useRef, type RefObject } from 'react';
import { createAnts, stepColony } from './ant-simulation';
import { drawColonyLayer, drawStaticColony, invalidateGridCache } from './draw-scene';
import { PheromoneField } from './pheromone-field';
import type { MouseState, WorkAnchor } from './types';
import {
  COLONY_ROOT_IO_OPTIONS,
  isColonyRootVisible,
} from '../hero-viewport';

const ANCHOR_SYNC_MS = 200;
const PHEROMONE_COLS = 48;
const PHEROMONE_ROWS = 32;
const DESKTOP_ANT_COUNT = 28;
const MOBILE_ANT_COUNT = 8;
const MOUSE_FLEE_RADIUS = 56;
const COLONY_ROOT_ATTR = 'data-colony-root';
const COLONY_ACTIVE_ATTR = 'data-colony-active';
const COLONY_ANCHOR_ATTR = 'data-colony-anchor';

const DEFAULT_ANCHOR_STRENGTH: Record<string, number> = {
  cta: 1.35,
  preview: 1.05,
};

function resolveAnchors(canvas: HTMLCanvasElement): WorkAnchor[] {
  const root = canvas.closest(`[${COLONY_ROOT_ATTR}]`);
  const scope = root ?? canvas;
  const canvasRect = canvas.getBoundingClientRect();
  const nodes = scope.querySelectorAll<HTMLElement>(`[${COLONY_ANCHOR_ATTR}]`);
  const anchors: WorkAnchor[] = [];

  nodes.forEach((node) => {
    const id = node.dataset.colonyAnchor;
    if (!id) return;
    const rect = node.getBoundingClientRect();
    anchors.push({
      id,
      x: rect.left + rect.width / 2 - canvasRect.left,
      y: rect.top + rect.height / 2 - canvasRect.top,
      radius: Math.max(rect.width, rect.height) * 0.22,
      strength: DEFAULT_ANCHOR_STRENGTH[id] ?? 1,
    });
  });

  return anchors;
}

export function useColonyCanvas(canvasRef: RefObject<HTMLCanvasElement | null>) {
  const mouseRef = useRef<MouseState>({ x: -1, y: -1, active: false });
  const smoothMouseRef = useRef({ x: -1, y: -1 });
  const anchorsRef = useRef<WorkAnchor[]>([]);
  const antsRef = useRef(createAnts(DESKTOP_ANT_COUNT, 800, 600));
  const fieldRef = useRef(new PheromoneField(PHEROMONE_COLS, PHEROMONE_ROWS));
  const flagsRef = useRef({ reducedMotion: false, mobile: false, initialized: false });

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let raf = 0;
    let visible = true;
    let canvasW = 0;
    let canvasH = 0;
    let canvasDpr = 1;
    let time = 0;
    let lastFrame = performance.now();
    let anchorTimer: ReturnType<typeof setInterval> | null = null;

    const motionMq = window.matchMedia('(prefers-reduced-motion: reduce)');
    const mobileMq = window.matchMedia('(max-width: 768px)');

    const syncFlags = () => {
      flagsRef.current.reducedMotion = motionMq.matches;
      flagsRef.current.mobile = mobileMq.matches;
      const targetCount = flagsRef.current.mobile ? MOBILE_ANT_COUNT : DESKTOP_ANT_COUNT;
      if (antsRef.current.length !== targetCount) {
        antsRef.current = createAnts(targetCount, Math.max(canvasW, 320), Math.max(canvasH, 240));
        fieldRef.current.clear();
      }
    };

    const syncAnchors = () => {
      anchorsRef.current = resolveAnchors(canvas);
    };

    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio, 2);
      canvasDpr = dpr;
      const rect = canvas.getBoundingClientRect();
      canvasW = rect.width;
      canvasH = rect.height;
      canvas.width = canvasW * dpr;
      canvas.height = canvasH * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

      if (!flagsRef.current.initialized && canvasW > 0 && canvasH > 0) {
        antsRef.current = createAnts(
          flagsRef.current.mobile ? MOBILE_ANT_COUNT : DESKTOP_ANT_COUNT,
          canvasW,
          canvasH,
        );
        flagsRef.current.initialized = true;
      }
      syncAnchors();
      invalidateGridCache();
    };

    const updateMouse = (clientX: number, clientY: number) => {
      const rect = canvas.getBoundingClientRect();
      mouseRef.current = {
        x: clientX - rect.left,
        y: clientY - rect.top,
        active: true,
      };
    };

    const renderStatic = () => {
      drawStaticColony(ctx, canvasW, canvasH, antsRef.current, flagsRef.current.mobile, canvasDpr);
    };

    const draw = (now: number) => {
      raf = 0;
      if (!visible || document.hidden) return;
      if (canvasW < 2 || canvasH < 2) resize();

      const { reducedMotion, mobile } = flagsRef.current;

      if (reducedMotion) {
        renderStatic();
        return;
      }

      const dt = Math.min(0.05, (now - lastFrame) / 1000);
      lastFrame = now;
      time += dt;

      smoothMouseRef.current.x += (mouseRef.current.x - smoothMouseRef.current.x) * 0.14;
      smoothMouseRef.current.y += (mouseRef.current.y - smoothMouseRef.current.y) * 0.14;

      const mouse: MouseState = {
        x: smoothMouseRef.current.x,
        y: smoothMouseRef.current.y,
        active: mouseRef.current.active,
      };

      const field = fieldRef.current;
      const ants = antsRef.current;

      field.decay(0.94);
      stepColony(
        ants,
        anchorsRef.current,
        mouse,
        (x, y) => field.gradientAt(x, y, canvasW, canvasH),
        (x, y, amount) => field.deposit(x, y, canvasW, canvasH, amount),
        canvasW,
        canvasH,
        dt,
        reducedMotion,
      );
      drawColonyLayer(ctx, canvasW, canvasH, mouse, time, field, ants, mobile, canvasDpr);

      raf = requestAnimationFrame(draw);
    };

    const scheduleDraw = () => {
      if (raf) return;
      lastFrame = performance.now();
      raf = requestAnimationFrame(draw);
    };

    const handleMouseMove = (e: MouseEvent) => updateMouse(e.clientX, e.clientY);
    const handleTouchMove = (e: TouchEvent) => {
      const touch = e.touches[0];
      if (touch) updateMouse(touch.clientX, touch.clientY);
    };
    const handleMotionChange = () => {
      syncFlags();
      fieldRef.current.clear();
      if (flagsRef.current.reducedMotion) {
        cancelAnimationFrame(raf);
        raf = 0;
        renderStatic();
      } else {
        scheduleDraw();
      }
    };
    const handleMobileChange = () => {
      syncFlags();
      scheduleDraw();
    };
    const handleVisibility = () => {
      if (document.hidden) {
        cancelAnimationFrame(raf);
        raf = 0;
      } else if (visible) {
        scheduleDraw();
      }
    };

    const handleResize = () => {
      resize();
      if (flagsRef.current.reducedMotion) renderStatic();
    };

    const rootEl = canvas.closest(`[${COLONY_ROOT_ATTR}]`) ?? canvas;

    const setColonyActive = (active: boolean) => {
      rootEl.setAttribute(COLONY_ACTIVE_ATTR, active ? 'true' : 'false');
    };

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry) return;
        visible = isColonyRootVisible(entry);
        setColonyActive(visible);
        if (visible && !document.hidden) {
          scheduleDraw();
        } else {
          cancelAnimationFrame(raf);
          raf = 0;
        }
      },
      COLONY_ROOT_IO_OPTIONS,
    );

    syncFlags();
    resize();
    syncAnchors();
    setColonyActive(true);
    observer.observe(rootEl);
    anchorTimer = setInterval(syncAnchors, ANCHOR_SYNC_MS);

    if (flagsRef.current.reducedMotion) {
      renderStatic();
    } else {
      scheduleDraw();
    }

    window.addEventListener('mousemove', handleMouseMove, { passive: true });
    window.addEventListener('touchmove', handleTouchMove, { passive: true });
    window.addEventListener('resize', handleResize);
    document.addEventListener('visibilitychange', handleVisibility);
    motionMq.addEventListener('change', handleMotionChange);
    mobileMq.addEventListener('change', handleMobileChange);

    return () => {
      visible = false;
      setColonyActive(false);
      cancelAnimationFrame(raf);
      if (anchorTimer) clearInterval(anchorTimer);
      observer.disconnect();
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('touchmove', handleTouchMove);
      window.removeEventListener('resize', handleResize);
      document.removeEventListener('visibilitychange', handleVisibility);
      motionMq.removeEventListener('change', handleMotionChange);
      mobileMq.removeEventListener('change', handleMobileChange);
    };
  }, [canvasRef]);
}
