'use client';

import { useState, useEffect, useRef } from 'react';
import { Chip } from '@/shared/ui/base/chip';
import { AGE_OPTIONS } from '@/shared/config/match-constants';

interface AgeSelectorProps {
  selectedAges: string[];
  onSelect: (age: string) => void;
  onRangeUpdate: (ages: string[]) => void;
}

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
    // Removed immediate selection to allow click to handle toggle
  };

  const onDragEnter = (age: string) => {
    if (!isDragging || !dragStartAge) return;
    
    // Only process if we moved validly
    const ageValues: Record<string, number> = { '20': 20, '30': 30, '40': 40, '50': 50, '60': 60, '70': 70 };
    const startVal = ageValues[dragStartAge];
    const currentVal = ageValues[age] || 0; 
    
    if (!startVal || !currentVal) return;
    
    // Optimization: If we are on the same chip as start, do nothing (wait for click or move)
    if (dragStartAge === age && !hasDraggedRef.current) return;

    // We have moved to a different chip (or came back), implies drag intent
    hasDraggedRef.current = true;

    const min = Math.min(startVal, currentVal);
    const max = Math.max(startVal, currentVal);

    const newRange: string[] = [];
    AGE_OPTIONS.forEach(opt => {
         const val = ageValues[opt.value];
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
            variant="orange"
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
                    variant="orange"
                    isActive={selectedAges.includes(a.value)}
                    showCheckIcon={false}
                    // Click (Normal Toggle/Split) - Block if dragged
                    onClick={() => {
                        if (!hasDraggedRef.current) onSelect(a.value);
                    }}
                    // Pointer Events for Drag
                    onPointerDown={(e) => {
                        // Removed preventDefault to allow click
                        onDragStart(a.value);
                    }}
                    onPointerEnter={() => onDragEnter(a.value)}
                    className="touch-pan-y select-none" 
                />
            ))}
        </div>
    </div>
  );
}
