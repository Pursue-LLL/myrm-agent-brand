'use client';

/**
 * [INPUT]
 * - /marketing/workspace-preview.webp (POS: Playwright 生成的产品预览静态图)
 * - /marketing/hero-demo.webm（可选，存在时优先展示录屏）
 * - next-intl marketing.demo.preview.alt
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

export default function WorkspacePreview() {
  const t = useTranslations('marketing');
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
    <div className="ed-device-frame ed-device-float">
      <div className="ed-device-chrome" aria-hidden>
        <span className="ed-device-dot" />
        <span className="ed-device-dot" />
        <span className="ed-device-dot" />
        <span className="ed-device-chrome-title ed-mono">MyrmAgent</span>
      </div>
      <div className="ed-device-screen">
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
