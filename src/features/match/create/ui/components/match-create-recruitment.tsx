'use client';

import { Checkbox } from '@/components/ui/checkbox';
import { Switch } from '@/components/ui/switch';
import { cn } from '@/shared/lib/utils';
import { Minus, Plus, Users } from 'lucide-react';

type PositionMap = { guard: number; forward: number; center: number; bigman: number };

interface MatchCreateRecruitmentProps {
  isPositionMode: boolean;
  setIsPositionMode: (v: boolean) => void;
  isFlexBigman: boolean;
  setIsFlexBigman: (v: boolean) => void;
  positions: PositionMap;
  updatePosition: (pos: keyof PositionMap, delta: number) => void;
  totalCount: number;
  updateTotalCount: (delta: number) => void;
}

// Unified Recruitment Card Component
function RecruitmentCard({
    title,
    count,
    onDecrease,
    onIncrease
}: {
    title: string;
    count: number;
    onDecrease: () => void;
    onIncrease: () => void;
}) {
    return (
        <div className="flex items-center justify-between p-3 bg-slate-50 rounded-xl border border-slate-100">
            <span className="font-bold text-slate-700">{title}</span>
            <div className="flex items-center gap-3">
                <button 
                    type="button" 
                    onClick={onDecrease} 
                    className="w-8 h-8 rounded-full bg-white border border-slate-200 flex items-center justify-center hover:bg-slate-100"
                >
                    <Minus className="w-4 h-4 text-slate-600"/>
                </button>
                <span className="w-6 text-center font-bold text-lg">{count}</span>
                <button 
                    type="button" 
                    onClick={onIncrease} 
                    className="w-8 h-8 rounded-full bg-slate-900 text-white flex items-center justify-center hover:bg-slate-800"
                >
                    <Plus className="w-4 h-4"/>
                </button>
            </div>
        </div>
    );
}

export function MatchCreateRecruitment({
  isPositionMode, setIsPositionMode,
  isFlexBigman, setIsFlexBigman,
  positions, updatePosition,
  totalCount, updateTotalCount
}: MatchCreateRecruitmentProps) {
  return (
    <section className="bg-white p-5 rounded-2xl shadow-sm border border-slate-100 space-y-6">
        <div className="flex items-center justify-between">
            <h2 className="font-bold text-slate-900 flex items-center gap-2">
                <Users className="w-5 h-5 text-slate-400" />
                모집 인원
            </h2>
            <div className="flex items-center gap-2">
                <span className={cn("text-xs font-bold", !isPositionMode ? "text-[#FF6600]" : "text-slate-400")}>포지션 무관</span>
                <Switch 
                    checked={isPositionMode} 
                    onCheckedChange={setIsPositionMode} 
                    className="data-[state=checked]:bg-[#FF6600] data-[state=unchecked]:bg-slate-200" 
                />
                <span className={cn("text-xs font-bold", isPositionMode ? "text-[#FF6600]" : "text-slate-400")}>포지션별</span>
            </div>
        </div>

        {isPositionMode ? (
            // Position Based
            <div className="space-y-4">
                    <div className="flex items-center justify-end space-x-2 mb-2">
                    <Checkbox
                        id="flex-bigman"
                        checked={isFlexBigman}
                        onCheckedChange={(c) => setIsFlexBigman(!!c)}
                    />
                    <label
                        htmlFor="flex-bigman"
                        className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 text-slate-600"
                    >
                        빅맨 통합 (F/C)
                    </label>
                </div>

                <div className="space-y-3">
                    <RecruitmentCard 
                        title="가드 (G)" 
                        count={positions.guard} 
                        onDecrease={() => updatePosition('guard', -1)} 
                        onIncrease={() => updatePosition('guard', 1)} 
                    />

                    {isFlexBigman ? (
                        <RecruitmentCard 
                            title="빅맨 (F/C)" 
                            count={positions.bigman} 
                            onDecrease={() => updatePosition('bigman', -1)} 
                            onIncrease={() => updatePosition('bigman', 1)} 
                        />
                    ) : (
                        <>
                            <RecruitmentCard 
                                title="포워드 (F)" 
                                count={positions.forward} 
                                onDecrease={() => updatePosition('forward', -1)} 
                                onIncrease={() => updatePosition('forward', 1)} 
                            />
                            <RecruitmentCard 
                                title="센터 (C)" 
                                count={positions.center} 
                                onDecrease={() => updatePosition('center', -1)} 
                                onIncrease={() => updatePosition('center', 1)} 
                            />
                        </>
                    )}
                </div>
            </div>
        ) : (
            // Any Position
            <div className="space-y-3">
                <RecruitmentCard 
                    title="전체 인원" 
                    count={totalCount} 
                    onDecrease={() => updateTotalCount(-1)} 
                    onIncrease={() => updateTotalCount(1)} 
                />
            </div>
        )}
    </section>
  );
}
