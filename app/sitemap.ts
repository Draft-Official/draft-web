import type { MetadataRoute } from 'next';
import { getSiteUrl } from './metadata-config';

const INDEXED_ROUTES = ['/', '/my/notices', '/my/faq'] as const;

export default function sitemap(): MetadataRoute.Sitemap {
  const siteUrl = getSiteUrl().toString().replace(/\/+$/, '');
  const now = new Date();

  return INDEXED_ROUTES.map((route) => ({
    url: `${siteUrl}${route}`,
    lastModified: now,
    changeFrequency: route === '/' ? 'hourly' : 'monthly',
    priority: route === '/' ? 1 : 0.6,
  }));
}
