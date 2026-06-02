'use client';

import { useEffect, useRef, useState } from 'react';
import { cn } from '@/lib/utils/classnameUtils';

export function TypewriterText({
  text,
  delay = 0,
  active,
  intervalMs = 35,
  cursorClassName,
}: {
  text: string;
  delay?: number;
  active?: boolean;
  intervalMs?: number;
  cursorClassName?: string;
}) {
  const [displayed, setDisplayed] = useState('');
  const [autoStarted, setAutoStarted] = useState(false);
  const isControlled = active !== undefined;
  const shouldType = isControlled ? active : autoStarted;

  useEffect(() => {
    if (isControlled) return;
    const timer = setTimeout(() => setAutoStarted(true), delay);
    return () => clearTimeout(timer);
  }, [delay, isControlled]);

  useEffect(() => {
    if (!shouldType) {
      if (isControlled) setDisplayed('');
      return;
    }

    let i = 0;
    setDisplayed('');
    const interval = setInterval(() => {
      i += 1;
      if (i <= text.length) {
        setDisplayed(text.slice(0, i));
      } else {
        clearInterval(interval);
      }
    }, intervalMs);

    return () => clearInterval(interval);
  }, [shouldType, text, intervalMs, isControlled]);

  const showCursor = shouldType && displayed.length < text.length;

  return (
    <span>
      {displayed}
      {showCursor && <span className={cn('ed-cursor', cursorClassName)}>|</span>}
    </span>
  );
}

export function MagneticButton({ children, className, style }: { children: React.ReactNode; className?: string; style?: React.CSSProperties }) {
  const ref = useRef<HTMLDivElement>(null);

  const handleMove = (e: React.MouseEvent) => {
    const el = ref.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const x = e.clientX - rect.left - rect.width / 2;
    const y = e.clientY - rect.top - rect.height / 2;
    el.style.transform = `translate(${x * 0.15}px, ${y * 0.15}px)`;
  };

  const handleLeave = () => {
    const el = ref.current;
    if (el) el.style.transform = 'translate(0, 0)';
  };

  return (
    <div ref={ref} className={className} style={{ ...style, transition: 'transform 0.3s cubic-bezier(0.22, 1, 0.36, 1)' }} onMouseMove={handleMove} onMouseLeave={handleLeave}>
      {children}
    </div>
  );
}

export function TiltCard({ children, className, style }: { children: React.ReactNode; className?: string; style?: React.CSSProperties }) {
  const ref = useRef<HTMLDivElement>(null);

  const handleMove = (e: React.MouseEvent) => {
    const el = ref.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width - 0.5;
    const y = (e.clientY - rect.top) / rect.height - 0.5;
    el.style.transform = `perspective(800px) rotateY(${x * 6}deg) rotateX(${-y * 6}deg) translateY(-4px)`;
    el.style.setProperty('--spot-x', `${e.clientX - rect.left}px`);
    el.style.setProperty('--spot-y', `${e.clientY - rect.top}px`);
  };

  const handleLeave = () => {
    const el = ref.current;
    if (el) el.style.transform = 'perspective(800px) rotateY(0) rotateX(0) translateY(0)';
  };

  return (
    <div ref={ref} className={cn('ed-spotlight', className)} style={{ ...style, transition: 'transform 0.5s cubic-bezier(0.22, 1, 0.36, 1), box-shadow 0.5s ease, border-color 0.3s ease' }} onMouseMove={handleMove} onMouseLeave={handleLeave}>
      {children}
    </div>
  );
}
