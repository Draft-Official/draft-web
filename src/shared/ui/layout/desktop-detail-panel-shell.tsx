'use client';

import { X } from 'lucide-react';

interface DesktopDetailPanelShellProps {
  fullPageHref: string | null;
  onClose?: () => void;
  emptyMessage?: string;
  showToolbar?: boolean;
  children?: React.ReactNode;
}

export function DesktopDetailPanelShell({
  fullPageHref,
  onClose,
  emptyMessage = '왼쪽 목록에서 항목을 선택해 주세요.',
  showToolbar = true,
  children,
}: DesktopDetailPanelShellProps) {
  if (!fullPageHref || !children) {
    return (
      <div className="h-full flex items-center justify-center px-8 text-center text-slate-500">
        {emptyMessage}
      </div>
    );
  }

  if (!showToolbar) {
    return (
      <div className="h-full overflow-y-auto bg-white">
        {children}
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col bg-white">
      <div className="flex h-11 items-center justify-between border-b border-slate-100 px-3">
        <button
          type="button"
          onClick={onClose}
          className="inline-flex items-center gap-1 rounded-md px-2 py-1 text-xs font-medium text-slate-600 hover:bg-slate-100"
        >
          <X className="h-3.5 w-3.5" />
          닫기
        </button>
        <a
          href={fullPageHref}
          className="rounded-md px-2 py-1 text-xs font-medium text-primary hover:bg-brand-weak"
        >
          전체 페이지 열기
        </a>
      </div>
      <div className="h-[calc(100%-2.75rem)] overflow-y-auto">
        {children}
      </div>
    </div>
  );
}
