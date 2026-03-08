'use client';

import { X } from 'lucide-react';
import { NotificationList } from './notification-list';
import { cn } from '@/shared/lib/utils';

interface NotificationPanelProps {
  onCloseClick?: () => void;
  mode?: 'sheet' | 'popover';
}

export function NotificationPanel({ onCloseClick, mode = 'popover' }: NotificationPanelProps) {
  return (
    <section className={cn('bg-white text-slate-900', mode === 'sheet' && 'flex h-full min-h-0 flex-col')}>
      <header className="flex h-14 shrink-0 items-center justify-between px-5">
        <h2 className="text-2xl font-bold tracking-tight">알림</h2>
        <button
          type="button"
          onClick={onCloseClick}
          className="flex items-center justify-center w-9 h-9 rounded-full text-slate-600 hover:bg-slate-100 hover:text-slate-800 transition-colors"
          aria-label="알림 닫기"
        >
          <X className="w-5 h-5" />
        </button>
      </header>

      <div
        className={cn(
          'overflow-y-auto',
          mode === 'sheet'
            ? 'min-h-0 flex-1 pb-[calc(env(safe-area-inset-bottom)+8px)]'
            : 'max-h-[min(70vh,640px)] pb-2'
        )}
      >
        <NotificationList />
      </div>
    </section>
  );
}
