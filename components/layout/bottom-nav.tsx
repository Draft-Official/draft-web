'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, Calendar, User } from 'lucide-react';
import { Button } from '@/components/ui/button';

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
      isActive: (path: string) => path === '/my' || (path.startsWith('/my/') && !path.startsWith('/my-matches')),
    },
  ];

  return (
    <nav className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[430px] z-50 bg-white border-t border-border h-[60px] flex justify-around items-center pb-safe">
      {navItems.map((item) => {
        const Icon = item.icon;
        const active = item.isActive(pathname);
        
        return (
          <Link
            key={item.href}
            href={item.href}
            className={`flex flex-col items-center justify-center p-2 w-full h-full space-y-0.5 transition-colors ${
              active ? 'text-primary' : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            <Icon className={`h-6 w-6 ${active ? 'fill-current' : ''}`} strokeWidth={active ? 2.5 : 2} />
            <span className="text-[10px] font-medium">{item.label}</span>
          </Link>
        );
      })}
    </nav>
  );
}
