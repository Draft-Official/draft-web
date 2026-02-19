'use client';

import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { cn } from '@/shared/lib/utils';

export interface DateOption {
  dateISO: string;
  dayStr: string;
  dayNum: number | string;
  label?: string;
  isToday?: boolean;
}

interface DateStripProps {
  dates: DateOption[];
  selectedDate: string | null;
  onSelect: (date: string | null) => void;
  showAllOption?: boolean;
  className?: string;
  listClassName?: string;
}

export function DateStrip({
  dates,
  selectedDate,
  onSelect,
  showAllOption = false,
  className,
  listClassName = 'px-(--dimension-spacing-x-global-gutter)',
}: DateStripProps) {
  const viewportRef = React.useRef<HTMLDivElement>(null);
  const [canScrollPrev, setCanScrollPrev] = React.useState(false);
  const [canScrollNext, setCanScrollNext] = React.useState(false);

  const updateArrowState = React.useCallback(() => {
    const el = viewportRef.current;
    if (!el) return;

    const maxScrollLeft = el.scrollWidth - el.clientWidth;
    const threshold = 2;

    setCanScrollPrev(el.scrollLeft > threshold);
    setCanScrollNext(el.scrollLeft < maxScrollLeft - threshold);
  }, []);

  React.useEffect(() => {
    const el = viewportRef.current;
    if (!el) return;

    updateArrowState();

    const handleScroll = () => updateArrowState();
    el.addEventListener('scroll', handleScroll, { passive: true });

    let resizeObserver: ResizeObserver | null = null;
    if (typeof ResizeObserver !== 'undefined') {
      resizeObserver = new ResizeObserver(() => updateArrowState());
      resizeObserver.observe(el);
      if (el.firstElementChild) {
        resizeObserver.observe(el.firstElementChild);
      }
    }

    return () => {
      el.removeEventListener('scroll', handleScroll);
      resizeObserver?.disconnect();
    };
  }, [dates.length, showAllOption, listClassName, updateArrowState]);

  const handleArrowClick = React.useCallback((direction: 'prev' | 'next') => {
    const el = viewportRef.current;
    if (!el) return;

    const targetLeft = direction === 'next' ? el.scrollWidth : 0;
    el.scrollTo({ left: targetLeft, behavior: 'smooth' });
  }, []);

  return (
    <div className={cn('relative w-full', className)}>
      <div ref={viewportRef} className="w-full overflow-x-auto no-scrollbar scroll-smooth">
        <div
          className={cn(
            'flex gap-(--dimension-spacing-x-between-chips) pb-1 min-w-max',
            listClassName
          )}
        >
          {showAllOption && (
            <button
              data-date-strip-item
              type="button"
              onClick={() => onSelect(null)}
              className={cn(
                'flex flex-col items-center justify-center gap-(--dimension-spacing-y-between-text) min-w-[64px] h-[64px] rounded-xl border transition-colors active:scale-95 flex-shrink-0',
                selectedDate === null
                  ? 'bg-foreground border-foreground text-background'
                  : 'bg-background border-border text-foreground/80 hover:bg-muted/60'
              )}
            >
              <span className="text-[11px] font-medium">전체</span>
              <span className="text-[13px] font-bold">보기</span>
            </button>
          )}

          {dates.map((d) => (
            <button
              data-date-strip-item
              type="button"
              key={d.dateISO}
              onClick={() => onSelect(d.dateISO)}
              className={cn(
                'flex flex-col items-center justify-center gap-(--dimension-spacing-y-between-text) min-w-[64px] h-[64px] rounded-xl border transition-colors active:scale-95 flex-shrink-0',
                selectedDate === d.dateISO
                  ? 'bg-foreground border-foreground text-background'
                  : 'bg-background border-border text-muted-foreground hover:bg-muted/60'
              )}
            >
              <span
                className={cn(
                  'text-[11px] font-medium',
                  selectedDate === d.dateISO ? 'text-background/80' : 'text-muted-foreground'
                )}
              >
                {d.dayStr}
              </span>
              <span className="text-lg font-bold leading-none">{d.dayNum}</span>
            </button>
          ))}
        </div>
      </div>

      {canScrollPrev && (
        <div className="pointer-events-none absolute left-0 top-0 bottom-0 flex items-center">
          <button
            type="button"
            aria-label="이전 날짜 보기"
            onClick={() => handleArrowClick('prev')}
            className="pointer-events-auto absolute left-1 inline-flex h-7 w-7 items-center justify-center rounded-full border border-border bg-background text-foreground hover:bg-muted"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
        </div>
      )}

      {canScrollNext && (
        <div className="pointer-events-none absolute right-0 top-0 bottom-0 flex items-center">
          <button
            type="button"
            aria-label="다음 날짜 보기"
            onClick={() => handleArrowClick('next')}
            className="pointer-events-auto absolute right-1 inline-flex h-7 w-7 items-center justify-center rounded-full border border-border bg-background text-foreground hover:bg-muted"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      )}
    </div>
  );
}
