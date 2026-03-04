'use client';

import { X } from 'lucide-react';

interface DesktopRouteDetailPanelProps {
  routePath: string | null;
  onClose?: () => void;
  emptyMessage?: string;
}

function buildEmbeddedRoute(routePath: string) {
  const [pathAndQuery, hash] = routePath.split('#', 2);
  const separator = pathAndQuery.includes('?') ? '&' : '?';
  const withEmbed = `${pathAndQuery}${separator}embed=1`;
  return hash ? `${withEmbed}#${hash}` : withEmbed;
}

export function DesktopRouteDetailPanel({
  routePath,
  onClose,
  emptyMessage = '왼쪽 리스트에서 항목을 선택해 주세요.',
}: DesktopRouteDetailPanelProps) {
  if (!routePath) {
    return (
      <div className="h-full flex items-center justify-center px-8 text-center text-slate-500">
        {emptyMessage}
      </div>
    );
  }

  const embeddedRoute = buildEmbeddedRoute(routePath);

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
          href={routePath}
          className="rounded-md px-2 py-1 text-xs font-medium text-primary hover:bg-brand-weak"
        >
          전체 페이지 열기
        </a>
      </div>
      <iframe
        key={embeddedRoute}
        src={embeddedRoute}
        title="상세 페이지"
        className="h-[calc(100%-2.75rem)] w-full border-0 bg-white"
      />
    </div>
  );
}
