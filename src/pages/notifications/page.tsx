'use client';

import { useRouter } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';
import { NotificationList } from '@/features/notification/ui/notification-list';

export default function NotificationsPage() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-white/80 backdrop-blur-md border-b border-slate-100 h-[52px] flex items-center px-2">
        <button
          onClick={() => router.back()}
          className="p-2.5 text-slate-900 hover:bg-slate-50 rounded-full transition-colors"
        >
          <ArrowLeft className="w-6 h-6" />
        </button>
        <h1 className="text-lg font-bold text-slate-900 ml-1">알림</h1>
      </header>

      {/* Content */}
      <NotificationList />
    </div>
  );
}
