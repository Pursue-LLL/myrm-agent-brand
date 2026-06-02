import type { MetadataRoute } from 'next';

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://myrmagent.ai';

export const dynamic = 'force-static';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [{ userAgent: '*', allow: '/' }],
    sitemap: `${BASE_URL}/sitemap.xml`,
  };
}
