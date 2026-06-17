/**
 * [INPUT]
 * - NEXT_PUBLIC_SITE_URL 环境变量
 *
 * [OUTPUT]
 * - sitemap(): `/sitemap.xml` 静态路由（含 `/cloud` SaaS 页）
 *
 * [POS]
 * SEO sitemap 生成器。云页上线时加入 `/cloud`，见 DUAL_PAGE_SYSTEM.md。
 */
import type { MetadataRoute } from 'next';

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://myrmagent.ai';

export const dynamic = 'force-static';

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    { url: BASE_URL, lastModified: new Date(), changeFrequency: 'weekly', priority: 1 },
    { url: `${BASE_URL}/cloud`, lastModified: new Date(), changeFrequency: 'weekly', priority: 0.95 },
    { url: `${BASE_URL}/download`, lastModified: new Date(), changeFrequency: 'weekly', priority: 0.9 },
    { url: `${BASE_URL}/terms`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.3 },
    { url: `${BASE_URL}/privacy`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.3 },
  ];
}
