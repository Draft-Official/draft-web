'use client';

import React from 'react';
import { cn } from '@/shared/lib/utils';
import { ChevronDown } from 'lucide-react';

interface FilterChipProps {
  label: string;
  isActive?: boolean;
  hasDropdown?: boolean;
  onClick?: () => void;
  className?: string;
}

export function FilterChip({ 
  label, 
  isActive, 
  hasDropdown, 
  onClick,
  className 
}: FilterChipProps) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "flex items-center gap-1 px-4 h-[34px] rounded-full border text-[13px] font-medium transition-all whitespace-nowrap active:scale-95",
        isActive 
          ? "border-[#FF6600] bg-[#FFF0E6] text-[#FF6600]" 
          : "border-gray-200 bg-white text-gray-700 hover:border-gray-300",
        className
      )}
    >
      <span>{label}</span>
      {hasDropdown && (
        <ChevronDown 
          className={cn(
            "w-3.5 h-3.5",
            isActive ? "text-[#FF6600]" : "text-gray-500"
          )} 
        />
      )}
    </button>
  );
}
