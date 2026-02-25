'use client';

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/shared/ui/shadcn/dropdown-menu';
import { Chip } from '@/shared/ui/shadcn/chip';
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
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Chip
            label={displayLabel}
            variant="orange"
            isActive={isActive}
            hasDropdown
            showCheckIcon={false}
            className="shrink-0"
          />
        </DropdownMenuTrigger>
        <DropdownMenuContent className="w-36" align="start">
          {options.map((option) => (
            <DropdownMenuItem
              key={option.value}
              onSelect={(e) => { e.preventDefault(); handleToggle(option.value); }}
              className={cn(value.includes(option.value) && 'bg-brand-weak text-primary')}
            >
              {option.label}
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>
    );
  }

  // Single-select mode
  const { value, onChange, getDisplayLabel } = props as SingleSelectProps<T>;

  const displayLabel = getDisplayLabel
    ? getDisplayLabel(value)
    : options.find((opt) => opt.value === value)?.label || '';

  const isActive = value !== options[0]?.value;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Chip
          label={displayLabel}
          variant="orange"
          isActive={isActive}
          hasDropdown
          showCheckIcon={false}
          className="shrink-0"
        />
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-36" align="start">
        {options.map((option) => (
          <DropdownMenuItem
            key={option.value}
            onSelect={() => onChange(option.value as T)}
            className={cn(option.value === value && 'bg-brand-weak text-primary')}
          >
            {option.label}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
