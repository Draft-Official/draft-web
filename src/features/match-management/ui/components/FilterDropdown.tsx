'use client';

import { Check, ChevronDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { cn } from '@/shared/lib/utils';
import type { FilterOption } from '../../model/types';

interface FilterDropdownProps<T extends string> {
  options: FilterOption<T>[];
  value: T;
  onChange: (value: T) => void;
  getDisplayLabel?: (value: T) => string;
}

export function FilterDropdown<T extends string>({
  options,
  value,
  onChange,
  getDisplayLabel,
}: FilterDropdownProps<T>) {
  const displayLabel = getDisplayLabel
    ? getDisplayLabel(value)
    : options.find((opt) => opt.value === value)?.label || '';

  const isActive = value !== options[0]?.value;

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          className={cn(
            'rounded-full h-8 px-3 text-xs font-bold border transition-all flex items-center gap-1',
            isActive
              ? 'border-primary text-primary bg-orange-50'
              : 'border-slate-200 text-slate-600'
          )}
        >
          {displayLabel}
          <ChevronDown className="w-3 h-3" />
        </Button>
      </PopoverTrigger>
      <PopoverContent
        className="w-36 p-1.5 rounded-2xl bg-white border border-slate-200 shadow-lg"
        align="start"
      >
        {options.map((option) => (
          <button
            key={option.value}
            onClick={() => onChange(option.value)}
            className={cn(
              'w-full text-left px-3 py-2 text-sm rounded-full hover:bg-slate-100 transition-colors flex items-center justify-between',
              value === option.value && 'bg-slate-100'
            )}
          >
            {option.label}
            {value === option.value && (
              <Check className="h-4 w-4 text-slate-700" />
            )}
          </button>
        ))}
      </PopoverContent>
    </Popover>
  );
}
