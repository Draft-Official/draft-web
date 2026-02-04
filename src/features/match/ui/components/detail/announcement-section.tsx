'use client';

import { Megaphone } from 'lucide-react';

interface Announcement {
  id: string;
  message: string;
  createdAt: string;
}

interface AnnouncementSectionProps {
  announcements: Announcement[];
}

function getRelativeTime(dateStr: string): string {
  const now = new Date();
  const date = new Date(dateStr);
  const diffMs = now.getTime() - date.getTime();
  const diffMin = Math.floor(diffMs / 60000);

  if (diffMin < 1) return '방금 전';
  if (diffMin < 60) return `${diffMin}분 전`;

  const diffHours = Math.floor(diffMin / 60);
  if (diffHours < 24) return `${diffHours}시간 전`;

  const diffDays = Math.floor(diffHours / 24);
  if (diffDays < 30) return `${diffDays}일 전`;

  const diffMonths = Math.floor(diffDays / 30);
  return `${diffMonths}개월 전`;
}

export function AnnouncementSection({ announcements }: AnnouncementSectionProps) {
  if (!announcements || announcements.length === 0) return null;

  return (
    <div className="bg-orange-50 px-5 py-4 space-y-3">
      <div className="flex items-center gap-2">
        <Megaphone className="w-4 h-4 text-primary" />
        <h3 className="text-sm font-bold text-slate-900">공지</h3>
      </div>

      <div className="space-y-3">
        {announcements.map((announcement) => (
          <div key={announcement.id} className="space-y-1">
            <p className="text-sm text-slate-800 whitespace-pre-wrap leading-relaxed">
              {announcement.message}
            </p>
            <p className="text-xs text-slate-400">
              {getRelativeTime(announcement.createdAt)}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
