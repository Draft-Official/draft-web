'use client';

import { Landmark } from 'lucide-react';
import { MenuSection } from './menu-section';

const PAYMENT_MENUS = [
  { label: '계좌 관리', href: '/my/payment/bank-account', icon: Landmark },
] as const;

export function PaymentSection() {
  return <MenuSection title="결제" items={PAYMENT_MENUS} />;
}
