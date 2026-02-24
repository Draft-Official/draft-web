'use client';

import { useEffect, useMemo, useRef } from 'react';
import { AGE_OPTIONS } from '@/shared/config/match-constants';
import { Slider } from '@/shared/ui/shadcn/slider';
import { Toggle } from '@/shared/ui/shadcn/toggle';

interface AgeSelectorProps {
  selectedAges: string[];
  onRangeUpdate: (ages: string[]) => void;
}

const AGE_VALUES: readonly string[] = AGE_OPTIONS.map((option) => option.value);
const LAST_AGE_INDEX = AGE_VALUES.length - 1;

function normalizeRange(selectedAges: string[]): [number, number] {
  const filtered = selectedAges.filter((age) => age !== 'any');
  if (filtered.length === 0) return [0, LAST_AGE_INDEX];

  const indices = filtered
    .map((age) => AGE_VALUES.indexOf(age))
    .filter((index): index is number => index >= 0)
    .sort((a, b) => a - b);

  if (indices.length === 0) return [0, LAST_AGE_INDEX];
  return [indices[0], indices[indices.length - 1]];
}

function rangeToAges(minIndex: number, maxIndex: number): string[] {
  return AGE_VALUES.slice(minIndex, maxIndex + 1);
}

function getRangeLabel(minIndex: number, maxIndex: number): string {
  const minLabel = AGE_OPTIONS[minIndex]?.label ?? '';
  const maxOption = AGE_OPTIONS[maxIndex];

  if (!maxOption) return '';
  if (minIndex === maxIndex) return minLabel;
  if (maxOption.value === '50+') return `${minLabel} 이상`;
  return `${minLabel} ~ ${maxOption.label}`;
}

export function AgeSelector({
  selectedAges,
  onRangeUpdate
}: AgeSelectorProps) {
  const isAny = selectedAges.length === 0 || selectedAges.includes('any');
  const [minIndex, maxIndex] = useMemo(() => normalizeRange(selectedAges), [selectedAges]);
  const lastRangeRef = useRef<[number, number]>([0, LAST_AGE_INDEX]);

  useEffect(() => {
    if (!isAny) {
      lastRangeRef.current = [minIndex, maxIndex];
    }
  }, [isAny, minIndex, maxIndex]);

  const handleAnyToggle = (next: boolean) => {
    if (next) {
      onRangeUpdate(['any']);
      return;
    }

    const [lastMin, lastMax] = lastRangeRef.current;
    onRangeUpdate(rangeToAges(lastMin, lastMax));
  };

  const handleRangeChange = (value: number[]) => {
    if (value.length < 2) return;
    const [nextMin, nextMax] = value;
    onRangeUpdate(rangeToAges(nextMin, nextMax));
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-3">
        <Toggle
          variant="outline"
          pressed={isAny}
          onPressedChange={handleAnyToggle}
          className="h-9 rounded-lg px-4 text-sm font-medium shrink-0"
        >
          무관
        </Toggle>
        <span className="text-xs font-medium text-slate-500">
          {isAny ? '나이 제한 없음' : getRangeLabel(minIndex, maxIndex)}
        </span>
      </div>

      {!isAny && (
        <div className="rounded-xl border border-slate-200 bg-slate-50/60 px-4 py-4">
          <Slider
            min={0}
            max={LAST_AGE_INDEX}
            step={1}
            minStepsBetweenThumbs={0}
            value={[minIndex, maxIndex]}
            onValueChange={handleRangeChange}
          />

          <div className="mt-3 flex items-center justify-between text-xs text-slate-500">
            {AGE_OPTIONS.map((option) => (
              <span key={option.value}>{option.label}</span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
