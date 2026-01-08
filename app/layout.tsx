import type { Metadata } from "next";
import "./globals.css";

import { Providers } from "./providers";
import { Toaster } from "sonner";
import { Sidebar } from "@/widgets/navigation/ui/sidebar";
import { BottomNav } from "@/widgets/navigation/ui/bottom-nav";

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
        <div className="flex justify-center min-h-screen bg-slate-50">
          {/* Desktop Sidebar (Left) */}
          <aside className="hidden md:flex fixed left-0 top-0 h-full w-[240px] border-r border-slate-100 bg-white p-6 z-30 justify-center">
            <div className="w-full h-full"> 
               <Sidebar />
            </div>
          </aside>

          {/* Main Content Area (Center) */}
          <main className="w-full max-w-[760px] md:ml-[240px] min-h-screen bg-white relative shadow-sm pb-20 md:pb-0 border-x border-slate-50/50">
            <Providers>
              {children}
            </Providers>
          </main>

          {/* Mobile Bottom Nav (Bottom) */}
          <nav className="md:hidden">
            <BottomNav />
          </nav>
        </div>
        <Toaster position="top-center" richColors />
      </body>
    </html>
  );
}
