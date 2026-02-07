'use client';

import { cn } from '@/shared/lib/utils';

interface StepProgressBarProps {
  currentStep: number;
  totalSteps: number;
}

export function StepProgressBar({ currentStep, totalSteps }: StepProgressBarProps) {
  return (
    <div className="flex gap-1.5 w-full">
      {Array.from({ length: totalSteps }).map((_, index) => (
        <div
          key={index}
          className={cn(
            'h-1 flex-1 rounded-full transition-colors duration-300',
            index < currentStep ? 'bg-[#FF6600]' : 'bg-slate-200'
          )}
        />
      ))}
    </div>
  );
}
