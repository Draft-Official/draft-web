'use client';

import { SubPageHeader, FaqList } from '@/features/my';

export default function FaqPage() {
  return (
    <div className="min-h-screen bg-white">
      <SubPageHeader title="FAQ" />
      <main className="px-4 py-6">
        <FaqList />
      </main>
    </div>
  );
}
