'use client';

import { SubPageHeader, BankAccountForm } from '@/features/my/ui';

export default function BankAccountPage() {
  return (
    <div className="min-h-screen bg-white">
      <SubPageHeader title="계좌 관리" />
      <main className="px-4 py-6">
        <BankAccountForm />
      </main>
    </div>
  );
}
