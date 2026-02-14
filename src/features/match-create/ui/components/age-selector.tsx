'use client';

import { useState, useEffect, useRef } from 'react';
import { Chip } from '@/shared/ui/base/chip';
import { AGE_OPTIONS, AgeValue } from '@/shared/config/match-constants';

interface AgeSelectorProps {
  selectedAges: string[];
  onSelect: (age: string) => void;
  onRangeUpdate: (ages: string[]) => void;
}

// 나이 값 매핑 (50+는 50으로 처리)
const AGE_VALUE_MAP: Record<string, number> = {
  '20': 20,
  '30': 30,
  '40': 40,
  '50+': 50,
};

export function AgeSelector({
  selectedAges,
  onSelect,
  onRangeUpdate
}: AgeSelectorProps) {
  // -- Drag to Select Logic --
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

    // If we are on the same chip as start, do nothing
    if (dragStartAge === age && !hasDraggedRef.current) return;

    hasDraggedRef.current = true;

    const min = Math.min(startVal, currentVal);
    const max = Math.max(startVal, currentVal);

    const newRange: string[] = [];
    AGE_OPTIONS.forEach(opt => {
         const val = AGE_VALUE_MAP[opt.value];
         if (val >= min && val <= max) {
            newRange.push(opt.value);
         }
    });

    onRangeUpdate(newRange);
  };

  return (
    <div className="flex flex-wrap items-center gap-2">
        <Chip
            label="무관"
            variant="navy"
            isActive={selectedAges.includes('any')}
            showCheckIcon={false}
            onClick={() => onSelect('any')}
            className="flex-shrink-0"
        />

        <div className="h-4 w-px bg-slate-200 mx-1"></div>

        <div className="flex flex-wrap gap-2">
            {AGE_OPTIONS.map((a) => (
                <Chip
                    key={a.value}
                    label={a.label}
                    variant="navy"
                    isActive={selectedAges.includes(a.value)}
                    showCheckIcon={false}
                    onClick={() => {
                        if (!hasDraggedRef.current) onSelect(a.value);
                    }}
                    onPointerDown={() => onDragStart(a.value)}
                    onPointerEnter={() => onDragEnter(a.value)}
                    className="touch-pan-y select-none"
                />
            ))}
        </div>
    </div>
  );
}
