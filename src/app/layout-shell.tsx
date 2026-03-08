'use client';

import { Suspense } from 'react';
import { usePathname, useSearchParams } from "next/navigation";
import { Sidebar } from "@/shared/ui/layout/sidebar";
import { BottomNav } from "@/shared/ui/layout/bottom-nav";
import { Header as LayoutHeader } from "@/shared/ui/layout/header";
import { CreateMenuButton } from "@/features/create";
import { NotificationBell } from "@/features/notification/ui/notification-bell";
import { SignupVerifyGuard } from "@/features/auth/ui/signup-verify-guard";
import { useMediaQuery } from '@/shared/lib/hooks/use-media-query';
import { DESKTOP_SIDEBAR_EXPANDED_MIN_WIDTH } from '@/shared/lib/layout/sidebar-layout';
import { cn } from "@/shared/lib/utils";

export function LayoutShell({ children }: { children: React.ReactNode }) {
  return (
    <Suspense fallback={<>{children}</>}>
      <LayoutShellContent>{children}</LayoutShellContent>
    </Suspense>
  );
}

function LayoutShellContent({ children }: { children: React.ReactNode }) {
  const pathname = usePathname() ?? '';
  const searchParams = useSearchParams();
  const isDesktop = useMediaQuery('(min-width: 1024px)');
  const isCompactDesktopViewport = useMediaQuery(
    `(max-width: ${DESKTOP_SIDEBAR_EXPANDED_MIN_WIDTH - 1}px)`
  );
  const isBareLayout =
    pathname.startsWith('/signup/verify') ||
    pathname === '/login' ||
    pathname.startsWith('/auth');
  const isHomeSplitOpen = pathname === '/' && Boolean(searchParams?.get('match'));
  const isScheduleSplitOpen = pathname === '/schedule' && Boolean(searchParams?.get('detail'));
  const isTeamSplitOpen =
    (pathname === '/team' || pathname.startsWith('/team/')) &&
    Boolean(searchParams?.get('detail'));
  const isChatSplitOpen = pathname === '/chat' && isDesktop;
  const isDesktopSplitOpen =
    isHomeSplitOpen || isScheduleSplitOpen || isTeamSplitOpen || isChatSplitOpen;
  const isSidebarCompact = Boolean(isDesktop && isCompactDesktopViewport);

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
            "hidden lg:flex fixed left-0 top-0 h-screen bg-(--layout-root-bg) z-30 justify-center transition-[width] duration-300 ease-in-out",
            isSidebarCompact
              ? "w-(--layout-sidebar-width-compact)"
              : "w-(--layout-sidebar-width)"
          )}
        >
          <div className="w-full h-full">
            <Sidebar
              compact={isSidebarCompact}
              actionSlot={(
                <div className={cn(
                  "flex w-full flex-col gap-1"
                )}>
                  <NotificationBell
                    mode="panel"
                    desktopPresentation="left-sheet"
                    variant="sidebar"
                    compact={isSidebarCompact}
                  />
                  <CreateMenuButton
                    compact={isSidebarCompact}
                    variant="sidebar"
                  />
                </div>
              )}
            />
          </div>
        </aside>

        {/* Main Content Area (Center) */}
        <main
          className={cn(
            "app-content-container min-h-screen lg:min-h-screen bg-(--layout-root-bg) relative pb-20 lg:pb-0 transition-[max-width] duration-300 ease-in-out",
            isDesktopSplitOpen && "app-content-container--split"
          )}
        >
          {!isDesktop && (
            <LayoutHeader
              rightSlot={(
                <div className="flex items-center gap-1.5">
                  <CreateMenuButton />
                  <NotificationBell mode="panel" />
                </div>
              )}
            />
          )}
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
