'use client';

import { usePathname } from "next/navigation";
import { Sidebar } from "@/shared/ui/layout/sidebar";
import { BottomNav } from "@/shared/ui/layout/bottom-nav";
import { Header as LayoutHeader } from "@/shared/ui/layout/header";
import { SignupVerifyGuard } from "@/features/auth/ui/signup-verify-guard";

export function LayoutShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname() ?? '';
  const isSignupVerify = pathname.startsWith('/signup/verify');

  if (isSignupVerify) {
    return (
      <div className="flex justify-center min-h-screen bg-[var(--layout-root-bg)]">
        <main className="app-mobile-container min-h-screen bg-[var(--layout-root-bg)] relative">
          {children}
        </main>
      </div>
    );
  }

  return (
    <SignupVerifyGuard>
      <div className="flex justify-center min-h-screen bg-[var(--layout-root-bg)] lg:pl-[var(--layout-sidebar-width)]">
        {/* Desktop Sidebar (Left) */}
        <aside className="hidden lg:flex fixed left-0 top-0 h-full w-[var(--layout-sidebar-width)] bg-[var(--layout-root-bg)] z-30 justify-center">
          <div className="w-full h-full">
            <Sidebar />
          </div>
        </aside>

        {/* Main Content Area (Center) */}
        <main className="app-content-container min-h-screen bg-[var(--layout-root-bg)] relative pb-20 lg:pb-0 border-x border-slate-100/50">
          <div className="lg:hidden">
            <LayoutHeader />
          </div>
          {children}
        </main>

        {/* Mobile Bottom Nav (Bottom) */}
        <nav className="lg:hidden">
          <BottomNav />
        </nav>
      </div>
    </SignupVerifyGuard>
  );
}
