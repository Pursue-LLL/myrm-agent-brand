'use client';

/**
 * [INPUT]
 * - useColonyCanvas.ts (POS: Canvas 生命周期 hook)
 *
 * [OUTPUT]
 * - ColonyLayer: Hero 蚁群 Canvas 挂载组件
 *
 * [POS]
 * Landing Hero 背景层，pointer-events-none，radial mask 淡出边缘。
 */

import { useRef } from 'react';
import { useColonyCanvas } from './useColonyCanvas';

const CANVAS_MASK =
  'radial-gradient(ellipse 80% 65% at 50% 45%, black 30%, transparent 85%)';

export default function ColonyLayer() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  useColonyCanvas(canvasRef);

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 z-0 h-full w-full"
      aria-hidden
      style={{
        pointerEvents: 'none',
        mask: CANVAS_MASK,
        WebkitMaskImage: CANVAS_MASK,
      }}
    />
  );
}
