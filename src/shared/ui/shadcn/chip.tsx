'use client';

import React from 'react';
import { cn } from '@/shared/lib/utils';
import { Check, ChevronDown } from 'lucide-react';
import { cva, type VariantProps } from 'class-variance-authority';

const chipVariants = cva(
  'inline-flex items-center gap-1.5 rounded-full border font-medium transition-all cursor-pointer whitespace-nowrap active:scale-95',
  {
    variants: {
      variant: {
        orange: [
          'bg-white text-slate-600 border-slate-300 hover:border-slate-400',
          'data-[active=true]:bg-brand-weak data-[active=true]:text-brand-contrast data-[active=true]:border-brand-stroke-weak',
        ],
        slate: [
          'bg-white text-slate-500 border-slate-200',
          'data-[active=true]:bg-slate-200 data-[active=true]:text-slate-900 data-[active=true]:border-slate-900 data-[active=true]:font-bold',
        ],
        navy: [
          'bg-white text-slate-600 border-slate-200 hover:border-slate-300',
          'data-[active=true]:bg-slate-900 data-[active=true]:text-white data-[active=true]:border-slate-900',
        ],
      },
      size: {
        sm: 'px-3 py-1.5 text-xs',
        md: 'px-4 py-2 text-sm',
        lg: 'px-4 h-[34px] text-[13px]',
      },
    },
    defaultVariants: {
      variant: 'orange',
      size: 'md',
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
      variant = 'orange',
      size = 'md',
      className,
      ...props
    },
    ref
  ) => {
    const shouldShowCheckIcon = isActive && showCheckIcon && variant === 'orange';
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
        {showCheckLeft && <Check className="w-3.5 h-3.5 flex-shrink-0" />}
        <span>
          {label}
          {isActive && valueLabel && `: ${valueLabel}`}
        </span>
        {showCheckRight && <Check className="w-3.5 h-3.5 flex-shrink-0" />}
        {hasDropdown && (
          <ChevronDown
            className={cn(
              'w-3.5 h-3.5 flex-shrink-0',
              isActive && variant === 'orange' ? 'text-brand-contrast' : 'text-gray-500'
            )}
          />
        )}
      </button>
    );
  }
);

Chip.displayName = 'Chip';
