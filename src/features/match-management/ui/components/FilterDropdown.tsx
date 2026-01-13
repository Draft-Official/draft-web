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
            'h-9 px-3 text-sm font-normal border-slate-200',
            isActive && 'bg-slate-100 text-slate-700'
          )}
        >
          {displayLabel}
          <ChevronDown className="ml-1.5 h-4 w-4 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-fit min-w-[120px] p-1 bg-white" align="start">
        {options.map((option) => (
          <button
            key={option.value}
            onClick={() => onChange(option.value)}
            className={cn(
              'w-full text-left px-3 py-2 text-sm rounded-md hover:bg-slate-100 transition-colors flex items-center justify-between',
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
