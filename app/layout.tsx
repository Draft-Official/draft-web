import type { Metadata } from "next";
import "./globals.css";

import { Providers } from "./providers";

export const metadata: Metadata = {
  title: "DRAFT | 농구 용병 모집",
  description: "농구 용병 모집 플랫폼",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko">
      <body className="antialiased bg-slate-50 text-slate-900">
        <main className="w-full max-w-[760px] mx-auto min-h-screen bg-white relative shadow-sm">
          <Providers>
            {children}
          </Providers>
        </main>
      </body>
    </html>
  );
}
