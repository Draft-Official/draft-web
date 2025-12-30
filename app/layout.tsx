import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Header } from "@/components/layout/header";
import { BottomNav } from "@/components/layout/bottom-nav";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "DRAFT | 농구 용병 모집",
  description: "앱 설치 없이 링크 하나로 끝내는 농구 용병 모집 플랫폼",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-neutral-900`}
      >
        <div className="w-full max-w-[430px] mx-auto min-h-screen bg-white shadow-2xl relative flex flex-col">
            <Header />
            <main className="flex-1 pb-[60px]">
              {children}
            </main>
            <BottomNav />
        </div>
      </body>
    </html>
  );
}
