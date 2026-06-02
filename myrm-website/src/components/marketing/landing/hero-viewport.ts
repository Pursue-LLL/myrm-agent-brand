'use client';

import { useEffect, useState } from 'react';

export const COLONY_ROOT_SELECTOR = '[data-colony-root]';

const VISIBLE_RATIO = 0.03;
const IO_THRESHOLDS: number[] = [0, 0.03, 0.1, 0.25];

export function isColonyRootVisible(entry: IntersectionObserverEntry): boolean {
  return entry.isIntersecting && entry.intersectionRatio > VISIBLE_RATIO;
}

export const COLONY_ROOT_IO_OPTIONS: IntersectionObserverInit = {
  threshold: IO_THRESHOLDS,
};

/** True while Hero colony block occupies more than ~3% of the viewport. */
export function useColonyRootViewportActive(): boolean {
  const [active, setActive] = useState(true);

  useEffect(() => {
    const root = document.querySelector(COLONY_ROOT_SELECTOR);
    if (!root) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry) setActive(isColonyRootVisible(entry));
      },
      COLONY_ROOT_IO_OPTIONS,
    );

    observer.observe(root);
    return () => observer.disconnect();
  }, []);

  return active;
}
