'use client';

import { cn } from '@/shared/lib/utils';

interface DesktopSplitViewProps {
  enabled: boolean;
  listContent: React.ReactNode;
  detailContent: React.ReactNode;
  className?: string;
  listClassName?: string;
  detailClassName?: string;
  detailInnerClassName?: string;
}

export function DesktopSplitView({
  enabled,
  listContent,
  detailContent,
  className,
  listClassName,
  detailClassName,
  detailInnerClassName,
}: DesktopSplitViewProps) {
  if (!enabled) {
    return <>{listContent}</>;
  }

  return (
    <div
      className={cn(
        'grid h-[100dvh] min-h-screen w-full grid-cols-2 gap-4 bg-background animate-in fade-in duration-300',
        className
      )}
    >
      <section
        className={cn(
          'h-full overflow-y-auto bg-white animate-in slide-in-from-left-2 duration-300',
          listClassName
        )}
      >
        {listContent}
      </section>
      <section
        className={cn(
          'h-full overflow-hidden bg-slate-50 px-2 animate-in slide-in-from-right-4 duration-300',
          detailClassName
        )}
      >
        <div
          className={cn(
            'my-3 h-[calc(100%-1.5rem)] overflow-y-auto rounded-2xl border border-slate-200 bg-white shadow-[0_6px_24px_rgba(15,23,42,0.06)]',
            detailInnerClassName
          )}
        >
          {detailContent}
        </div>
      </section>
    </div>
  );
}
