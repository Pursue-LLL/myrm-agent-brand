import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import createNextIntlPlugin from 'next-intl/plugin';
import type { NextConfig } from 'next';

const rootDir = path.dirname(fileURLToPath(import.meta.url));
const heroDemoWebm = path.join(rootDir, 'public/marketing/hero-demo.webm');
const hasHeroDemoWebm = fs.existsSync(heroDemoWebm);

const withNextIntl = createNextIntlPlugin('./src/i18n/request.ts');

const nextConfig: NextConfig = {
  env: {
    NEXT_PUBLIC_HAS_HERO_DEMO_WEBM: hasHeroDemoWebm ? 'true' : 'false',
  },
  turbopack: {
    resolveAlias: {
      '#locales': path.join(path.dirname(fileURLToPath(import.meta.url)), 'locales'),
    },
  },
  output: 'export',
  reactStrictMode: true,
  images: {
    unoptimized: true,
  },
};

export default withNextIntl(nextConfig);
