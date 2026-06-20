import path from 'node:path';
import { fileURLToPath } from 'node:url';
import createNextIntlPlugin from 'next-intl/plugin';
import type { NextConfig } from 'next';

const rootDir = path.dirname(fileURLToPath(import.meta.url));

const withNextIntl = createNextIntlPlugin('./src/i18n/request.ts');

const nextConfig: NextConfig = {
  turbopack: {
    root: rootDir,
    resolveAlias: {
      '#locales': path.join(rootDir, 'locales'),
    },
  },
  output: 'export',
  reactStrictMode: true,
  images: {
    unoptimized: true,
  },
};

export default withNextIntl(nextConfig);
