'use client';

import { useRouter } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/shared/ui/shadcn/button';

interface SubPageHeaderProps {
  title: string;
}

export function SubPageHeader({ title }: SubPageHeaderProps) {
  const router = useRouter();

  return (
    <header className="sticky top-0 z-50 flex items-center h-14 bg-white border-b border-slate-100">
      <Button
        variant="ghost"
        size="icon"
        className="ml-1"
        onClick={() => router.back()}
      >
        <ArrowLeft className="h-5 w-5" />
      </Button>
      <h1 className="text-lg font-bold text-foreground">{title}</h1>
    </header>
  );
}
