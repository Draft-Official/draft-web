'use client';

import { useRouter } from 'next/navigation';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/shared/ui/shadcn/dialog';
import { Button } from '@/shared/ui/shadcn/button';

interface LoginRequiredModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** 로그인 후 리다이렉트할 경로 */
  redirectTo?: string;
  /** 모달 제목 (기본: "로그인이 필요합니다") */
  title?: string;
  /** 모달 설명 */
  description?: string;
}

export function LoginRequiredModal({
  open,
  onOpenChange,
  redirectTo,
  title = '로그인이 필요합니다',
  description = '이 기능을 이용하려면 로그인이 필요합니다.\n로그인 후 이용해 주세요.',
}: LoginRequiredModalProps) {
  const router = useRouter();

  const handleLogin = () => {
    onOpenChange(false);
    const loginUrl = redirectTo ? `/login?redirect=${encodeURIComponent(redirectTo)}` : '/login';
    router.push(loginUrl);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent size="xs" className="rounded-xl">
        <DialogHeader className="text-center">
          <DialogTitle className="text-lg">{title}</DialogTitle>
          <DialogDescription className="text-slate-600 mt-2 whitespace-pre-line">
            {description}
          </DialogDescription>
        </DialogHeader>
        <div className="flex flex-col gap-2 mt-4">
          <Button
            onClick={handleLogin}
            className="w-full bg-primary hover:bg-primary/90 text-white"
          >
            로그인하기
          </Button>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            className="w-full"
          >
            취소
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
