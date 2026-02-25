'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Phone, LogOut, UserX, AlertTriangle } from 'lucide-react';
import { toast } from '@/shared/ui/shadcn/sonner';
import { Button } from '@/shared/ui/shadcn/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/shared/ui/shadcn/dialog';
import { useAuth, useDeleteAccount } from '@/shared/session';
import { Spinner } from '@/shared/ui/shadcn/spinner';
import { ConfirmDialog } from '@/shared/ui/composite/confirm-dialog';
import { MenuSection } from './menu-section';

export function AccountSection() {
  const { signOut } = useAuth();
  const router = useRouter();
  const [logoutOpen, setLogoutOpen] = useState(false);
  const [withdrawOpen, setWithdrawOpen] = useState(false);
  const [confirmedCount, setConfirmedCount] = useState<number | null>(null);
  const [loadingCheck, setLoadingCheck] = useState(false);
  const [settlementAcknowledged, setSettlementAcknowledged] = useState(false);
  const deleteAccount = useDeleteAccount();

  useEffect(() => {
    if (!withdrawOpen) {
      setConfirmedCount(null);
      setSettlementAcknowledged(false);
      return;
    }

    const fetchConfirmedCount = async () => {
      setLoadingCheck(true);
      try {
        const res = await fetch('/api/account/delete');
        if (res.ok) {
          const data = await res.json();
          setConfirmedCount(data.confirmedCount ?? 0);
        } else {
          setConfirmedCount(0);
        }
      } catch {
        setConfirmedCount(0);
      } finally {
        setLoadingCheck(false);
      }
    };

    fetchConfirmedCount();
  }, [withdrawOpen]);

  const handleLogout = async () => {
    try {
      await signOut();
      localStorage.removeItem('profileSkipped');
      router.push('/');
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  const handleWithdraw = async () => {
    try {
      await deleteAccount.mutateAsync();
      localStorage.removeItem('profileSkipped');
      localStorage.removeItem('draft-query-cache');
      try { await signOut(); } catch { /* ignore */ }
      setWithdrawOpen(false);
      toast.success('탈퇴가 완료되었습니다.');
      router.push('/');
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : '탈퇴 처리 중 오류가 발생했습니다.',
      );
    }
  };

  const hasConfirmed = confirmedCount !== null && confirmedCount > 0;
  const canSubmit = hasConfirmed ? settlementAcknowledged : true;

  const ACCOUNT_MENUS = [
    { label: '전화번호 변경', href: '/my/account/phone', icon: Phone },
    { label: '로그아웃', icon: LogOut, onClick: () => setLogoutOpen(true), variant: 'destructive' as const },
    { label: '탈퇴', icon: UserX, onClick: () => setWithdrawOpen(true), variant: 'destructive' as const },
  ];

  return (
    <>
      <MenuSection title="계정" items={ACCOUNT_MENUS} />

      <ConfirmDialog
        open={logoutOpen}
        onOpenChange={setLogoutOpen}
        icon={LogOut}
        title="로그아웃 하시겠습니까?"
        confirmLabel="로그아웃"
        variant="destructive"
        onConfirm={handleLogout}
      />

      <Dialog open={withdrawOpen} onOpenChange={setWithdrawOpen}>
        <DialogContent size="app" className="rounded-2xl">
          <DialogHeader className="items-center text-center">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-red-50">
              <UserX className="h-6 w-6 text-red-500" />
            </div>
            <DialogTitle>정말 탈퇴하시겠습니까?</DialogTitle>
            <DialogDescription>
              탈퇴하면 모든 개인정보가 삭제되며 복구할 수 없습니다.
            </DialogDescription>
          </DialogHeader>

          {loadingCheck ? (
            <div className="flex items-center justify-center py-4">
              <Spinner className="h-5 w-5 text-muted-foreground" />
            </div>
          ) : (
            <>
              {hasConfirmed && (
                <>
                  <div className="rounded-lg bg-red-50 border border-red-200 p-4 space-y-2">
                    <div className="flex items-start gap-2">
                      <AlertTriangle className="h-4 w-4 text-red-600 mt-0.5 shrink-0" />
                      <p className="text-sm text-red-700 font-bold">
                        현재 입금 완료된 확정자 {confirmedCount}명이 있습니다.
                      </p>
                    </div>
                    <p className="text-xs text-red-600 leading-relaxed">
                      모든 확정자에게 참가비를 환불해야 할 책임이 호스트에게
                      있습니다. 환불 없는 탈퇴 시 제재를 받을 수 있습니다.
                    </p>
                  </div>

                  <label className="flex items-start gap-3 cursor-pointer rounded-lg border border-slate-200 p-3 hover:bg-slate-50 transition-colors">
                    <input
                      type="checkbox"
                      checked={settlementAcknowledged}
                      onChange={(e) => setSettlementAcknowledged(e.target.checked)}
                      className="w-4 h-4 mt-0.5 rounded border-slate-300 accent-primary shrink-0"
                    />
                    <span className="text-sm text-slate-700 font-medium leading-snug">
                      모든 확정자에 대한 참가비 정산을 완료했습니다.
                    </span>
                  </label>
                </>
              )}

              <DialogFooter className="flex-row gap-2">
                <Button
                  variant="outline"
                  className="flex-1"
                  onClick={() => setWithdrawOpen(false)}
                  disabled={deleteAccount.isPending}
                >
                  취소
                </Button>
                <Button
                  variant="destructive"
                  className="flex-1"
                  onClick={handleWithdraw}
                  disabled={!canSubmit || deleteAccount.isPending}
                >
                  {deleteAccount.isPending ? (
                    <>
                      <Spinner className="mr-2 h-4 w-4" />
                      처리 중...
                    </>
                  ) : (
                    '탈퇴하기'
                  )}
                </Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
