import Image from 'next/image';
import { cn } from '@/lib/utils/classnameUtils';

type BrandLogoVariant = 'icon' | 'wordmark' | 'full';

interface BrandLogoProps {
  className?: string;
  size?: number;
  variant?: BrandLogoVariant;
  /** Use light text wordmark for dark backgrounds */
  wordmarkTheme?: 'dark' | 'light';
  /** LCP preload — header only */
  priority?: boolean;
}

const WORDMARK_LIGHT = '/brand/logo-wordmark-light-text.webp?v=20260620';

function iconSrcForSize(displaySize: number): string {
  const v = '?v=20260620';
  if (displaySize <= 48) return `/brand/logo-icon-80.webp${v}`;
  if (displaySize <= 96) return `/brand/logo-icon-128.webp${v}`;
  return `/brand/logo-icon.webp${v}`;
}

export default function BrandLogo({
  className,
  size = 36,
  variant = 'icon',
  wordmarkTheme = 'dark',
  priority = false,
}: BrandLogoProps) {
  if (variant === 'wordmark') {
    const src = wordmarkTheme === 'light' ? WORDMARK_LIGHT : '/brand/logo-wordmark.webp?v=20260620';
    return (
      <Image
        src={src}
        alt="MyrmAgent"
        width={Math.round(size * 4.2)}
        height={size}
        priority={priority}
        className={cn('ed-logo shrink-0 object-contain object-left', className)}
      />
    );
  }

  if (variant === 'full') {
    return (
      <Image
        src="/brand/logo-full.jpg"
        alt="MyrmAgent"
        width={size}
        height={size}
        priority={priority}
        className={cn('ed-logo shrink-0 object-contain', className)}
      />
    );
  }

  return (
    <Image
      src={iconSrcForSize(size)}
      alt="MyrmAgent"
      width={size}
      height={size}
      priority={priority}
      className={cn('ed-logo shrink-0 object-contain', className)}
    />
  );
}
