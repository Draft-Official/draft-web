'use client';

import { Sidebar } from "@/shared/ui/layout/sidebar";
import { BottomNav } from "@/shared/ui/layout/bottom-nav";
import { Header as LayoutHeader } from "@/shared/ui/layout/header";

export function LayoutShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex justify-center min-h-screen bg-white">
      {/* Desktop Sidebar (Left) */}
      <aside className="hidden md:flex fixed left-0 top-0 h-full w-[240px] bg-white z-30 justify-center">
        <div className="w-full h-full">
          <Sidebar />
        </div>
      </aside>

      {/* Main Content Area (Center) */}
      <main className="w-full max-w-[760px] md:ml-[240px] min-h-screen bg-white relative pb-20 md:pb-0 border-x border-slate-100/50">
        <div className="md:hidden">
          <LayoutHeader />
        </div>
        {children}
      </main>

      {/* Mobile Bottom Nav (Bottom) */}
      <nav className="md:hidden">
        <BottomNav />
      </nav>
    </div>
  );
}
