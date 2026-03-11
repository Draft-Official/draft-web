'use client';

import { RadioGroup } from '@/shared/ui/shadcn/radio-group';
import { cn } from '@/shared/lib/utils';
import {
  TEAM_VOTE_OPTIONS,
  type TeamVoteStatusValue,
} from '@/shared/config/team-constants';

interface TeamVoteRadioGroupProps {
  value?: TeamVoteStatusValue;
  onValueChange: (value: TeamVoteStatusValue) => void;
  className?: string;
}

export function TeamVoteRadioGroup({
  value,
  onValueChange,
  className,
}: TeamVoteRadioGroupProps) {
  return (
    <RadioGroup
      value={value}
      onValueChange={(next) => onValueChange(next as TeamVoteStatusValue)}
      className={cn('space-y-1', className)}
    >
      {TEAM_VOTE_OPTIONS.map((option) => {
        const isSelected = value === option.value;

        return (
          <div
            key={option.value}
            role="radio"
            aria-checked={isSelected}
            tabIndex={0}
            onClick={() => onValueChange(option.value)}
            onKeyDown={(event) => {
              if (event.key === 'Enter' || event.key === ' ') {
                event.preventDefault();
                onValueChange(option.value);
              }
            }}
            className={cn(
              'flex items-center justify-between p-3 rounded-xl border cursor-pointer transition-all',
              isSelected
                ? 'border-slate-900 bg-white'
                : 'border-slate-200 hover:border-slate-300'
            )}
          >
            <div>
              <p className="font-semibold text-slate-900">{option.label}</p>
            </div>
            <div
              className={cn(
                'w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0',
                isSelected
                  ? 'border-slate-900 bg-slate-900'
                  : 'border-slate-300'
              )}
            >
              {isSelected && <div className="w-2 h-2 rounded-full bg-white" />}
            </div>
          </div>
        );
      })}
    </RadioGroup>
  );
}
