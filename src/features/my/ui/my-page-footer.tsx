'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { LogOut, UserX } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/shared/ui/base/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/shared/ui/base/dialog';
import { useAuth } from '@/features/auth/model/auth-context';

export function MyPageFooter() {
  const { signOut } = useAuth();
  const router = useRouter();
  const [withdrawOpen, setWithdrawOpen] = useState(false);

  const handleLogout = async () => {
    try {
      await signOut();
      localStorage.removeItem('profileSkipped');
      router.push('/');
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  const handleWithdraw = () => {
    setWithdrawOpen(false);
    toast.info('준비 중인 기능입니다');
  };

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Button
          variant="outline"
          className="w-full justify-start p-4 h-auto font-normal text-destructive hover:text-destructive hover:bg-destructive/10"
          onClick={handleLogout}
        >
          <LogOut className="mr-3 h-5 w-5" />
          로그아웃
        </Button>
        <Button
          variant="outline"
          className="w-full justify-start p-4 h-auto font-normal text-destructive hover:text-destructive hover:bg-destructive/10"
          onClick={() => setWithdrawOpen(true)}
        >
          <UserX className="mr-3 h-5 w-5" />
          탈퇴
        </Button>
      </div>

      <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground py-2">
        <Link href="/my/terms" className="hover:underline">
          서비스 이용약관
        </Link>
        <span>·</span>
        <Link href="/my/privacy" className="hover:underline">
          개인정보 처리 방침
        </Link>
      </div>

      <Dialog open={withdrawOpen} onOpenChange={setWithdrawOpen}>
        <DialogContent className="max-w-[calc(430px-2rem)] rounded-2xl">
          <DialogHeader>
            <DialogTitle>정말 탈퇴하시겠습니까?</DialogTitle>
            <DialogDescription>
              탈퇴하면 모든 데이터가 삭제되며 복구할 수 없습니다.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="flex-row gap-2">
            <Button
              variant="outline"
              className="flex-1"
              onClick={() => setWithdrawOpen(false)}
            >
              취소
            </Button>
            <Button
              variant="destructive"
              className="flex-1"
              onClick={handleWithdraw}
            >
              탈퇴하기
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
