'use client';

import { X } from 'lucide-react';
import { NotificationList } from './notification-list';

interface NotificationPanelProps {
  onCloseClick?: () => void;
}

export function NotificationPanel({ onCloseClick }: NotificationPanelProps) {
  return (
    <section className="bg-white text-slate-900">
      <header className="h-14 px-5 flex items-center justify-between">
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

      <div className="max-h-[min(70vh,640px)] overflow-y-auto pb-2">
        <NotificationList />
      </div>
    </section>
  );
}
