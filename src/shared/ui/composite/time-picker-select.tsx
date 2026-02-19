'use client';

import { useState } from 'react';
import { Clock, ChevronLeft } from 'lucide-react';
import { Popover, PopoverContent, PopoverTrigger } from '@/shared/ui/shadcn/popover';
import { cn } from '@/shared/lib/utils';

interface TimeOption {
  value: string;
  label: string;
}

interface TimePickerSelectProps {
  value?: string;
  onValueChange?: (value: string) => void;
  defaultValue?: string;
}

// Generate time options for 24-hour format in 30min intervals
// AM: 00:00 ~ 11:30, PM: 12:00 ~ 23:30
const generateTimeOptions = (isPM: boolean): TimeOption[] => {
  const options: TimeOption[] = [];
  const startHour = isPM ? 12 : 0;
  const endHour = isPM ? 24 : 12;

  for (let hour = startHour; hour < endHour; hour++) {
    for (let minute = 0; minute < 60; minute += 30) {
      const timeValue = `${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}`;
      const label = timeValue; // Display in 24-hour format

      options.push({ value: timeValue, label });
    }
  }

  return options;
};

// Format time value to display format (24-hour)
const formatTimeDisplay = (timeValue: string): string => {
  if (!timeValue || !timeValue.includes(':')) return '시간 선택';
  return timeValue; // Display as-is in 24-hour format
};

export function TimePickerSelect({
  value,
  onValueChange,
  defaultValue = '19:00'
}: TimePickerSelectProps) {
  const [selectedPeriod, setSelectedPeriod] = useState<'AM' | 'PM' | null>(null);
  const [isOpen, setIsOpen] = useState(false);

  const handlePeriodSelect = (period: 'AM' | 'PM') => {
    setSelectedPeriod(period);
  };

  const handleTimeSelect = (timeValue: string) => {
    onValueChange?.(timeValue);
    setSelectedPeriod(null);
    setIsOpen(false);
  };

  const handleBack = () => {
    setSelectedPeriod(null);
  };

  const handleOpenChange = (open: boolean) => {
    setIsOpen(open);
    if (!open) {
      setSelectedPeriod(null);
    }
  };

  const displayValue = value ? formatTimeDisplay(value) : formatTimeDisplay(defaultValue);

  return (
    <Popover open={isOpen} onOpenChange={handleOpenChange}>
      <PopoverTrigger asChild>
        <button
          type="button"
          className="flex h-12 w-full items-center justify-between rounded-md border border-slate-200 bg-white px-3 py-2 text-sm font-bold hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-slate-400 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
        >
          <div className="flex items-center gap-2">
            <Clock className="h-5 w-5 text-slate-400 flex-shrink-0" />
            <span>{displayValue}</span>
          </div>
          <svg
            className="h-4 w-4 text-slate-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </button>
      </PopoverTrigger>
      <PopoverContent className="w-[280px] p-0 bg-white border border-slate-200 shadow-lg z-[100]" align="start">
        {selectedPeriod === null ? (
          // Step 1: Select AM/PM
          <div className="p-2">
            <div className="px-2 py-2 text-sm font-semibold text-slate-700">시간대 선택</div>
            <div className="space-y-1">
              <button
                type="button"
                onClick={() => handlePeriodSelect('AM')}
                className="w-full rounded-md px-3 py-2.5 text-left text-sm hover:bg-slate-100 transition-colors"
              >
                <div className="font-semibold text-slate-900">오전</div>
                <div className="text-xs text-slate-600">00:00 ~ 11:30</div>
              </button>
              <button
                type="button"
                onClick={() => handlePeriodSelect('PM')}
                className="w-full rounded-md px-3 py-2.5 text-left text-sm hover:bg-slate-100 transition-colors"
              >
                <div className="font-semibold text-slate-900">오후</div>
                <div className="text-xs text-slate-600">12:00 ~ 23:30</div>
              </button>
            </div>
          </div>
        ) : (
          // Step 2: Select specific time
          <div className="flex flex-col max-h-[320px]">
            <div className="flex items-center justify-between border-b border-slate-200 px-3 py-2.5 sticky top-0 bg-white">
              <button
                onClick={handleBack}
                className="flex items-center gap-1 text-sm text-slate-600 hover:text-slate-900 font-medium"
                type="button"
              >
                <ChevronLeft className="h-4 w-4" />
                뒤로
              </button>
              <span className="text-sm font-semibold text-slate-900">
                {selectedPeriod === 'AM' ? '오전' : '오후'}
              </span>
            </div>
            <div className="overflow-y-auto p-2">
              <div className="grid grid-cols-2 gap-1">
                {generateTimeOptions(selectedPeriod === 'PM').map((opt) => {
                  const isSelected = value === opt.value;
                  return (
                    <button
                      key={opt.value}
                      type="button"
                      onClick={() => handleTimeSelect(opt.value)}
                      className={cn(
                        "rounded-md px-3 py-2 text-sm font-medium transition-colors",
                        isSelected
                          ? "bg-slate-900 text-white"
                          : "hover:bg-slate-100 text-slate-900"
                      )}
                    >
                      {opt.label}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        )}
      </PopoverContent>
    </Popover>
  );
}
