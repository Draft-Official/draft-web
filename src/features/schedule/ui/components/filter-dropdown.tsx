'use client';

import { Check, ChevronDown } from 'lucide-react';
import { Button } from '@/shared/ui/base/button';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/shared/ui/base/popover';
import { cn } from '@/shared/lib/utils';
import type { FilterOption } from '../../model/types';

// Single select props
interface SingleSelectProps<T extends string> {
  options: FilterOption<T>[];
  value: T;
  onChange: (value: T) => void;
  getDisplayLabel?: (value: T) => string;
  multiSelect?: false;
}

// Multi select props
interface MultiSelectProps<T extends string> {
  options: FilterOption<T>[];
  value: T[];
  onChange: (value: T[]) => void;
  getDisplayLabel?: (value: T[]) => string;
  multiSelect: true;
}

type FilterDropdownProps<T extends string> = SingleSelectProps<T> | MultiSelectProps<T>;

export function FilterDropdown<T extends string>(props: FilterDropdownProps<T>) {
  const { options, multiSelect } = props;

  if (multiSelect) {
    // Multi-select mode
    const { value, onChange, getDisplayLabel } = props as MultiSelectProps<T>;

    const displayLabel = getDisplayLabel
      ? getDisplayLabel(value)
      : value.length === 0
        ? options[0]?.label || ''
        : value.length === 1
          ? options.find((opt) => opt.value === value[0])?.label || ''
          : `${options.find((opt) => opt.value === value[0])?.label} 외 ${value.length - 1}`;

    const isActive = value.length > 0;

    const handleToggle = (optionValue: T) => {
      if (value.includes(optionValue)) {
        onChange(value.filter((v) => v !== optionValue));
      } else {
        onChange([...value, optionValue]);
      }
    };

    return (
      <Popover>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            className={cn(
              'rounded-full h-8 px-3 text-xs font-bold border transition-all flex items-center gap-1',
              isActive
                ? 'border-primary text-primary bg-brand-weak'
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
              onClick={() => handleToggle(option.value)}
              className={cn(
                'w-full text-left px-3 py-2 text-sm rounded-xl hover:bg-slate-100 transition-colors flex items-center justify-between',
                value.includes(option.value) && 'bg-slate-100'
              )}
            >
              {option.label}
              {value.includes(option.value) && (
                <Check className="h-4 w-4 text-slate-700" />
              )}
            </button>
          ))}
        </PopoverContent>
      </Popover>
    );
  }

  // Single-select mode (default)
  const { value, onChange, getDisplayLabel } = props as SingleSelectProps<T>;

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
              ? 'border-primary text-primary bg-brand-weak'
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
              'w-full text-left px-3 py-2 text-sm rounded-xl hover:bg-slate-100 transition-colors flex items-center justify-between',
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
