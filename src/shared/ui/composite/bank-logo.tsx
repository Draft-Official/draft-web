'use client';

import { useEffect, useMemo, useState } from 'react';
import Image from 'next/image';

import { getBankBadgeText, getBankLogoPath } from '@/shared/lib/bank-logo';
import { cn } from '@/shared/lib/utils';

interface BankLogoProps {
  bankName: string;
  className?: string;
}

const BANK_BADGE_STYLES: Record<string, string> = {
  'KB국민은행': 'bg-amber-100 text-amber-800',
  신한은행: 'bg-blue-100 text-blue-700',
  우리은행: 'bg-cyan-100 text-cyan-700',
  하나은행: 'bg-emerald-100 text-emerald-700',
  'NH농협은행': 'bg-green-100 text-green-700',
  카카오뱅크: 'bg-yellow-100 text-yellow-800',
  토스뱅크: 'bg-sky-100 text-sky-700',
};

export function BankLogo({ bankName, className }: BankLogoProps) {
  const logoPath = useMemo(() => getBankLogoPath(bankName), [bankName]);
  const [failedToLoad, setFailedToLoad] = useState(false);

  useEffect(() => {
    setFailedToLoad(false);
  }, [logoPath]);

  if (logoPath && !failedToLoad) {
    return (
      <span
        aria-hidden="true"
        className={cn(
          'inline-flex h-5 w-5 shrink-0 items-center justify-center overflow-hidden rounded-md bg-white',
          className
        )}
      >
        <Image
          src={logoPath}
          alt=""
          width={20}
          height={20}
          className="h-full w-full object-contain"
          onError={() => setFailedToLoad(true)}
        />
      </span>
    );
  }

  const badgeClass = BANK_BADGE_STYLES[bankName] ?? 'bg-slate-100 text-slate-600';
  return (
    <span
      aria-hidden="true"
      className={cn(
        'inline-flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-[10px] font-semibold',
        badgeClass,
        className
      )}
    >
      {getBankBadgeText(bankName)}
    </span>
  );
}
