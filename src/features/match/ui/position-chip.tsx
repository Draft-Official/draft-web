'use client';

import React from 'react';
import { cn } from '@/shared/lib/utils';
import { PositionStatusUI } from '../model/types';

interface PositionChipProps {
  label: string;
  status: PositionStatusUI['status'];
  max: number;
}

export function PositionChip({ label, status, max }: PositionChipProps) {
  // Figma Spec:
  // - Font Size: 11px
  // - Padding: vertical 3px, horizontal 6px
  // - Rounded: 4px
  // - Colors: 
  //   - Open: Text #4B5563 (Slate 600), Bg #F3F4F6 (Slate 100), Border #E5E7EB (Slate 200)
  //   - Closed: Text #9CA3AF (Slate 400), Bg #F9FAFB (Slate 50), Border #F3F4F6 (Slate 100)
  
  const isOpen = status === 'open';

  return (
    <div
      className={cn(
        "inline-flex items-center justify-center px-[6px] py-[3px] rounded-[4px] border text-[11px] leading-none font-medium transition-colors gap-1",
        isOpen
          ? "bg-slate-100 border-slate-200 text-slate-600"
          : "bg-slate-50 border-slate-100 text-slate-400"
      )}
    >
      <span>{label}</span>
      {isOpen ? (
        <span className="font-bold text-slate-700">
           {/* Current count is always 0 for open positions in this mock context unless specified otherwise */}
           0/{max}
        </span>
      ) : (
        <span className="font-bold text-slate-400">마감</span>
      )}
    </div>
  );
}
