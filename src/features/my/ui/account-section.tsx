'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Mail, KeyRound, Link2, LogOut, UserX, ChevronRight } from 'lucide-react';
import { toast } from 'sonner';
import { Card } from '@/shared/ui/base/card';
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

const ACCOUNT_MENUS = [
  { label: '이메일 변경', href: '/my/account/email', icon: Mail },
  { label: '비밀번호 재설정', href: '/my/account/password', icon: KeyRound },
  { label: '연동된 소셜 계정 관리', href: '/my/account/social', icon: Link2 },
] as const;

export function AccountSection() {
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
    <div className="space-y-3">
      <h2 className="font-bold text-lg text-foreground">계정</h2>
      <Card className="p-0 overflow-hidden border-border">
        <div className="divide-y divide-border">
          {ACCOUNT_MENUS.map(({ label, href, icon: Icon }) => (
            <Link
              key={href}
              href={href}
              className="flex items-center justify-between p-4 hover:bg-muted/50 transition-colors"
            >
              <div className="flex items-center gap-3">
                <Icon className="h-5 w-5 text-muted-foreground" />
                <span className="text-sm font-medium text-foreground">{label}</span>
              </div>
              <ChevronRight className="h-4 w-4 text-muted-foreground" />
            </Link>
          ))}

          <button
            onClick={handleLogout}
            className="flex items-center gap-3 w-full p-4 hover:bg-muted/50 transition-colors text-left"
          >
            <LogOut className="h-5 w-5 text-destructive" />
            <span className="text-sm font-medium text-destructive">로그아웃</span>
          </button>

          <button
            onClick={() => setWithdrawOpen(true)}
            className="flex items-center gap-3 w-full p-4 hover:bg-muted/50 transition-colors text-left"
          >
            <UserX className="h-5 w-5 text-destructive" />
            <span className="text-sm font-medium text-destructive">탈퇴</span>
          </button>
        </div>
      </Card>

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
