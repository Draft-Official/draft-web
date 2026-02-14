'use client';

import { SubPageHeader, NoticesList } from '@/features/my';

export default function NoticesPage() {
  return (
    <div className="min-h-screen bg-white">
      <SubPageHeader title="공지사항" />
      <main className="px-4 py-6">
        <NoticesList />
      </main>
    </div>
  );
}
