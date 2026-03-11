import type { Metadata } from "next";
import "./globals.css";

import { Providers } from "@/src/app/providers";
import { Toaster } from '@/shared/ui/shadcn/sonner';
import { LayoutShell } from "@/src/app/layout-shell";
import {
  SITE_BRAND_NAME,
  SITE_DEFAULT_DESCRIPTION,
  SITE_DEFAULT_TITLE,
  SITE_TITLE_TEMPLATE,
  getSiteUrl,
  getMetadataBase,
} from './metadata-config';
import { Geist } from "next/font/google";

const geist = Geist({subsets:['latin'],variable:'--font-sans'});

export const metadata: Metadata = {
  metadataBase: getMetadataBase(),
  title: {
    default: SITE_DEFAULT_TITLE,
    template: SITE_TITLE_TEMPLATE,
  },
  description: SITE_DEFAULT_DESCRIPTION,
  applicationName: SITE_BRAND_NAME,
  formatDetection: {
    telephone: false,
    email: false,
    address: false,
  },
  openGraph: {
    type: 'website',
    locale: 'ko_KR',
    siteName: SITE_BRAND_NAME,
    title: SITE_DEFAULT_TITLE,
    description: SITE_DEFAULT_DESCRIPTION,
    url: getSiteUrl().toString(),
  },
  twitter: {
    card: 'summary',
    title: SITE_DEFAULT_TITLE,
    description: SITE_DEFAULT_DESCRIPTION,
  },
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko" className={geist.variable}>
      <body className="antialiased text-foreground bg-(--layout-root-bg)">
        <Providers>
          <LayoutShell>{children}</LayoutShell>
        </Providers>
        <Toaster position="top-center" richColors />
      </body>
    </html>
  );
}
