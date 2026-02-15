import "@seed-design/css/base.css";
import type { Metadata } from "next";
import "./globals.css";

import { Providers } from "@/src/app/providers";
import { Toaster } from "sonner";
import { LayoutShell } from "@/src/app/layout-shell";
import { Geist } from "next/font/google";

const geist = Geist({subsets:['latin'],variable:'--font-sans'});

export const metadata: Metadata = {
  title: "DRAFT | 농구 용병 모집",
  description: "농구 용병 모집 플랫폼",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko" className={geist.variable}>
      <body className="antialiased bg-white text-slate-900">
        <Providers>
          <LayoutShell>{children}</LayoutShell>
        </Providers>
        <Toaster position="top-center" richColors />
      </body>
    </html>
  );
}
