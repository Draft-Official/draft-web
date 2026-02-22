'use client';

import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger,
} from '@/shared/ui/shadcn/dropdown-menu';
import { Chip } from '@/shared/ui/shadcn/chip';
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
        <DropdownMenuContent
          className="w-36"
          align="start"
        >
          {options.map((option) => (
            <DropdownMenuCheckboxItem
              key={option.value}
              checked={value.includes(option.value)}
              onCheckedChange={() => handleToggle(option.value)}
              onSelect={(event) => event.preventDefault()}
              className="rounded-xl"
            >
              {option.label}
            </DropdownMenuCheckboxItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>
    );
  }

  // Single-select mode (default)
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
      <DropdownMenuContent
        className="w-36"
        align="start"
      >
        <DropdownMenuRadioGroup
          value={value}
          onValueChange={(nextValue) => onChange(nextValue as T)}
        >
          {options.map((option) => (
            <DropdownMenuRadioItem
              key={option.value}
              value={option.value}
              className="rounded-xl"
            >
              {option.label}
            </DropdownMenuRadioItem>
          ))}
        </DropdownMenuRadioGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
