import type { Metadata } from "next";
import "./globals.css";

import { Providers } from "./providers";
import { Toaster } from "sonner";
import { LayoutShell } from "./layout-shell";

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
    <html lang="ko">
      <body className="antialiased bg-slate-50 text-slate-900">
        <Providers>
          <LayoutShell>{children}</LayoutShell>
        </Providers>
        <Toaster position="top-center" richColors />
      </body>
    </html>
  );
}
