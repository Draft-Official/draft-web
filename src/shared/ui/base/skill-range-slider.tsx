'use client';

import { cn } from '@/shared/lib/utils';
import { SKILL_LEVELS } from '@/shared/config/skill-constants';

interface SkillRangeSliderProps {
  minValue: number;
  maxValue: number;
  onChange: (min: number, max: number) => void;
}

export function SkillRangeSlider({ minValue, maxValue, onChange }: SkillRangeSliderProps) {
  const minSkill = SKILL_LEVELS.find(s => s.level === minValue) || SKILL_LEVELS[0];
  const maxSkill = SKILL_LEVELS.find(s => s.level === maxValue) || SKILL_LEVELS[SKILL_LEVELS.length - 1];

  const handleClick = (level: number) => {
    // If clicking outside current range, expand to include it
    if (level < minValue) {
      onChange(level, maxValue);
    } else if (level > maxValue) {
      onChange(minValue, level);
    } else if (level === minValue && level === maxValue) {
      // Single point selected, do nothing or allow reset
      return;
    } else if (level === minValue) {
      // Clicking min boundary - shrink from left
      onChange(level + 1 <= maxValue ? level + 1 : level, maxValue);
    } else if (level === maxValue) {
      // Clicking max boundary - shrink from right
      onChange(minValue, level - 1 >= minValue ? level - 1 : level);
    } else {
      // Clicking inside range - set as new min or max based on proximity
      const distToMin = level - minValue;
      const distToMax = maxValue - level;
      if (distToMin <= distToMax) {
        onChange(level, maxValue);
      } else {
        onChange(minValue, level);
      }
    }
  };

  const isInRange = (level: number) => level >= minValue && level <= maxValue;

  const getRangeDisplayText = () => {
    if (minValue === maxValue) {
      return minSkill.name;
    }
    return `${minSkill.name} ~ ${maxSkill.name}`;
  };

  return (
    <div className="space-y-4">
      {/* Range Display */}
      <div className="flex justify-center">
        <span className="text-sm font-medium text-slate-900">{getRangeDisplayText()}</span>
      </div>

      {/* Slider Track */}
      <div className="relative">
        <div className="flex gap-1">
          {SKILL_LEVELS.map((skill) => (
            <button
              key={skill.level}
              type="button"
              onClick={() => handleClick(skill.level)}
              className={cn(
                "flex-1 h-10 rounded-lg transition-all relative",
                isInRange(skill.level)
                  ? ""
                  : "bg-slate-200"
              )}
              style={{
                backgroundColor: isInRange(skill.level) ? skill.color : undefined,
                opacity: isInRange(skill.level) ? 1 : 0.5,
              }}
              aria-label={`${skill.name} ${isInRange(skill.level) ? '선택됨' : '선택안됨'}`}
            >
              {/* Min/Max indicators */}
              {skill.level === minValue && (
                <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-2 h-2 bg-white rounded-full border-2 border-slate-900" />
              )}
              {skill.level === maxValue && minValue !== maxValue && (
                <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-2 h-2 bg-white rounded-full border-2 border-slate-900" />
              )}
            </button>
          ))}
        </div>

        {/* Color Underlines */}
        <div className="flex gap-1 mt-3">
          {/* 초보 (1-2) */}
          <div className="flex gap-1" style={{ flex: 2 }}>
            <div className="flex-1 h-[3px] rounded-full" style={{ backgroundColor: '#22C55E' }} />
            <div className="flex-1 h-[3px] rounded-full" style={{ backgroundColor: '#22C55E' }} />
          </div>
          {/* 중급 (3-4) */}
          <div className="flex gap-1" style={{ flex: 2 }}>
            <div className="flex-1 h-[3px] rounded-full" style={{ backgroundColor: '#EAB308' }} />
            <div className="flex-1 h-[3px] rounded-full" style={{ backgroundColor: '#EAB308' }} />
          </div>
          {/* 상급 (5-6) */}
          <div className="flex gap-1" style={{ flex: 2 }}>
            <div className="flex-1 h-[3px] rounded-full" style={{ backgroundColor: '#FF6600' }} />
            <div className="flex-1 h-[3px] rounded-full" style={{ backgroundColor: '#FF6600' }} />
          </div>
          {/* 선출 (7) */}
          <div style={{ flex: 1 }}>
            <div className="h-[3px] rounded-full" style={{ backgroundColor: '#EF4444' }} />
          </div>
        </div>

        {/* Labels */}
        <div className="flex gap-1 mt-2">
          <div className="text-center font-medium text-xs" style={{ flex: 2, color: '#22C55E' }}>초보</div>
          <div className="text-center font-medium text-xs" style={{ flex: 2, color: '#EAB308' }}>중급</div>
          <div className="text-center font-medium text-xs" style={{ flex: 2, color: '#FF6600' }}>상급</div>
          <div className="text-center font-medium text-xs" style={{ flex: 1, color: '#EF4444' }}>선출</div>
        </div>
      </div>

      {/* Description Card */}
      <div className="bg-slate-50 rounded-lg p-4 border border-slate-200">
        {minValue === maxValue ? (
          <div className="flex items-start gap-2">
            <div>
              <div className="font-semibold text-slate-900">{minSkill.name}</div>
              <div className="text-sm text-slate-600 mt-1">{minSkill.description}</div>
            </div>
          </div>
        ) : (
          <div className="space-y-3">
            <div className="flex items-start gap-2">
              <div className="text-xs font-medium text-slate-500 w-8">최소</div>
              <div className="flex-1">
                <div className="font-semibold text-slate-900 text-sm">{minSkill.name}</div>
                <div className="text-xs text-slate-600 mt-0.5">{minSkill.description}</div>
              </div>
            </div>
            <div className="border-t border-slate-200" />
            <div className="flex items-start gap-2">
              <div className="text-xs font-medium text-slate-500 w-8">최대</div>
              <div className="flex-1">
                <div className="font-semibold text-slate-900 text-sm">{maxSkill.name}</div>
                <div className="text-xs text-slate-600 mt-0.5">{maxSkill.description}</div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
