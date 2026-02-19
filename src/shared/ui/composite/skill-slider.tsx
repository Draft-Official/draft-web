'use client';

import { cn } from '@/shared/lib/utils';
import { SKILL_LEVELS } from '@/shared/config/skill-constants';

interface SkillSliderProps {
  value: number;
  onChange: (value: number) => void;
}

export function SkillSlider({ value, onChange }: SkillSliderProps) {
  const selectedSkill = SKILL_LEVELS.find(s => s.level === value) || SKILL_LEVELS[0];

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
                  : "bg-slate-200"
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
            <div className="flex-1 h-[3px] rounded-full" style={{ backgroundColor: 'var(--color-fg-brand)' }} />
            <div className="flex-1 h-[3px] rounded-full" style={{ backgroundColor: 'var(--color-fg-brand)' }} />
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
          <div className="text-center font-medium text-xs" style={{ flex: 2, color: 'var(--color-fg-brand)' }}>상급</div>
          <div className="text-center font-medium text-xs" style={{ flex: 1, color: '#EF4444' }}>선출</div>
        </div>
      </div>

      {/* Description Card */}
      <div className="bg-slate-50 rounded-lg p-4 border border-slate-200">
        <div className="flex items-start gap-2">
          <div>
            <div className="font-semibold text-slate-900">{selectedSkill.name}</div>
            <div className="text-sm text-slate-600 mt-1">{selectedSkill.description}</div>
          </div>
        </div>
      </div>
    </div>
  );
}
