'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, Calendar, User } from 'lucide-react';

export function BottomNav() {
  const pathname = usePathname();

  const navItems = [
    {
      label: '홈',
      href: '/',
      icon: Home,
      isActive: (path: string) => path === '/',
    },
    {
      label: '내 직관',
      href: '/my-matches',
      icon: Calendar,
      isActive: (path: string) => path.startsWith('/my-matches'),
    },
    {
      label: '마이',
      href: '/my',
      icon: User,
      isActive: (path: string) => path === '/my',
    },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-[100] bg-white border-t border-[#F2F4F6] h-[60px] pb-safe">
      <div className="flex justify-around items-center h-full max-w-[430px] mx-auto">
        {navItems.map((item) => {
          const Icon = item.icon;
          const active = item.isActive(pathname);
          
          return (
            <Link
              key={item.href}
              href={item.href}
              className="flex flex-col items-center justify-center w-full h-full gap-0.5 active:bg-slate-50 transition-colors"
            >
              <Icon 
                className={active ? "text-[#191F28] fill-[#191F28]" : "text-[#B0B8C1]"} 
                size={24}
                strokeWidth={active ? 2.5 : 2}
              />
              <span className={active ? "text-[10px] font-bold text-[#191F28]" : "text-[10px] font-medium text-[#B0B8C1]"}>
                {item.label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
