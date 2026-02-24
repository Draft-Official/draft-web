'use client';

import { useRef, useCallback, useEffect, useState } from 'react';
import { cn } from '@/shared/lib/utils';
import { SKILL_LEVELS } from '@/shared/config/skill-constants';

interface SkillRangeSliderProps {
  minValue: number;
  maxValue: number;
  onChange: (min: number, max: number) => void;
}

const TOTAL_LEVELS = SKILL_LEVELS.length; // 7

export function SkillRangeSlider({ minValue, maxValue, onChange }: SkillRangeSliderProps) {
  const trackRef = useRef<HTMLDivElement>(null);
  const draggingRef = useRef<'min' | 'max' | null>(null);
  const [isDragging, setIsDragging] = useState(false);

  const minSkill = SKILL_LEVELS.find(s => s.level === minValue) || SKILL_LEVELS[0];
  const maxSkill = SKILL_LEVELS.find(s => s.level === maxValue) || SKILL_LEVELS[SKILL_LEVELS.length - 1];

  const beginnerColor = 'var(--color-palette-green-500)';
  const intermediateColor = 'var(--color-palette-yellow-600)';
  const advancedColor = 'var(--color-palette-draft-600)';
  const eliteColor = 'var(--color-palette-red-600)';

  // Convert pixel position to level (1-7)
  const positionToLevel = useCallback((clientX: number): number => {
    const track = trackRef.current;
    if (!track) return 1;
    const rect = track.getBoundingClientRect();
    const ratio = (clientX - rect.left) / rect.width;
    const clamped = Math.max(0, Math.min(1, ratio));
    // Map 0-1 to 1-7
    const level = Math.round(clamped * (TOTAL_LEVELS - 1)) + 1;
    return Math.max(1, Math.min(TOTAL_LEVELS, level));
  }, []);


  const handlePointerDown = useCallback((e: React.PointerEvent, thumb: 'min' | 'max') => {
    e.preventDefault();
    e.stopPropagation();
    draggingRef.current = thumb;
    setIsDragging(true);
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
  }, []);

  const handlePointerMove = useCallback((e: React.PointerEvent) => {
    if (!draggingRef.current) return;
    e.preventDefault();
    const level = positionToLevel(e.clientX);

    if (draggingRef.current === 'min') {
      if (level <= maxValue) {
        onChange(level, maxValue);
      } else {
        // Cross over: swap to dragging max
        draggingRef.current = 'max';
        onChange(maxValue, level);
      }
    } else {
      if (level >= minValue) {
        onChange(minValue, level);
      } else {
        // Cross over: swap to dragging min
        draggingRef.current = 'min';
        onChange(level, minValue);
      }
    }
  }, [minValue, maxValue, onChange, positionToLevel]);

  const handlePointerUp = useCallback(() => {
    draggingRef.current = null;
    setIsDragging(false);
  }, []);

  // Track click to move nearest thumb
  const handleTrackClick = useCallback((e: React.MouseEvent) => {
    if (isDragging) return;
    const level = positionToLevel(e.clientX);
    const distToMin = Math.abs(level - minValue);
    const distToMax = Math.abs(level - maxValue);

    if (distToMin <= distToMax) {
      onChange(Math.min(level, maxValue), maxValue);
    } else {
      onChange(minValue, Math.max(level, minValue));
    }
  }, [minValue, maxValue, onChange, positionToLevel, isDragging]);

  // Prevent scrolling while dragging on touch devices
  useEffect(() => {
    if (!isDragging) return;
    const prevent = (e: TouchEvent) => e.preventDefault();
    document.addEventListener('touchmove', prevent, { passive: false });
    return () => document.removeEventListener('touchmove', prevent);
  }, [isDragging]);

  const isInRange = (level: number) => level >= minValue && level <= maxValue;

  const getRangeDisplayText = () => {
    if (minValue === maxValue) return minSkill.name;
    return `${minSkill.name} ~ ${maxSkill.name}`;
  };


  return (
    <div className="space-y-4">
      {/* Range Display */}
      <div className="flex justify-center">
        <span className="text-sm font-medium text-foreground">{getRangeDisplayText()}</span>
      </div>

      {/* Slider Track */}
      <div className="relative pt-2 pb-2">
        {/* Background segments */}
        <div
          ref={trackRef}
          className="relative h-10 flex gap-1 cursor-pointer touch-none"
          onClick={handleTrackClick}
          onPointerDown={(e) => {
            // Determine nearest thumb from click position
            const level = positionToLevel(e.clientX);
            const distToMin = Math.abs(level - minValue);
            const distToMax = Math.abs(level - maxValue);
            const thumb = distToMin <= distToMax ? 'min' : 'max';
            handlePointerDown(e, thumb);
          }}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          onPointerCancel={handlePointerUp}
        >
          {SKILL_LEVELS.map((skill) => (
            <div
              key={skill.level}
              className={cn(
                "flex-1 rounded-lg transition-all pointer-events-none relative",
                isInRange(skill.level) ? "" : "bg-muted"
              )}
              style={{
                backgroundColor: isInRange(skill.level) ? skill.color : undefined,
                opacity: isInRange(skill.level) ? 1 : 0.5,
              }}
            >
              {/* Min dot - left center of segment */}
              {skill.level === minValue && (
                <div className="absolute -bottom-1 left-0 h-2 w-2 -translate-x-1/2 rounded-full border-2 border-foreground bg-background" />
              )}
              {/* Max dot - right center of segment */}
              {skill.level === maxValue && minValue !== maxValue && (
                <div className="absolute -bottom-1 right-0 h-2 w-2 translate-x-1/2 rounded-full border-2 border-foreground bg-background" />
              )}
            </div>
          ))}
        </div>

        {/* Color Underlines */}
        <div className="flex gap-1 mt-3">
          <div className="flex gap-1" style={{ flex: 2 }}>
            <div className="flex-1 h-(--dimension-x1) rounded-full" style={{ backgroundColor: beginnerColor }} />
            <div className="flex-1 h-(--dimension-x1) rounded-full" style={{ backgroundColor: beginnerColor }} />
          </div>
          <div className="flex gap-1" style={{ flex: 2 }}>
            <div className="flex-1 h-(--dimension-x1) rounded-full" style={{ backgroundColor: intermediateColor }} />
            <div className="flex-1 h-(--dimension-x1) rounded-full" style={{ backgroundColor: intermediateColor }} />
          </div>
          <div className="flex gap-1" style={{ flex: 2 }}>
            <div className="flex-1 h-(--dimension-x1) rounded-full" style={{ backgroundColor: advancedColor }} />
            <div className="flex-1 h-(--dimension-x1) rounded-full" style={{ backgroundColor: advancedColor }} />
          </div>
          <div style={{ flex: 1 }}>
            <div className="h-(--dimension-x1) rounded-full" style={{ backgroundColor: eliteColor }} />
          </div>
        </div>

        {/* Labels */}
        <div className="flex gap-1 mt-2">
          <div className="text-center font-medium text-xs" style={{ flex: 2, color: beginnerColor }}>초보</div>
          <div className="text-center font-medium text-xs" style={{ flex: 2, color: intermediateColor }}>중급</div>
          <div className="text-center font-medium text-xs" style={{ flex: 2, color: advancedColor }}>상급</div>
          <div className="text-center font-medium text-xs" style={{ flex: 1, color: eliteColor }}>선출</div>
        </div>
      </div>

      {/* Description Card */}
      <div className="rounded-lg border border-border bg-muted/40 p-4">
        {minValue === maxValue ? (
          <div className="flex items-start gap-2">
            <div>
              <div className="font-semibold text-foreground">{minSkill.name}</div>
              <div className="mt-1 text-sm text-muted-foreground">{minSkill.description}</div>
            </div>
          </div>
        ) : (
          <div className="space-y-3">
            <div className="flex items-start gap-2">
              <div className="w-8 text-xs font-medium text-muted-foreground">최소</div>
              <div className="flex-1">
                <div className="text-sm font-semibold text-foreground">{minSkill.name}</div>
                <div className="mt-0.5 text-xs text-muted-foreground">{minSkill.description}</div>
              </div>
            </div>
            <div className="border-t border-border" />
            <div className="flex items-start gap-2">
              <div className="w-8 text-xs font-medium text-muted-foreground">최대</div>
              <div className="flex-1">
                <div className="text-sm font-semibold text-foreground">{maxSkill.name}</div>
                <div className="mt-0.5 text-xs text-muted-foreground">{maxSkill.description}</div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
