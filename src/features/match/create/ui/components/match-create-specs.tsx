'use client';

import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
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
                        <Badge
                            key={type.value}
                            onClick={() => setMatchType(type.value)}
                            variant="outline"
                            className={cn(
                                "cursor-pointer px-4 py-2 text-sm font-bold border transition-all",
                                matchType === type.value
                                    ? "bg-slate-900 text-white border-slate-900"
                                    : "bg-white text-slate-500 border-slate-200"
                            )}
                        >
                            {type.label}
                        </Badge>
                    ))}
                </div>
            </div>

            {/* Gender */}
            <div className="space-y-2">
                <Label className="text-sm font-bold text-slate-600">성별</Label>
                <div className="flex gap-2">
                    {GENDER_OPTIONS.map((g) => (
                        <Badge
                            key={g.value}
                            onClick={() => setGender(g.value)}
                            variant="outline"
                            className={cn(
                                "cursor-pointer px-4 py-2 text-sm font-bold border transition-all",
                                gender === g.value
                                    ? "bg-slate-900 text-white border-slate-900"
                                    : "bg-white text-slate-500 border-slate-200"
                            )}
                        >
                            {g.label}
                        </Badge>
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
                    <Badge
                        onClick={() => handleAgeSelection('any')}
                        variant="outline"
                        className={cn(
                            "cursor-pointer px-4 py-2 text-sm font-bold border transition-all flex-shrink-0",
                            selectedAges.includes('any')
                                ? "bg-slate-900 text-white border-slate-900"
                                : "bg-white text-slate-500 border-slate-200"
                        )}
                    >
                        무관
                    </Badge>
                    
                    <div className="h-4 w-px bg-slate-200 mx-1"></div>

                    <div className="flex flex-wrap gap-2">
                        {AGE_OPTIONS.map((a) => {
                            const isSelected = selectedAges.includes(a.value);
                            return (
                                <Badge
                                    key={a.value}
                                    onClick={() => handleAgeSelection(a.value)}
                                    variant="outline"
                                    className={cn(
                                        "cursor-pointer px-4 py-2 text-sm font-bold border transition-all",
                                        isSelected
                                            ? "bg-slate-900 text-white border-slate-900"
                                            : "bg-white text-slate-500 border-slate-200"
                                    )}
                                >
                                    {a.label}
                                </Badge>
                            );
                        })}
                    </div>
                </div>
            </div>
        </div>
    </section>
  );
}
