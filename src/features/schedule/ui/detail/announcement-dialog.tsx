'use client';

import { useState } from 'react';
import { Button } from '@/shared/ui/base/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/shared/ui/base/dialog';

const MAX_LENGTH = 1000;

interface AnnouncementDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (message: string) => void;
}

export function AnnouncementDialog({
  open,
  onOpenChange,
  onSubmit,
}: AnnouncementDialogProps) {
  const [message, setMessage] = useState('');

  const handleOpenChange = (isOpen: boolean) => {
    if (!isOpen) {
      setMessage('');
    }
    onOpenChange(isOpen);
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="max-w-sm mx-4 rounded-2xl p-6">
        <DialogHeader>
          <DialogTitle>공지하기</DialogTitle>
          <DialogDescription className="text-slate-600 pt-2">
            신청자들에게 공지를 보냅니다.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-2 pt-2">
          <textarea
            value={message}
            onChange={(e) => {
              if (e.target.value.length <= MAX_LENGTH) {
                setMessage(e.target.value);
              }
            }}
            placeholder="신청자들에게 전달할 내용을 입력해주세요."
            className="w-full min-h-[120px] rounded-xl border border-slate-200 p-3 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
          />
          <p className="text-xs text-slate-400 text-right">
            {message.length}/{MAX_LENGTH}
          </p>
        </div>

        <div className="flex gap-2 pt-2">
          <Button
            onClick={() => handleOpenChange(false)}
            variant="outline"
            className="flex-1 h-12 rounded-xl font-bold"
          >
            닫기
          </Button>
          <Button
            onClick={() => {
              onSubmit(message.trim());
              handleOpenChange(false);
            }}
            disabled={message.trim().length === 0}
            className="flex-1 bg-primary hover:bg-primary/90 text-white h-12 rounded-xl font-bold"
          >
            보내기
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
