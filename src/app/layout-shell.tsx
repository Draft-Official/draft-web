'use client';

import { usePathname, useSearchParams } from "next/navigation";
import { Sidebar } from "@/shared/ui/layout/sidebar";
import { BottomNav } from "@/shared/ui/layout/bottom-nav";
import { Header as LayoutHeader } from "@/shared/ui/layout/header";
import { SignupVerifyGuard } from "@/features/auth/ui/signup-verify-guard";
import { cn } from "@/shared/lib/utils";

export function LayoutShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname() ?? '';
  const searchParams = useSearchParams();
  const isBareLayout =
    pathname.startsWith('/signup/verify') ||
    pathname === '/login' ||
    pathname.startsWith('/auth');
  const isHomeSplitOpen = pathname === '/' && Boolean(searchParams?.get('match'));
  const isSidebarCompact = isHomeSplitOpen;

  if (isBareLayout) {
    return (
      <div className="flex justify-center min-h-screen bg-(--layout-root-bg)">
        <main className="app-mobile-container min-h-screen bg-(--layout-root-bg) relative">
          {children}
        </main>
      </div>
    );
  }

  return (
    <SignupVerifyGuard>
      <div
        className={cn(
          "flex justify-center min-h-screen bg-(--layout-root-bg) transition-[padding] duration-300 ease-in-out",
          isSidebarCompact
            ? "lg:pl-(--layout-sidebar-width-compact)"
            : "lg:pl-(--layout-sidebar-width)"
        )}
      >
        {/* Desktop Sidebar (Left) */}
        <aside
          className={cn(
            "hidden lg:flex fixed left-0 top-0 h-full bg-(--layout-root-bg) z-30 justify-center transition-[width] duration-300 ease-in-out",
            isSidebarCompact
              ? "w-(--layout-sidebar-width-compact)"
              : "w-(--layout-sidebar-width)"
          )}
        >
          <div className="w-full h-full">
            <Sidebar compact={isSidebarCompact} />
          </div>
        </aside>

        {/* Main Content Area (Center) */}
        <main
          className={cn(
            "app-content-container min-h-screen bg-(--layout-root-bg) relative pb-20 lg:pb-0 border-x border-slate-50 transition-[max-width] duration-300 ease-in-out",
            isHomeSplitOpen && "app-content-container--split"
          )}
        >
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
