'use client';

import { Settings } from 'lucide-react';
import { NotificationList } from './notification-list';

interface NotificationPanelProps {
  onSettingsClick?: () => void;
}

export function NotificationPanel({ onSettingsClick }: NotificationPanelProps) {
  return (
    <section className="bg-white text-slate-900">
      <header className="h-14 px-5 flex items-center justify-between">
        <h2 className="text-2xl font-bold tracking-tight">알림</h2>
        <button
          type="button"
          onClick={onSettingsClick}
          className="flex items-center justify-center w-9 h-9 rounded-full text-slate-600 hover:bg-slate-100 hover:text-slate-800 transition-colors"
          aria-label="알림 설정"
        >
          <Settings className="w-5 h-5" />
        </button>
      </header>

      <div className="max-h-[min(70vh,640px)] overflow-y-auto pb-2">
        <NotificationList />
      </div>
    </section>
  );
}
