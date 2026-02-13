'use client';

import { Users } from 'lucide-react';
import { cn } from '@/shared/lib/utils';
import { Badge } from '@/shared/ui/base/badge';
import { Button } from '@/shared/ui/base/button';
import type { Guest, GuestStatus } from '../../model/types';

// 탭 설정
const GUEST_TABS: { status: GuestStatus; label: string }[] = [
  { status: 'pending', label: '신청자' },
  { status: 'payment_waiting', label: '입금대기' },
  { status: 'confirmed', label: '확정' },
  { status: 'rejected', label: '거절' },
  { status: 'canceled', label: '취소' },
];

// 탭별 빈 상태 메시지
const EMPTY_MESSAGES: Record<GuestStatus, string> = {
  pending: '신청자가 없습니다.',
  payment_waiting: '입금대기 중인 게스트가 없습니다.',
  confirmed: '확정된 게스트가 없습니다.',
  rejected: '거절된 게스트가 없습니다.',
  canceled: '취소된 게스트가 없습니다.',
};

interface GuestListSectionProps {
  guests: Guest[];
  selectedTab: GuestStatus;
  onTabChange: (status: GuestStatus) => void;
  isEnded: boolean;
  onGuestClick: (guest: Guest) => void;
  onApprove: (guest: Guest) => void;
  onReject: (guest: Guest) => void;
  onConfirmPayment: (guest: Guest) => void;
  onVerifyPayment: (guest: Guest) => void;
  onCancelClick: (guest: Guest) => void;
}

export function GuestListSection({
  guests,
  selectedTab,
  onTabChange,
  isEnded,
  onGuestClick,
  onApprove,
  onReject,
  onConfirmPayment,
  onVerifyPayment,
  onCancelClick,
}: GuestListSectionProps) {
  const getTabCount = (status: GuestStatus) => {
    return guests.filter((g) => g.status === status).length;
  };

  const filteredGuests = guests.filter((g) => g.status === selectedTab);

  return (
    <section className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
      {/* 탭 */}
      <div className="flex gap-2 p-4 border-b border-slate-100 overflow-x-auto">
        {GUEST_TABS.map((tab) => {
          const count = getTabCount(tab.status);
          return (
            <button
              key={tab.status}
              onClick={() => onTabChange(tab.status)}
              className={cn(
                'px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors',
                selectedTab === tab.status
                  ? 'bg-slate-900 text-white'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              )}
            >
              {tab.label} ({count})
            </button>
          );
        })}
      </div>

      {/* 게스트 리스트 */}
      <div className="divide-y divide-slate-100">
        {filteredGuests.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-slate-400">
            <Users className="w-12 h-12 mb-3" />
            <p className="text-sm">{EMPTY_MESSAGES[selectedTab]}</p>
          </div>
        ) : (
          filteredGuests.map((guest) => (
            <GuestListItem
              key={guest.id}
              guest={guest}
              isEnded={isEnded}
              onClick={() => onGuestClick(guest)}
              onApprove={() => onApprove(guest)}
              onReject={() => onReject(guest)}
              onConfirmPayment={() => onConfirmPayment(guest)}
              onVerifyPayment={() => onVerifyPayment(guest)}
              onCancelClick={() => onCancelClick(guest)}
            />
          ))
        )}
      </div>
    </section>
  );
}

interface GuestListItemProps {
  guest: Guest;
  isEnded: boolean;
  onClick: () => void;
  onApprove: () => void;
  onReject: () => void;
  onConfirmPayment: () => void;
  onVerifyPayment: () => void;
  onCancelClick: () => void;
}

function GuestListItem({
  guest,
  isEnded,
  onClick,
  onApprove,
  onReject,
  onConfirmPayment,
  onVerifyPayment,
  onCancelClick,
}: GuestListItemProps) {
  return (
    <div
      className="p-4 hover:bg-slate-50 transition-colors cursor-pointer"
      onClick={(e) => {
        if ((e.target as HTMLElement).closest('button')) return;
        onClick();
      }}
    >
      <div className="flex items-center gap-3">
        {/* Avatar */}
        <div className="w-12 h-12 rounded-full bg-slate-200 flex items-center justify-center flex-shrink-0">
          <span className="text-slate-600 font-bold text-lg">
            {(guest.realName || guest.name).charAt(0)}
          </span>
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <p className="font-bold text-slate-900">
              {guest.realName || guest.name}
              {guest.realName && guest.realName !== guest.name && (
                <span className="text-slate-400 font-normal text-sm ml-1">({guest.name})</span>
              )}
            </p>
            {guest.companions && guest.companions.length > 0 && (
              <Badge
                variant="outline"
                className="text-[10px] px-2 py-0.5 bg-blue-50 text-blue-700 border-blue-200"
              >
                +{guest.companions.length}명
              </Badge>
            )}
            {guest.status === 'confirmed' && (
              <Badge
                variant="outline"
                className={cn(
                  'text-[10px] px-2 py-0.5',
                  guest.paymentVerified
                    ? 'bg-green-50 text-green-700 border-green-200'
                    : 'bg-yellow-50 text-yellow-700 border-yellow-200'
                )}
              >
                {guest.paymentVerified ? '입금확인' : '입금미확인'}
              </Badge>
            )}
          </div>
          <p className="text-sm text-slate-500">
            {guest.position} · {guest.level} · {guest.ageGroup}
          </p>
        </div>

        {/* Actions */}
        {!isEnded && (
          <div className="flex gap-2 flex-shrink-0">
            {guest.status === 'pending' && (
              <>
                <Button
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation();
                    onApprove();
                  }}
                  variant="outline"
                  className="h-8 px-3 text-xs border-slate-200"
                >
                  승인
                </Button>
                <Button
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation();
                    onReject();
                  }}
                  className="bg-red-100 hover:bg-red-200 text-red-600 border border-red-200 h-8 px-3 text-xs"
                >
                  거절
                </Button>
              </>
            )}

            {guest.status === 'payment_waiting' && (
              <>
                <Button
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation();
                    onConfirmPayment();
                  }}
                  variant="outline"
                  className="h-8 px-3 text-xs border-slate-200"
                >
                  입금확인
                </Button>
                <Button
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation();
                    onCancelClick();
                  }}
                  className="bg-red-100 hover:bg-red-200 text-red-600 border border-red-200 h-8 px-3 text-xs"
                >
                  취소
                </Button>
              </>
            )}

            {guest.status === 'confirmed' && (
              <>
                {!guest.paymentVerified && (
                  <Button
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      onVerifyPayment();
                    }}
                    variant="outline"
                    className="h-8 px-3 text-xs border-slate-200"
                  >
                    입금확인
                  </Button>
                )}
                <Button
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation();
                    onCancelClick();
                  }}
                  className="bg-red-100 hover:bg-red-200 text-red-600 border border-red-200 h-8 px-3 text-xs"
                >
                  취소
                </Button>
              </>
            )}
          </div>
        )}
      </div>

      {/* 동반인 서브리스트 */}
      {guest.companions && guest.companions.length > 0 && (
        <div className="mt-2 ml-14 pl-3 border-l-2 border-blue-200 space-y-1">
          {guest.companions.map((companion, idx) => (
            <div key={idx} className="flex items-center gap-2 py-1">
              <div className="w-6 h-6 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
                <span className="text-blue-600 font-bold text-[10px]">
                  {companion.name.charAt(0)}
                </span>
              </div>
              <span className="text-sm text-slate-700">{companion.name}</span>
              <span className="text-xs text-slate-400">{companion.position}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
