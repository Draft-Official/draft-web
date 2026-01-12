'use client';

import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/shared/lib/utils';
import { Settings } from 'lucide-react';

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
                    {['5vs5', '3vs3'].map((type) => (
                        <Badge
                            key={type}
                            onClick={() => setMatchType(type)}
                            variant="outline"
                            className={cn(
                                "cursor-pointer px-4 py-2 text-sm font-bold border transition-all",
                                matchType === type
                                    ? "bg-slate-900 text-white border-slate-900"
                                    : "bg-white text-slate-500 border-slate-200"
                            )}
                        >
                            {type}
                        </Badge>
                    ))}
                </div>
            </div>

            {/* Gender */}
            <div className="space-y-2">
                <Label className="text-sm font-bold text-slate-600">성별</Label>
                <div className="flex gap-2">
                    {[{v:'male', l:'남성'}, {v:'female', l:'여성'}, {v:'mixed', l:'혼성'}].map((g) => (
                        <Badge
                            key={g.v}
                            onClick={() => setGender(g.v)}
                            variant="outline"
                            className={cn(
                                "cursor-pointer px-4 py-2 text-sm font-bold border transition-all",
                                gender === g.v
                                    ? "bg-slate-900 text-white border-slate-900"
                                    : "bg-white text-slate-500 border-slate-200"
                            )}
                        >
                            {g.l}
                        </Badge>
                    ))}
                </div>
            </div>

            {/* Level Progress Bar */}
            <div className="space-y-3">
                <Label className="text-sm font-bold text-slate-600">권장 레벨</Label>
                <div className="space-y-3">
                    <div className="flex gap-1">
                        {/* Beginner 1-2 (Green) */}
                        {[1, 2].map((i) => (
                            <button
                                key={`low-${i}`}
                                type="button"
                                onClick={() => setLevel('low')}
                                className={cn(
                                    "flex-1 h-10 rounded-lg transition-all",
                                    level === 'low' ? "" : "bg-slate-200"
                                )}
                                style={{
                                    backgroundColor: level === 'low' ? '#22C55E' : undefined
                                }}
                                aria-label="초보 레벨 선택"
                            >
                                <span className="sr-only">초보</span>
                            </button>
                        ))}
                        {/* Intermediate 3-4 (Yellow) */}
                        {[1, 2].map((i) => (
                            <button
                                key={`middle-${i}`}
                                type="button"
                                onClick={() => setLevel('middle')}
                                className={cn(
                                    "flex-1 h-10 rounded-lg transition-all",
                                    level === 'middle' ? "" : "bg-slate-200"
                                )}
                                style={{
                                    backgroundColor: level === 'middle' ? '#EAB308' : undefined
                                }}
                                aria-label="중수 레벨 선택"
                            >
                                <span className="sr-only">중수</span>
                            </button>
                        ))}
                        {/* Advanced 5-6 (Orange) */}
                        {[1, 2].map((i) => (
                            <button
                                key={`high-${i}`}
                                type="button"
                                onClick={() => setLevel('high')}
                                className={cn(
                                    "flex-1 h-10 rounded-lg transition-all",
                                    level === 'high' ? "" : "bg-slate-200"
                                )}
                                style={{
                                    backgroundColor: level === 'high' ? '#FF6600' : undefined
                                }}
                                aria-label="고수 레벨 선택"
                            >
                                <span className="sr-only">고수</span>
                            </button>
                        ))}
                        {/* Pro (Red) */}
                        <button
                            type="button"
                            onClick={() => setLevel('pro')}
                            className={cn(
                                "flex-1 h-10 rounded-lg transition-all",
                                level === 'pro' ? "" : "bg-slate-200"
                            )}
                            style={{
                                backgroundColor: level === 'pro' ? '#EF4444' : undefined
                            }}
                            aria-label="프로 레벨 선택"
                        >
                            <span className="sr-only">프로</span>
                        </button>
                    </div>

                    {/* Color Underlines */}
                    <div className="flex gap-1">
                        <div className="flex gap-1" style={{ flex: 2 }}>
                            <div className="flex-1 h-[3px] rounded-full" style={{ backgroundColor: '#22C55E' }}></div>
                            <div className="flex-1 h-[3px] rounded-full" style={{ backgroundColor: '#22C55E' }}></div>
                        </div>
                        <div className="flex gap-1" style={{ flex: 2 }}>
                            <div className="flex-1 h-[3px] rounded-full" style={{ backgroundColor: '#EAB308' }}></div>
                            <div className="flex-1 h-[3px] rounded-full" style={{ backgroundColor: '#EAB308' }}></div>
                        </div>
                        <div className="flex gap-1" style={{ flex: 2 }}>
                            <div className="flex-1 h-[3px] rounded-full" style={{ backgroundColor: '#FF6600' }}></div>
                            <div className="flex-1 h-[3px] rounded-full" style={{ backgroundColor: '#FF6600' }}></div>
                        </div>
                        <div style={{ flex: 1 }}>
                            <div className="h-[3px] rounded-full" style={{ backgroundColor: '#EF4444' }}></div>
                        </div>
                    </div>

                    {/* Labels */}
                    <div className="flex gap-1">
                        <div className="text-center font-medium text-xs" style={{ flex: 2, color: '#22C55E' }}>초보</div>
                        <div className="text-center font-medium text-xs" style={{ flex: 2, color: '#EAB308' }}>중급</div>
                        <div className="text-center font-medium text-xs" style={{ flex: 2, color: '#FF6600' }}>상급</div>
                        <div className="text-center font-medium text-xs" style={{ flex: 1, color: '#EF4444' }}>프로</div>
                    </div>
                </div>
            </div>

            {/* Age */}
            <div className="space-y-2">
                <Label className="text-sm font-bold text-slate-600">권장 나이</Label>
                {/* Fixed container to prevent vertical stacking */}
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
                        {[
                            {v:'20', l:'20대'},
                            {v:'30', l:'30대'},
                            {v:'40', l:'40대'},
                            {v:'50', l:'50대'},
                            {v:'60', l:'60대'},
                            {v:'70', l:'70대'}
                        ].map((a) => {
                            const isSelected = selectedAges.includes(a.v);
                            return (
                                <Badge
                                    key={a.v}
                                    onClick={() => handleAgeSelection(a.v)}
                                    variant="outline"
                                    className={cn(
                                        "cursor-pointer px-4 py-2 text-sm font-bold border transition-all",
                                        isSelected
                                            ? "bg-slate-900 text-white border-slate-900"
                                            : "bg-white text-slate-500 border-slate-200"
                                    )}
                                >
                                    {a.l}
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
