'use client';

import { useState, useEffect, useRef } from 'react';
import { Toggle } from '@/shared/ui/shadcn/toggle';
import { AGE_OPTIONS } from '@/shared/config/match-constants';

interface AgeRangeSelectorProps {
  selectedAges: string[];
  onSelect: (age: string) => void;
  onRangeUpdate: (ages: string[]) => void;
}

const AGE_VALUE_MAP: Record<string, number> = {
  '20': 20,
  '30': 30,
  '40': 40,
  '50+': 50,
};

export function AgeRangeSelector({ selectedAges, onSelect, onRangeUpdate }: AgeRangeSelectorProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [dragStartAge, setDragStartAge] = useState<string | null>(null);
  const hasDraggedRef = useRef(false);

  useEffect(() => {
    const handleGlobalUp = () => {
      setIsDragging(false);
      setDragStartAge(null);
    };
    window.addEventListener('pointerup', handleGlobalUp);
    return () => window.removeEventListener('pointerup', handleGlobalUp);
  }, []);

  const onDragStart = (age: string) => {
    setIsDragging(true);
    setDragStartAge(age);
    hasDraggedRef.current = false;
  };

  const onDragEnter = (age: string) => {
    if (!isDragging || !dragStartAge) return;

    const startVal = AGE_VALUE_MAP[dragStartAge];
    const currentVal = AGE_VALUE_MAP[age];

    if (!startVal || !currentVal) return;
    if (dragStartAge === age && !hasDraggedRef.current) return;

    hasDraggedRef.current = true;

    const min = Math.min(startVal, currentVal);
    const max = Math.max(startVal, currentVal);

    const newRange: string[] = [];
    AGE_OPTIONS.forEach((opt) => {
      const val = AGE_VALUE_MAP[opt.value];
      if (val >= min && val <= max) {
        newRange.push(opt.value);
      }
    });

    onRangeUpdate(newRange);
  };

  return (
    <div className="flex flex-wrap items-center gap-2">
      <Toggle
        variant="outline"
        pressed={selectedAges.includes('any')}
        onPressedChange={() => onSelect('any')}
        className="h-9 rounded-lg px-4 text-sm font-medium shrink-0"
      >
        무관
      </Toggle>

      <div className="mx-1 h-4 w-px bg-border" />

      <div className="flex flex-wrap gap-2">
        {AGE_OPTIONS.map((age) => (
          <Toggle
            key={age.value}
            variant="outline"
            pressed={selectedAges.includes(age.value)}
            onPressedChange={() => {
              if (!hasDraggedRef.current) onSelect(age.value);
            }}
            onPointerDown={() => onDragStart(age.value)}
            onPointerEnter={() => onDragEnter(age.value)}
            className="h-9 rounded-lg px-4 text-sm font-medium touch-pan-y select-none"
          >
            {age.label}
          </Toggle>
        ))}
      </div>
    </div>
  );
}
