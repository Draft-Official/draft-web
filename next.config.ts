import type { NextConfig } from "next";

const remotePatterns: NonNullable<NextConfig['images']>['remotePatterns'] = [
  {
    protocol: 'https',
    hostname: 'k.kakaocdn.net',
  },
  {
    protocol: 'http',
    hostname: 'k.kakaocdn.net',
  },
  {
    protocol: 'http',
    hostname: 'img1.kakaocdn.net',
  },
  {
    protocol: 'https',
    hostname: 'img1.kakaocdn.net',
  },
];

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
if (supabaseUrl) {
  try {
    const parsed = new URL(supabaseUrl);
    remotePatterns.push({
      protocol: parsed.protocol.replace(':', '') as 'https' | 'http',
      hostname: parsed.hostname,
    });
  } catch {
    // ignore invalid env format
  }
}

const nextConfig: NextConfig = {
  images: {
    remotePatterns,
  },
  headers: async () => [
    {
      source: '/:path*',
      headers: [
        {
          key: 'X-Frame-Options',
          value: 'DENY',
        },
        {
          key: 'X-Content-Type-Options',
          value: 'nosniff',
        },
        {
          key: 'Referrer-Policy',
          value: 'strict-origin-when-cross-origin',
        },
        {
          key: 'X-XSS-Protection',
          value: '1; mode=block',
        },
      ],
    },
  ],
};

export default nextConfig;
