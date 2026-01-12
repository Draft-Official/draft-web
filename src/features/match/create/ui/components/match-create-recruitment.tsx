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
                    {/* Guard */}
                    <div className="flex items-center justify-between p-3 bg-slate-50 rounded-xl border border-slate-100">
                        <span className="font-bold text-slate-700">가드 (G)</span>
                        <div className="flex items-center gap-3">
                            <button type="button" onClick={() => updatePosition('guard', -1)} className="w-8 h-8 rounded-full bg-white border border-slate-200 flex items-center justify-center hover:bg-slate-100"><Minus className="w-4 h-4 text-slate-600"/></button>
                            <span className="w-4 text-center font-bold text-lg">{positions.guard}</span>
                            <button type="button" onClick={() => updatePosition('guard', 1)} className="w-8 h-8 rounded-full bg-slate-900 text-white flex items-center justify-center hover:bg-slate-800"><Plus className="w-4 h-4"/></button>
                        </div>
                    </div>

                    {isFlexBigman ? (
                        // Bigman Only
                        <div className="flex items-center justify-between p-3 bg-slate-50 rounded-xl border border-slate-100">
                            <span className="font-bold text-slate-700">빅맨 (F/C)</span>
                            <div className="flex items-center gap-3">
                                <button type="button" onClick={() => updatePosition('bigman', -1)} className="w-8 h-8 rounded-full bg-white border border-slate-200 flex items-center justify-center hover:bg-slate-100"><Minus className="w-4 h-4 text-slate-600"/></button>
                                <span className="w-4 text-center font-bold text-lg">{positions.bigman}</span>
                                <button type="button" onClick={() => updatePosition('bigman', 1)} className="w-8 h-8 rounded-full bg-slate-900 text-white flex items-center justify-center hover:bg-slate-800"><Plus className="w-4 h-4"/></button>
                            </div>
                        </div>
                    ) : (
                        // Forward & Center
                        <>
                            <div className="flex items-center justify-between p-3 bg-slate-50 rounded-xl border border-slate-100">
                                <span className="font-bold text-slate-700">포워드 (F)</span>
                                <div className="flex items-center gap-3">
                                    <button type="button" onClick={() => updatePosition('forward', -1)} className="w-8 h-8 rounded-full bg-white border border-slate-200 flex items-center justify-center hover:bg-slate-100"><Minus className="w-4 h-4 text-slate-600"/></button>
                                    <span className="w-4 text-center font-bold text-lg">{positions.forward}</span>
                                    <button type="button" onClick={() => updatePosition('forward', 1)} className="w-8 h-8 rounded-full bg-slate-900 text-white flex items-center justify-center hover:bg-slate-800"><Plus className="w-4 h-4"/></button>
                                </div>
                            </div>
                            <div className="flex items-center justify-between p-3 bg-slate-50 rounded-xl border border-slate-100">
                                <span className="font-bold text-slate-700">센터 (C)</span>
                                <div className="flex items-center gap-3">
                                    <button type="button" onClick={() => updatePosition('center', -1)} className="w-8 h-8 rounded-full bg-white border border-slate-200 flex items-center justify-center hover:bg-slate-100"><Minus className="w-4 h-4 text-slate-600"/></button>
                                    <span className="w-4 text-center font-bold text-lg">{positions.center}</span>
                                    <button type="button" onClick={() => updatePosition('center', 1)} className="w-8 h-8 rounded-full bg-slate-900 text-white flex items-center justify-center hover:bg-slate-800"><Plus className="w-4 h-4"/></button>
                                </div>
                            </div>
                        </>
                    )}
                </div>
            </div>
        ) : (
            // Any Position
            <div className="flex items-center justify-between p-3 bg-slate-50 rounded-xl border border-slate-100">
                <span className="font-bold text-slate-700">전체 인원</span>
                <div className="flex items-center gap-3">
                    <button type="button" onClick={() => updateTotalCount(-1)} className="w-10 h-10 rounded-full bg-white border border-slate-200 flex items-center justify-center hover:bg-slate-100"><Minus className="w-5 h-5 text-slate-600"/></button>
                    <span className="min-w-[40px] text-center font-bold text-xl">{totalCount}명</span>
                    <button type="button" onClick={() => updateTotalCount(1)} className="w-10 h-10 rounded-full bg-slate-900 text-white flex items-center justify-center hover:bg-slate-800"><Plus className="w-5 h-5"/></button>
                </div>
            </div>
        )}
    </section>
  );
}
