'use client';

import React from 'react';
import { cn } from '@/shared/lib/utils';
import { Check, ChevronDown } from 'lucide-react';
import { cva, type VariantProps } from 'class-variance-authority';

/**
 * Chip Component - Reusable selection chip with soft styling
 *
 * Variants:
 * - orange: Primary brand color (시설 정보) - soft pastel style
 * - slate: Secondary color (매치 조건) - soft pastel style
 * - navy: Solid dark style (날짜 선택과 동일) - solid style
 *
 * Soft variants:
 * - Active: light pastel background + brand color text/border
 * - Inactive: white background + gray text/border
 *
 * Navy variant:
 * - Active: dark navy background + white text
 * - Inactive: white background + gray text/border
 */

const chipVariants = cva(
  "inline-flex items-center gap-1.5 rounded-full border font-medium transition-all cursor-pointer whitespace-nowrap active:scale-95",
  {
    variants: {
      variant: {
        orange: [
          // Inactive state: white background with gray text
          "bg-white text-slate-600 border-slate-300 hover:border-slate-400",
          // Active state: soft pastel orange background with brand orange text
          "data-[active=true]:bg-orange-50 data-[active=true]:text-orange-700 data-[active=true]:border-orange-200",
        ],
        slate: [
          // Inactive state: white background with gray text
          "bg-white text-slate-500 border-slate-200",
          // Active state: darker slate background with dark slate text (enhanced contrast)
          "data-[active=true]:bg-slate-200 data-[active=true]:text-slate-900 data-[active=true]:border-slate-900 data-[active=true]:font-bold",
        ],
        navy: [
          // Inactive state: white background with gray text
          "bg-white text-slate-600 border-slate-200 hover:border-slate-300",
          // Active state: solid dark navy background with white text
          "data-[active=true]:bg-slate-900 data-[active=true]:text-white data-[active=true]:border-slate-900",
        ],
      },
      size: {
        sm: "px-3 py-1.5 text-xs",
        md: "px-4 py-2 text-sm",
        lg: "px-4 h-[34px] text-[13px]",
      },
    },
    defaultVariants: {
      variant: "orange",
      size: "md",
    },
  }
);

export interface ChipProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof chipVariants> {
  label: string;
  isActive?: boolean;
  valueLabel?: string;
  showCheckIcon?: boolean;
  checkIconPosition?: 'left' | 'right';
  hasDropdown?: boolean;
}

export const Chip = React.forwardRef<HTMLButtonElement, ChipProps>(
  (
    {
      label,
      isActive = false,
      valueLabel,
      showCheckIcon = true,
      checkIconPosition = 'left',
      hasDropdown = false,
      variant = "orange",
      size = "md",
      className,
      ...props
    },
    ref
  ) => {
    const shouldShowCheckIcon = isActive && showCheckIcon && variant === "orange";
    const showCheckLeft = shouldShowCheckIcon && checkIconPosition === 'left';
    const showCheckRight = shouldShowCheckIcon && checkIconPosition === 'right';

    return (
      <button
        ref={ref}
        type="button"
        data-active={isActive}
        className={cn(chipVariants({ variant, size }), className)}
        {...props}
      >
        {showCheckLeft && (
          <Check className="w-3.5 h-3.5 flex-shrink-0" />
        )}
        <span>
          {label}
          {isActive && valueLabel && `: ${valueLabel}`}
        </span>
        {showCheckRight && (
          <Check className="w-3.5 h-3.5 flex-shrink-0" />
        )}
        {hasDropdown && (
          <ChevronDown
            className={cn(
              "w-3.5 h-3.5 flex-shrink-0",
              isActive && variant === "orange" ? "text-orange-700" : "text-gray-500"
            )}
          />
        )}
      </button>
    );
  }
);

Chip.displayName = "Chip";
