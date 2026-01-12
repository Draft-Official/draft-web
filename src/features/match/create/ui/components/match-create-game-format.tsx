'use client';

import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/shared/lib/utils';
import { Info, Plus, X } from 'lucide-react';

interface MatchCreateGameFormatProps {
  gameFormatType: string;
  setGameFormatType: (v: string) => void;
  ruleMinutes: string;
  setRuleMinutes: (v: string) => void;
  ruleQuarters: string;
  setRuleQuarters: (v: string) => void;
  ruleGames: string;
  setRuleGames: (v: string) => void;
  guaranteedQuarters: string;
  setGuaranteedQuarters: (v: string) => void;
  refereeType: string;
  setRefereeType: (v: string) => void;

  showRules: boolean;
  setShowRules: (v: boolean) => void;
  showGuaranteed: boolean;
  setShowGuaranteed: (v: boolean) => void;
  showReferee: boolean;
  setShowReferee: (v: boolean) => void;
}

export function MatchCreateGameFormat({
  gameFormatType, setGameFormatType,
  ruleMinutes, setRuleMinutes,
  ruleQuarters, setRuleQuarters,
  ruleGames, setRuleGames,
  guaranteedQuarters, setGuaranteedQuarters,
  refereeType, setRefereeType,
  showRules, setShowRules,
  showGuaranteed, setShowGuaranteed,
  showReferee, setShowReferee
}: MatchCreateGameFormatProps) {
  return (
    <section className="bg-white p-5 rounded-2xl shadow-sm border border-slate-100 space-y-4 relative overflow-hidden">
        <div className="absolute top-0 right-0 bg-blue-50 px-3 py-1.5 rounded-bl-xl border-l border-b border-blue-100">
            <span className="text-[10px] font-bold text-blue-600">작성하면 문의가 줄어들어요!</span>
        </div>

        <h2 className="font-bold text-slate-900 flex items-center gap-2">
            <Info className="w-5 h-5 text-slate-400" />
            경기 진행 방식 (선택)
        </h2>

        <div className="space-y-4">
            {/* Game Type */}
            <div className="space-y-2">
                <Label className="text-sm font-bold text-slate-600">경기 형태</Label>
                <div className="flex flex-wrap gap-2">
                    {[
                        {v:'internal_2', l:'자체전(2파전)'},
                        {v:'internal_3', l:'자체전(3파전)'},
                        {v:'exchange', l:'팀 교류전'},
                        {v:'practice', l:'연습/레슨'}
                    ].map(t => (
                        <Badge
                            key={t.v}
                            onClick={() => setGameFormatType(t.v)}
                            variant="outline"
                            className={cn(
                                "cursor-pointer px-3 py-2 text-sm font-medium border transition-all",
                                gameFormatType === t.v
                                    ? "bg-slate-800 text-white border-slate-800"
                                    : "bg-white text-slate-500 border-slate-200 hover:bg-slate-50"
                            )}
                        >
                            {t.l}
                        </Badge>
                    ))}
                </div>
            </div>

            {/* Rules - Vertical List */}
            <div className="space-y-4">
                    {/* Add Rule */}
                {!showRules ? (
                    <button
                        type="button"
                        onClick={() => setShowRules(true)}
                        className="w-full text-left flex items-center gap-3 py-1 group"
                    >
                        <Plus className="w-5 h-5 text-slate-400 group-hover:text-[#FF6600]" />
                        <span className="text-base font-medium text-slate-600 group-hover:text-[#FF6600]">상세 룰 추가</span>
                    </button>
                ) : (
                    <div className="space-y-2 p-3 bg-slate-50 rounded-xl border border-slate-100">
                        <div className="flex items-center justify-between">
                            <Label className="text-sm font-bold text-[#FF6600]">상세 룰</Label>
                            <button
                                type="button"
                                onClick={() => {
                                    setShowRules(false);
                                    setRuleMinutes("");
                                    setRuleQuarters("");
                                    setRuleGames("");
                                }}
                                className="text-xs text-slate-400 hover:text-slate-600"
                            >
                                <X className="w-4 h-4" />
                            </button>
                        </div>
                        <div className="flex items-center gap-2">
                            <Input
                                value={ruleMinutes}
                                onChange={(e) => setRuleMinutes(e.target.value)}
                                className="w-20 h-10 text-center bg-white border-slate-200"
                                placeholder="분"
                            />
                            <span className="text-slate-300">/</span>
                            <Input
                                    value={ruleQuarters}
                                    onChange={(e) => setRuleQuarters(e.target.value)}
                                className="w-20 h-10 text-center bg-white border-slate-200"
                                placeholder="쿼터"
                            />
                            <span className="text-slate-300">/</span>
                            <Input
                                    value={ruleGames}
                                    onChange={(e) => setRuleGames(e.target.value)}
                                className="w-20 h-10 text-center bg-white border-slate-200"
                                placeholder="경기"
                            />
                        </div>
                    </div>
                )}

                {/* Add Guaranteed Quarters */}
                {!showGuaranteed ? (
                    <button
                        type="button"
                        onClick={() => setShowGuaranteed(true)}
                        className="w-full text-left flex items-center gap-3 py-1 group"
                    >
                        <Plus className="w-5 h-5 text-slate-400 group-hover:text-[#FF6600]" />
                        <span className="text-base font-medium text-slate-600 group-hover:text-[#FF6600]">보장 쿼터 추가</span>
                    </button>
                ) : (
                    <div className="space-y-2 p-3 bg-slate-50 rounded-xl border border-slate-100">
                            <div className="flex items-center justify-between">
                            <Label className="text-sm font-bold text-[#FF6600]">보장 쿼터</Label>
                            <button
                                type="button"
                                onClick={() => {
                                    setShowGuaranteed(false);
                                    setGuaranteedQuarters("");
                                }}
                                className="text-xs text-slate-400 hover:text-slate-600"
                            >
                                <X className="w-4 h-4" />
                            </button>
                        </div>
                        <Input
                            value={guaranteedQuarters}
                            onChange={(e) => setGuaranteedQuarters(e.target.value)}
                            placeholder="예: 최소 6쿼터"
                            className="h-10 bg-white border-slate-200"
                        />
                    </div>
                )}

                {/* Add Referee */}
                    {!showReferee ? (
                    <button
                        type="button"
                        onClick={() => setShowReferee(true)}
                        className="w-full text-left flex items-center gap-3 py-1 group"
                    >
                        <Plus className="w-5 h-5 text-slate-400 group-hover:text-[#FF6600]" />
                        <span className="text-base font-medium text-slate-600 group-hover:text-[#FF6600]">심판 추가</span>
                    </button>
                ) : (
                    <div className="space-y-2 p-3 bg-slate-50 rounded-xl border border-slate-100">
                            <div className="flex items-center justify-between">
                            <Label className="text-sm font-bold text-[#FF6600]">심판</Label>
                            <button
                                type="button"
                                onClick={() => {
                                    setShowReferee(false);
                                    setRefereeType("self");
                                }}
                                className="text-xs text-slate-400 hover:text-slate-600"
                            >
                                <X className="w-4 h-4" />
                            </button>
                        </div>
                        <div className="flex gap-2">
                            {[
                                {v:'self', l:'자체콜'},
                                {v:'member', l:'게스트/팀원'},
                                {v:'pro', l:'전문 심판'}
                            ].map(r => (
                                <Badge
                                    key={r.v}
                                    onClick={() => setRefereeType(r.v)}
                                    variant="outline"
                                    className={cn(
                                        "cursor-pointer px-3 py-2 text-sm font-medium border transition-all",
                                        refereeType === r.v
                                            ? "bg-slate-800 text-white border-slate-800"
                                            : "bg-white text-slate-500 border-slate-200 hover:bg-slate-50"
                                    )}
                                >
                                    {r.l}
                                </Badge>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </div>
    </section>
  );
}
