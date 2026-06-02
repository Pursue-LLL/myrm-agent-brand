'use client';

import { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';

const TRAIL_LAYERS = 3;

export default function MouseGlowLayer() {
  const mainRef = useRef<HTMLDivElement>(null);
  const trailRefs = useRef<(HTMLDivElement | null)[]>([]);
  const targetRef = useRef({ x: 0, y: 0 });
  const smoothRef = useRef(Array.from({ length: TRAIL_LAYERS + 1 }, () => ({ x: 0, y: 0 })));
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    const setTarget = (x: number, y: number) => {
      targetRef.current = { x, y };
    };

    const handleMove = (e: MouseEvent) => setTarget(e.clientX, e.clientY);
    const handleTouch = (e: TouchEvent) => {
      const touch = e.touches[0];
      if (touch) setTarget(touch.clientX, touch.clientY);
    };

    window.addEventListener('mousemove', handleMove, { passive: true });
    window.addEventListener('touchmove', handleTouch, { passive: true });

    let raf = 0;
    let running = true;

    const animate = () => {
      raf = 0;
      if (!running) return;

      smoothRef.current[0] = {
        x: smoothRef.current[0].x + (targetRef.current.x - smoothRef.current[0].x) * 0.28,
        y: smoothRef.current[0].y + (targetRef.current.y - smoothRef.current[0].y) * 0.28,
      };

      for (let i = 1; i <= TRAIL_LAYERS; i += 1) {
        const prev = smoothRef.current[i - 1];
        const curr = smoothRef.current[i];
        smoothRef.current[i] = {
          x: curr.x + (prev.x - curr.x) * 0.24,
          y: curr.y + (prev.y - curr.y) * 0.24,
        };
      }

      const apply = (el: HTMLDivElement | null, index: number) => {
        if (!el) return;
        const { x, y } = smoothRef.current[index];
        const scale = 1 - index * 0.14;
        el.style.transform = `translate3d(${x}px, ${y}px, 0) translate(-50%, -50%) scale(${scale})`;
        el.style.opacity = `${Math.max(0, 0.34 - index * 0.09)}`;
      };

      apply(mainRef.current, 0);
      trailRefs.current.forEach((el, i) => apply(el, i + 1));

      raf = requestAnimationFrame(animate);
    };

    const startLoop = () => {
      if (running && !raf) raf = requestAnimationFrame(animate);
    };

    const stopLoop = () => {
      running = false;
      cancelAnimationFrame(raf);
      raf = 0;
    };

    running = true;
    startLoop();

    const handleVisibility = () => {
      if (document.hidden) {
        stopLoop();
      } else {
        running = true;
        startLoop();
      }
    };
    document.addEventListener('visibilitychange', handleVisibility);

    return () => {
      stopLoop();
      window.removeEventListener('mousemove', handleMove);
      window.removeEventListener('touchmove', handleTouch);
      document.removeEventListener('visibilitychange', handleVisibility);
    };
  }, []);

  if (!mounted) return null;

  return createPortal(
    <div className="pointer-events-none fixed inset-0 z-[40]" aria-hidden>
      {Array.from({ length: TRAIL_LAYERS }, (_, i) => (
        <div
          key={`trail-${i}`}
          ref={(el) => {
            trailRefs.current[i] = el;
          }}
          className="ed-mouse-glow ed-mouse-glow-trail fixed left-0 top-0"
        />
      ))}
      <div ref={mainRef} className="ed-mouse-glow fixed left-0 top-0" />
    </div>,
    document.body,
  );
}
