'use client';

import { SubPageHeader, ContactView } from '@/features/my/ui';

export default function ContactPage() {
  return (
    <div className="min-h-screen bg-white">
      <SubPageHeader title="문의하기" />
      <ContactView />
    </div>
  );
}
