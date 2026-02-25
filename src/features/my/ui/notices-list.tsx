'use client';

import { useQuery } from '@tanstack/react-query';
import { Megaphone } from 'lucide-react';
import { getSupabaseBrowserClient } from '@/shared/api/supabase/client';
import { Card } from '@/shared/ui/shadcn/card';
import { Spinner } from '@/shared/ui/shadcn/spinner';

interface PlatformAnnouncement {
  id: string;
  message: string;
  created_at: string;
}

function formatDate(dateStr: string): string {
  const date = new Date(dateStr);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}.${month}.${day}`;
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
  if (diffDays < 7) return `${diffDays}일 전`;

  return formatDate(dateStr);
}

export function NoticesList() {
  const { data: notices = [], isLoading, error } = useQuery({
    queryKey: ['platform-announcements'],
    queryFn: async () => {
      // announcements 테이블은 generated types에 미반영 - 타입 우회
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const supabase = getSupabaseBrowserClient() as any;
      const { data, error } = await supabase
        .from('announcements')
        .select('id, message, created_at')
        .eq('target_type', 'SYSTEM')
        .order('created_at', { ascending: false });

      if (error) throw error;
      return (data || []) as PlatformAnnouncement[];
    },
  });

  if (isLoading) {
    return (
      <div className="flex justify-center py-12">
        <Spinner className="h-6 w-6 text-muted-foreground" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12 text-slate-500">
        공지사항을 불러오는데 실패했습니다.
      </div>
    );
  }

  if (notices.length === 0) {
    return (
      <div className="text-center py-12">
        <Megaphone className="h-12 w-12 text-slate-300 mx-auto mb-3" />
        <p className="text-slate-500">아직 공지사항이 없습니다.</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {notices.map((notice) => (
        <Card key={notice.id} className="p-4">
          <div className="space-y-2">
            <p className="text-base text-slate-700 whitespace-pre-wrap leading-relaxed">
              {notice.message}
            </p>
            <p className="text-xs text-muted-foreground">
              {getRelativeTime(notice.created_at)}
            </p>
          </div>
        </Card>
      ))}
    </div>
  );
}
