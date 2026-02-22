'use client';

import { cn } from '@/shared/lib/utils';
import { SKILL_LEVELS } from '@/shared/config/skill-constants';

interface SkillSliderProps {
  value: number;
  onChange: (value: number) => void;
}

export function SkillSlider({ value, onChange }: SkillSliderProps) {
  const selectedSkill = SKILL_LEVELS.find(s => s.level === value) || SKILL_LEVELS[0];
  const beginnerColor = 'var(--color-palette-green-500)';
  const intermediateColor = 'var(--color-palette-yellow-600)';
  const advancedColor = 'var(--color-palette-draft-600)';
  const eliteColor = 'var(--color-palette-red-600)';

  return (
    <div className="space-y-4">
      {/* Slider Track */}
      <div className="relative">
        <div className="flex gap-1">
          {SKILL_LEVELS.map((skill) => (
            <button
              key={skill.level}
              type="button"
              onClick={() => onChange(skill.level)}
              className={cn(
                "flex-1 h-10 rounded-lg transition-all",
                skill.level <= value
                  ? ""
                  : "bg-muted"
              )}
              style={{
                backgroundColor: skill.level <= value ? skill.color : undefined
              }}
              aria-label={`${skill.name} 선택`}
            >
              <span className="sr-only">{skill.name}</span>
            </button>
          ))}
        </div>

        {/* Color Underlines */}
        <div className="flex gap-1 mt-1">
          {/* 초보 (1-2) */}
          <div className="flex gap-1" style={{ flex: 2 }}>
            <div className="flex-1 h-(--dimension-x1) rounded-full" style={{ backgroundColor: beginnerColor }} />
            <div className="flex-1 h-(--dimension-x1) rounded-full" style={{ backgroundColor: beginnerColor }} />
          </div>
          {/* 중급 (3-4) */}
          <div className="flex gap-1" style={{ flex: 2 }}>
            <div className="flex-1 h-(--dimension-x1) rounded-full" style={{ backgroundColor: intermediateColor }} />
            <div className="flex-1 h-(--dimension-x1) rounded-full" style={{ backgroundColor: intermediateColor }} />
          </div>
          {/* 상급 (5-6) */}
          <div className="flex gap-1" style={{ flex: 2 }}>
            <div className="flex-1 h-(--dimension-x1) rounded-full" style={{ backgroundColor: advancedColor }} />
            <div className="flex-1 h-(--dimension-x1) rounded-full" style={{ backgroundColor: advancedColor }} />
          </div>
          {/* 선출 (7) */}
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
        <div className="flex items-start gap-2">
          <div>
            <div className="font-semibold text-foreground">{selectedSkill.name}</div>
            <div className="mt-1 text-sm text-muted-foreground">{selectedSkill.description}</div>
          </div>
        </div>
      </div>
    </div>
  );
}
