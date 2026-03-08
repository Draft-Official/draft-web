'use client';

import * as React from 'react';
import { ChevronsUpDown } from 'lucide-react';

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

  const renderBankItem = (bank: (typeof BANKS)[number]) => (
    <CommandItem
      key={bank.value}
      value={bank.value}
      data-checked={value === bank.value}
      className="h-auto items-center gap-1.5 whitespace-normal break-keep px-1.5 py-1"
      onSelect={(currentValue) => {
        onValueChange(currentValue === value ? '' : currentValue);
        setOpen(false);
      }}
    >
      <BankLogo bankName={bank.label} />
      <span className="leading-4">{bank.label}</span>
    </CommandItem>
  );

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
      <PopoverContent className="w-[min(92vw,380px)] p-0" align="start">
        <Command>
          <CommandInput placeholder="은행 검색..." />
          <CommandList>
            <CommandEmpty>검색 결과가 없습니다.</CommandEmpty>
            <CommandGroup heading="자주 사용" className="overflow-visible py-0.5 [&_[cmdk-group-heading]]:py-0.5">
              <div className="grid grid-cols-2 gap-x-1 gap-y-0.5">
                {POPULAR_BANKS.map((bank) => renderBankItem(bank))}
              </div>
            </CommandGroup>
            <CommandGroup heading="기타 은행" className="overflow-visible py-0.5 [&_[cmdk-group-heading]]:py-0.5">
              <div className="grid grid-cols-2 gap-x-1 gap-y-0.5">
                {OTHER_BANKS.map((bank) => renderBankItem(bank))}
              </div>
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
