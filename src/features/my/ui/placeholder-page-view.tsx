'use client';

import { Construction } from 'lucide-react';

export function PlaceholderPageView() {
  return (
    <div className="flex flex-col items-center justify-center py-32 px-4 text-center">
      <Construction className="h-12 w-12 text-muted-foreground mb-4" />
      <p className="text-lg font-bold text-foreground mb-1">준비 중입니다</p>
      <p className="text-sm text-muted-foreground">
        해당 기능은 곧 제공될 예정입니다
      </p>
    </div>
  );
}
