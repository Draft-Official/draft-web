'use client';

import { Chip } from '@/shared/ui/base/chip';
import { cn } from '@/shared/lib/utils';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/shared/ui/shadcn/dropdown-menu';

interface PriceFilterProps {
  selectedPriceMax: number | null;
  onPriceMaxChange: (price: number | null) => void;
}

const PRICE_OPTIONS = [
  { value: null, label: '전체' },
  { value: 0, label: '무료' },
  { value: 10000, label: '만원 이하' },
  { value: 15000, label: '1.5만원 이하' },
  { value: 20000, label: '2만원 이하' },
] as const;

export function PriceFilter({ selectedPriceMax, onPriceMaxChange }: PriceFilterProps) {
  const getPriceLabel = () => {
    if (selectedPriceMax === null) return '참가비';
    if (selectedPriceMax === 0) return '무료만';
    return `${(selectedPriceMax / 10000).toFixed(selectedPriceMax % 10000 === 0 ? 0 : 1)}만원 이하`;
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <div>
          <Chip
            label={getPriceLabel()}
            variant="orange"
            isActive={selectedPriceMax !== null}
            hasDropdown={true}
            showCheckIcon={false}
            className="shrink-0"
          />
        </div>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="min-w-[120px]">
        {PRICE_OPTIONS.map((option) => (
          <DropdownMenuItem
            key={option.value ?? 'all'}
            onClick={() => onPriceMaxChange(option.value)}
            className={cn(selectedPriceMax === option.value && 'bg-brand-weak text-primary')}
          >
            {option.label}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
