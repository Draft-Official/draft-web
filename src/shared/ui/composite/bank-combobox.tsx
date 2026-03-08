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
import { BankLogo } from '@/shared/ui/composite/bank-logo';

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
          className={cn('justify-between font-normal', !value && 'text-muted-foreground', className)}
        >
          <span className="flex min-w-0 items-center gap-2">
            {selectedBank && <BankLogo bankName={selectedBank.label} />}
            <span className="truncate">{selectedBank ? selectedBank.label : placeholder}</span>
          </span>
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[240px] p-0" align="start">
        <Command>
          <CommandInput placeholder="은행 검색..." />
          <CommandList>
            <CommandEmpty>검색 결과가 없습니다.</CommandEmpty>
            <CommandGroup heading="자주 사용">
              {POPULAR_BANKS.map((bank) => (
                <CommandItem
                  key={bank.value}
                  value={bank.value}
                  className="gap-2"
                  onSelect={(currentValue) => {
                    onValueChange(currentValue === value ? '' : currentValue);
                    setOpen(false);
                  }}
                >
                  <Check className={cn('h-4 w-4', value === bank.value ? 'opacity-100' : 'opacity-0')} />
                  <BankLogo bankName={bank.label} />
                  <span>{bank.label}</span>
                </CommandItem>
              ))}
            </CommandGroup>
            <CommandGroup heading="기타 은행">
              {OTHER_BANKS.map((bank) => (
                <CommandItem
                  key={bank.value}
                  value={bank.value}
                  className="gap-2"
                  onSelect={(currentValue) => {
                    onValueChange(currentValue === value ? '' : currentValue);
                    setOpen(false);
                  }}
                >
                  <Check className={cn('h-4 w-4', value === bank.value ? 'opacity-100' : 'opacity-0')} />
                  <BankLogo bankName={bank.label} />
                  <span>{bank.label}</span>
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
