'use client';

import { Label } from '@/components/ui/label';
import { Chip } from '@/components/ui/chip';
import { cn } from '@/shared/lib/utils';
import { Settings } from 'lucide-react';
import {
  MATCH_TYPE_OPTIONS,
  GENDER_OPTIONS,
  LEVEL_OPTIONS,
  AGE_OPTIONS
} from '@/features/match/create/config/constants';

interface MatchCreateSpecsProps {
  matchType: string;
  setMatchType: (v: string) => void;
  gender: string;
  setGender: (v: string) => void;
  level: string;
  setLevel: (v: string) => void;
  selectedAges: string[];
  handleAgeSelection: (age: string) => void;
}

export function MatchCreateSpecs({
  matchType, setMatchType,
  gender, setGender,
  level, setLevel,
  selectedAges, handleAgeSelection
}: MatchCreateSpecsProps) {
  return (
    <section className="bg-white p-5 rounded-2xl shadow-sm border border-slate-100 space-y-6">
        <h2 className="font-bold text-slate-900 flex items-center gap-2">
            <Settings className="w-5 h-5 text-slate-400" />
            매치 조건
        </h2>

        <div className="space-y-4">
            {/* Match Type */}
            <div className="space-y-2">
                <Label className="text-sm font-bold text-slate-600">매치 타입</Label>
                <div className="flex gap-2">
                    {MATCH_TYPE_OPTIONS.map((type) => (
                        <Chip
                            key={type.value}
                            label={type.label}
                            variant="slate"
                            isActive={matchType === type.value}
                            showCheckIcon={false}
                            onClick={() => setMatchType(type.value)}
                        />
                    ))}
                </div>
            </div>

            {/* Gender */}
            <div className="space-y-2">
                <Label className="text-sm font-bold text-slate-600">성별</Label>
                <div className="flex gap-2">
                    {GENDER_OPTIONS.map((g) => (
                        <Chip
                            key={g.value}
                            label={g.label}
                            variant="slate"
                            isActive={gender === g.value}
                            showCheckIcon={false}
                            onClick={() => setGender(g.value)}
                        />
                    ))}
                </div>
            </div>

            {/* Level Progress Bar */}
            <div className="space-y-3">
                <Label className="text-sm font-bold text-slate-600">권장 레벨</Label>
                <div className="space-y-3">
                    {/* Level Buttons Group */}
                    <div className="flex gap-1">
                        {LEVEL_OPTIONS.map((lvl) => (
                            // Render 2 buttons for the first 3 levels to match original design visual weight (2:2:2:1 ratio)
                            (lvl.value === 'pro' ? [1] : [1, 2]).map((i) => (
                                <button
                                    key={`${lvl.value}-${i}`}
                                    type="button"
                                    onClick={() => setLevel(lvl.value)}
                                    className={cn(
                                        "flex-1 h-10 rounded-lg transition-all",
                                        level === lvl.value ? "" : "bg-slate-200"
                                    )}
                                    style={{
                                        backgroundColor: level === lvl.value ? lvl.color : undefined
                                    }}
                                    aria-label={`${lvl.label} 레벨 선택`}
                                >
                                    <span className="sr-only">{lvl.label}</span>
                                </button>
                            ))
                        ))}
                    </div>

                    {/* Color Underlines */}
                    <div className="flex gap-1">
                         {LEVEL_OPTIONS.map((lvl) => (
                            <div key={lvl.value} className="flex gap-1" style={{ flex: lvl.value === 'pro' ? 1 : 2 }}>
                                {(lvl.value === 'pro' ? [1] : [1, 2]).map((i) => (
                                     <div key={i} className="flex-1 h-[3px] rounded-full" style={{ backgroundColor: lvl.color }}></div>
                                ))}
                            </div>
                        ))}
                    </div>

                    {/* Labels */}
                    <div className="flex gap-1">
                        {LEVEL_OPTIONS.map((lvl) => (
                             <div 
                                key={lvl.value} 
                                className="text-center font-medium text-xs" 
                                style={{ flex: lvl.value === 'pro' ? 1 : 2, color: lvl.color }}
                             >
                                {lvl.label}
                             </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Age */}
            <div className="space-y-2">
                <Label className="text-sm font-bold text-slate-600">권장 나이</Label>
                <div className="flex flex-wrap items-center gap-2">
                    <Chip
                        label="무관"
                        variant="slate"
                        isActive={selectedAges.includes('any')}
                        showCheckIcon={false}
                        onClick={() => handleAgeSelection('any')}
                        className="flex-shrink-0"
                    />

                    <div className="h-4 w-px bg-slate-200 mx-1"></div>

                    <div className="flex flex-wrap gap-2">
                        {AGE_OPTIONS.map((a) => (
                            <Chip
                                key={a.value}
                                label={a.label}
                                variant="slate"
                                isActive={selectedAges.includes(a.value)}
                                showCheckIcon={false}
                                onClick={() => handleAgeSelection(a.value)}
                            />
                        ))}
                    </div>
                </div>
            </div>
        </div>
    </section>
  );
}
