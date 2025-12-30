import React from 'react';
import { Bell, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';

export function Header() {
  return (
    <header className="sticky top-0 z-50 w-full bg-white/80 backdrop-blur-md border-b border-border h-14 px-4 flex items-center justify-between">
      {/* Logo Area */}
      <div className="flex items-center">
        <span className="text-xl font-black italic tracking-tighter text-primary">DRAFT</span>
      </div>

      {/* Right Actions */}
      <div className="flex items-center gap-1">
        <Button variant="ghost" size="icon" className="h-9 w-9 text-muted-foreground">
          <Search className="h-5 w-5" />
        </Button>
        <Button variant="ghost" size="icon" className="h-9 w-9 text-muted-foreground relative">
          <Bell className="h-5 w-5" />
          <span className="absolute top-2 right-2.5 w-2 h-2 bg-red-500 rounded-full border border-white" />
        </Button>
      </div>
    </header>
  );
}
