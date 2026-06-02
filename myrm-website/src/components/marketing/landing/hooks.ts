'use client';

import { useEffect, useRef, useState } from 'react';

export function useRevealOnScroll() {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      (entries) => entries.forEach((entry) => {
        if (entry.isIntersecting) entry.target.classList.add('ed-visible');
      }),
      { threshold: 0.1, rootMargin: '0px 0px -40px 0px' },
    );
    const observeReveals = (root: ParentNode): void => {
      root.querySelectorAll('.ed-reveal:not(.ed-visible)').forEach((child) => observer.observe(child));
    };

    observeReveals(el);

    const mutationObserver = new MutationObserver((mutations) => {
      for (const mutation of mutations) {
        mutation.addedNodes.forEach((node) => {
          if (node instanceof Element) {
            if (node.classList.contains('ed-reveal') && !node.classList.contains('ed-visible')) {
              observer.observe(node);
            }
            observeReveals(node);
          }
        });
      }
    });

    mutationObserver.observe(el, { childList: true, subtree: true });

    return () => {
      observer.disconnect();
      mutationObserver.disconnect();
    };
  }, []);
  return ref;
}

/** True when viewport is at least `minWidth` (default md breakpoint). */
export function useMinWidth(minWidth = 768): boolean {
  const [matches, setMatches] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia(`(min-width: ${minWidth}px)`);
    const update = () => setMatches(mq.matches);
    update();
    mq.addEventListener('change', update);
    return () => mq.removeEventListener('change', update);
  }, [minWidth]);
  return matches;
}

export function useScrollProgress() {
  const [progress, setProgress] = useState(0);
  useEffect(() => {
    const update = () => {
      const h = document.documentElement.scrollHeight - window.innerHeight;
      setProgress(h > 0 ? window.scrollY / h : 0);
    };
    window.addEventListener('scroll', update, { passive: true });
    return () => window.removeEventListener('scroll', update);
  }, []);
  return progress;
}

export function useCountUp(target: number, duration = 1200) {
  const [value, setValue] = useState(0);
  const [started, setStarted] = useState(false);
  const ref = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      (entries) => { if (entries[0]?.isIntersecting) { setStarted(true); observer.disconnect(); } },
      { threshold: 0.3 },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!started) return;
    let raf: number;
    const start = performance.now();
    const tick = (now: number) => {
      const elapsed = now - start;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setValue(Math.round(target * eased));
      if (progress < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [started, target, duration]);

  return { value, ref };
}

export function useCursorTrail() {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const particles: HTMLDivElement[] = [];
    const POOL_SIZE = 24;

    for (let i = 0; i < POOL_SIZE; i++) {
      const p = document.createElement('div');
      p.className = 'ed-trail-particle';
      p.style.opacity = '0';
      container.appendChild(p);
      particles.push(p);
    }

    let idx = 0;
    let lastX = 0;
    let lastY = 0;

    const handleMove = (e: MouseEvent) => {
      const dx = e.clientX - lastX;
      const dy = e.clientY - lastY;
      if (Math.abs(dx) + Math.abs(dy) < 5) return;

      lastX = e.clientX;
      lastY = e.clientY;

      const p = particles[idx % POOL_SIZE];
      const size = 2 + (idx % 3);
      const isTeal = idx % 3 !== 1;
      p.style.width = `${size}px`;
      p.style.height = `${size}px`;
      p.style.background = isTeal ? 'var(--ed-accent)' : 'rgba(255, 140, 0, 0.75)';
      p.style.boxShadow = isTeal
        ? '0 0 8px rgba(88, 142, 149, 0.45)'
        : '0 0 8px rgba(255, 140, 0, 0.35)';
      p.style.left = `${e.clientX}px`;
      p.style.top = `${e.clientY}px`;
      p.style.opacity = '0.55';
      p.style.transform = 'translate(-50%, -50%) scale(1)';

      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          p.style.opacity = '0';
          p.style.transform = 'translate(-50%, -50%) scale(0.15)';
        });
      });

      idx++;
    };

    window.addEventListener('mousemove', handleMove, { passive: true });
    return () => {
      window.removeEventListener('mousemove', handleMove);
      particles.forEach((p) => p.remove());
    };
  }, []);

  return containerRef;
}
