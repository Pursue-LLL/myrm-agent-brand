'use client';

/**
 * [INPUT]
 * - /marketing/workspace-preview.webp (POS: Playwright 生成的产品预览静态图)
 * - /marketing/hero-demo.webm（可选，存在时优先展示录屏）
 * - next-intl `{namespace}.demo.preview.alt` (marketing | cloud)
 *
 * [OUTPUT]
 * - WorkspacePreview: Hero 产品预览（浏览器框 + 可选 WebM + 静态 WebP 回退）
 *
 * [POS]
 * Landing Hero 下方「Show, don't tell」区；动效遵循 prefers-reduced-motion。
 */

import Image from 'next/image';
import { useTranslations } from 'next-intl';
import { useCallback, useEffect, useState } from 'react';

const PREVIEW_WIDTH = 1080;
const PREVIEW_HEIGHT = 520;
const HERO_VIDEO_SRC = '/marketing/hero-demo.webm';
const HERO_VIDEO_BUILD_FLAG = process.env.NEXT_PUBLIC_HAS_HERO_DEMO_WEBM === 'true';

type WorkspacePreviewMessagesNamespace = 'marketing' | 'cloud';

type WorkspacePreviewShell = 'editorial' | 'shell';

interface WorkspacePreviewProps {
  /** Root i18n namespace — keys under `{namespace}.demo.preview.alt`. */
  messagesNamespace?: WorkspacePreviewMessagesNamespace;
  /** `editorial` uses OSS landing chrome; `shell` uses theme tokens for `/cloud` and shell pages. */
  shell?: WorkspacePreviewShell;
}

export default function WorkspacePreview({
  messagesNamespace = 'marketing',
  shell = 'editorial',
}: WorkspacePreviewProps) {
  const t = useTranslations(messagesNamespace);
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

  const frameClass =
    shell === 'editorial'
      ? 'ed-device-frame ed-device-float'
      : 'overflow-hidden rounded-2xl border border-border/70 bg-card shadow-xl shadow-primary/5';
  const chromeClass =
    shell === 'editorial'
      ? 'ed-device-chrome'
      : 'flex items-center gap-2 border-b border-border/60 bg-muted/30 px-4 py-2.5';
  const dotClass = shell === 'editorial' ? 'ed-device-dot' : 'h-2.5 w-2.5 rounded-full bg-muted-foreground/30';
  const titleClass =
    shell === 'editorial'
      ? 'ed-device-chrome-title ed-mono'
      : 'ml-auto font-mono text-[10px] uppercase tracking-[0.12em] text-muted-foreground';
  const screenClass = shell === 'editorial' ? 'ed-device-screen' : 'relative leading-none';

  return (
    <div className={frameClass}>
      <div className={chromeClass} aria-hidden>
        <span className={dotClass} />
        <span className={dotClass} />
        <span className={dotClass} />
        <span className={titleClass}>MyrmAgent</span>
      </div>
      <div className={screenClass}>
        {videoSourceOk && (
          <video
            className={videoReady ? 'ed-device-video ed-device-video-visible' : 'ed-device-video'}
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
          className={videoReady ? 'ed-device-poster ed-device-poster-hidden' : 'ed-device-poster h-auto w-full'}
        />
      </div>
    </div>
  );
}
