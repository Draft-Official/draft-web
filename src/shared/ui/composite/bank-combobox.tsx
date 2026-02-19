'use client';

import * as React from 'react';
import { Check, ChevronsUpDown } from 'lucide-react';

import { BANKS, OTHER_BANKS, POPULAR_BANKS } from '@/shared/config/bank-constants';
import { cn } from '@/shared/lib/utils';
import { Button } from '@/shared/ui/shadcn/button';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/shared/ui/shadcn/command';
import { Popover, PopoverContent, PopoverTrigger } from '@/shared/ui/shadcn/popover';

interface BankComboboxProps {
  value: string;
  onValueChange: (value: string) => void;
  placeholder?: string;
  className?: string;
}

export function BankCombobox({
  value,
  onValueChange,
  placeholder = '은행 선택',
  className,
}: BankComboboxProps) {
  const [open, setOpen] = React.useState(false);

  const selectedBank = BANKS.find((bank) => bank.value === value);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className={cn('justify-between font-normal', !value && 'text-slate-500', className)}
        >
          {selectedBank ? selectedBank.label : placeholder}
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[200px] p-0" align="start">
        <Command>
          <CommandInput placeholder="은행 검색..." />
          <CommandList>
            <CommandEmpty>검색 결과가 없습니다.</CommandEmpty>
            <CommandGroup heading="자주 사용">
              {POPULAR_BANKS.map((bank) => (
                <CommandItem
                  key={bank.value}
                  value={bank.value}
                  onSelect={(currentValue) => {
                    onValueChange(currentValue === value ? '' : currentValue);
                    setOpen(false);
                  }}
                >
                  <Check className={cn('mr-2 h-4 w-4', value === bank.value ? 'opacity-100' : 'opacity-0')} />
                  {bank.label}
                </CommandItem>
              ))}
            </CommandGroup>
            <CommandGroup heading="기타 은행">
              {OTHER_BANKS.map((bank) => (
                <CommandItem
                  key={bank.value}
                  value={bank.value}
                  onSelect={(currentValue) => {
                    onValueChange(currentValue === value ? '' : currentValue);
                    setOpen(false);
                  }}
                >
                  <Check className={cn('mr-2 h-4 w-4', value === bank.value ? 'opacity-100' : 'opacity-0')} />
                  {bank.label}
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
