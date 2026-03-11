import type { MetadataRoute } from 'next';
import { getSiteUrl } from './metadata-config';

export default function robots(): MetadataRoute.Robots {
  const siteUrl = getSiteUrl().toString().replace(/\/+$/, '');

  return {
    rules: {
      userAgent: '*',
      allow: ['/', '/my/notices', '/my/faq', '/my/privacy', '/my/terms', '/matches/'],
      disallow: [
        '/auth/',
        '/login',
        '/signup/verify',
        '/matches/create',
        '/matches/*/manage',
        '/schedule',
        '/notifications',
        '/chat',
        '/chat/',
        '/team',
        '/team/',
        '/tournaments/',
        '/my',
        '/my/',
        '/my/account/',
        '/my/payment/',
        '/my/contact',
      ],
    },
    sitemap: `${siteUrl}/sitemap.xml`,
  };
}
