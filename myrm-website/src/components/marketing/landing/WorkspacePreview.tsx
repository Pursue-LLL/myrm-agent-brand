'use client';

/**
 * [INPUT]
 * - /marketing/workspace-preview.webp (POS: Playwright 生成的产品预览静态图)
 * - /marketing/hero-demo.webm（可选，存在时优先展示录屏）
 * - next-intl `{namespace}.demo.preview.alt` (marketing | cloud)
 *
 * [OUTPUT]
 * - WorkspacePreview: 产品预览（浏览器框 + 可选 WebM + 静态 WebP 回退）
 *
 * [POS]
 * OSS `/` 与 SaaS `/cloud` Hero 下方产品预览；`shell="editorial"` 依赖 landing-editorial.css。
 */

import Image from 'next/image';
import { useTranslations } from 'next-intl';
import { useCallback, useEffect, useMemo, useState } from 'react';

const PREVIEW_WIDTH = 1080;
const PREVIEW_HEIGHT = 520;
const HERO_VIDEO_SRC = '/marketing/hero-demo.webm';
const HERO_VIDEO_BUILD_FLAG = process.env.NEXT_PUBLIC_HAS_HERO_DEMO_WEBM === 'true';

type WorkspacePreviewMessagesNamespace = 'marketing' | 'cloud';

type WorkspacePreviewShell = 'editorial' | 'shell';

interface WorkspacePreviewProps {
  /** Root i18n namespace — keys under `{namespace}.demo.preview.alt`. */
  messagesNamespace?: WorkspacePreviewMessagesNamespace;
  /** `editorial` matches OSS landing; `shell` uses theme tokens (e.g. `/cloud`). */
  shell?: WorkspacePreviewShell;
}

interface PreviewChromeStyles {
  frame: string;
  chrome: string;
  dots: readonly [string, string, string];
  title: string;
  screen: string;
  videoHidden: string;
  videoVisible: string;
  poster: string;
  posterHidden: string;
}

const SHELL_DOT_CLASSES: readonly [string, string, string] = [
  'h-2.5 w-2.5 rounded-full bg-destructive/65',
  'h-2.5 w-2.5 rounded-full bg-amber-500/70',
  'h-2.5 w-2.5 rounded-full bg-emerald-500/65',
];

function resolvePreviewChrome(shell: WorkspacePreviewShell): PreviewChromeStyles {
  if (shell === 'editorial') {
    return {
      frame: 'ed-device-frame ed-device-float',
      chrome: 'ed-device-chrome',
      dots: ['ed-device-dot', 'ed-device-dot', 'ed-device-dot'],
      title: 'ed-device-chrome-title ed-mono',
      screen: 'ed-device-screen',
      videoHidden: 'ed-device-video',
      videoVisible: 'ed-device-video ed-device-video-visible',
      poster: 'ed-device-poster h-auto w-full',
      posterHidden: 'ed-device-poster ed-device-poster-hidden',
    };
  }

  return {
    frame: 'overflow-hidden rounded-2xl border border-border/70 bg-card shadow-xl shadow-primary/5',
    chrome: 'flex items-center gap-2 border-b border-border/60 bg-muted/30 px-4 py-2.5',
    dots: SHELL_DOT_CLASSES,
    title: 'ml-auto font-mono text-[10px] uppercase tracking-[0.12em] text-muted-foreground',
    screen: 'relative leading-none',
    videoHidden: 'block h-auto w-full opacity-0 pointer-events-none',
    videoVisible: 'block h-auto w-full opacity-100 transition-opacity duration-300',
    poster: 'h-auto w-full',
    posterHidden: 'absolute inset-0 h-full w-full opacity-0 pointer-events-none',
  };
}

export default function WorkspacePreview({
  messagesNamespace = 'marketing',
  shell = 'editorial',
}: WorkspacePreviewProps) {
  const t = useTranslations(messagesNamespace);
  const chrome = useMemo(() => resolvePreviewChrome(shell), [shell]);
  const [videoSourceOk, setVideoSourceOk] = useState(HERO_VIDEO_BUILD_FLAG);
  const [videoReady, setVideoReady] = useState(false);

  useEffect(() => {
    if (!HERO_VIDEO_BUILD_FLAG) {
      setVideoSourceOk(false);
      return;
    }
    let cancelled = false;
    fetch(HERO_VIDEO_SRC, { method: 'HEAD' })
      .then((res) => {
        if (!cancelled && res.ok) setVideoSourceOk(true);
      })
      .catch(() => {
        if (!cancelled) setVideoSourceOk(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const onVideoReady = useCallback(() => {
    setVideoReady(true);
  }, []);

  const onVideoError = useCallback(() => {
    setVideoReady(false);
    setVideoSourceOk(false);
  }, []);

  return (
    <div className={chrome.frame}>
      <div className={chrome.chrome} aria-hidden>
        <span className={chrome.dots[0]} />
        <span className={chrome.dots[1]} />
        <span className={chrome.dots[2]} />
        <span className={chrome.title}>MyrmAgent</span>
      </div>
      <div className={chrome.screen}>
        {videoSourceOk && (
          <video
            className={videoReady ? chrome.videoVisible : chrome.videoHidden}
            autoPlay
            muted
            loop
            playsInline
            preload="metadata"
            poster="/marketing/workspace-preview.webp"
            aria-hidden
            onLoadedData={onVideoReady}
            onCanPlay={onVideoReady}
            onError={onVideoError}
          >
            <source src={HERO_VIDEO_SRC} type="video/webm" />
          </video>
        )}
        <Image
          src="/marketing/workspace-preview.webp"
          alt={t('demo.preview.alt')}
          width={PREVIEW_WIDTH}
          height={PREVIEW_HEIGHT}
          priority
          sizes="(max-width: 1080px) 100vw, 1080px"
          className={videoReady ? chrome.posterHidden : chrome.poster}
        />
      </div>
    </div>
  );
}
