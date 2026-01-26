import { useState } from 'react';
import { Input } from '@/shared/ui/base/input';
import { Label } from '@/shared/ui/base/label';
import { Chip } from '@/shared/ui/base/chip';
import { Info, Plus, Minus } from 'lucide-react';
import { PLAY_STYLE_OPTIONS as GAME_FORMAT_OPTIONS, REFEREE_TYPE_OPTIONS as REFEREE_OPTIONS, PLAY_STYLE_DEFAULT, REFEREE_TYPE_DEFAULT, PlayStyleValue, RefereeTypeValue } from '@/shared/config/constants';

interface MatchCreateGameFormatProps {
  gameFormatType: PlayStyleValue;
  setGameFormatType: (v: PlayStyleValue) => void;
  ruleMinutes: string;
  setRuleMinutes: (v: string) => void;
  ruleQuarters: string;
  setRuleQuarters: (v: string) => void;
  ruleGames: string;
  setRuleGames: (v: string) => void;
  guaranteedQuarters: string;
  setGuaranteedQuarters: (v: string) => void;
  refereeType: RefereeTypeValue;
  setRefereeType: (v: RefereeTypeValue) => void;
}

// Reusable Section Item Component
function GameFormatItem({
    title,
    isOpen,
    onOpen,
    onClose,
    children
}: {
    title: string;
    isOpen: boolean;
    onOpen: () => void;
    onClose: () => void;
    children: React.ReactNode;
}) {
    if (!isOpen) {
        return (
            <button
                type="button"
                onClick={onOpen}
                className="w-full text-left flex items-center gap-3 py-1 group"
            >
                <Plus className="w-5 h-5 text-slate-400 group-hover:text-[#FF6600]" />
                <span className="text-base font-medium text-slate-600 group-hover:text-[#FF6600]">
                    {title} 추가
                </span>
            </button>
        );
    }

    return (
        <div className="space-y-4">
            <button
                type="button"
                onClick={onClose}
                className="flex items-center gap-2 group cursor-pointer w-full text-left"
            >
                <div className="w-5 h-5 rounded-full border border-slate-200 flex items-center justify-center group-hover:bg-slate-50 transition-colors flex-shrink-0 bg-white">
                    <Minus className="w-3 h-3 text-slate-400" />
                </div>
                <Label className="text-sm font-bold text-slate-700 cursor-pointer">{title}</Label>
            </button>
            {children}
        </div>
    );
}

export function MatchCreateGameFormat({
  gameFormatType, setGameFormatType,
  ruleMinutes, setRuleMinutes,
  ruleQuarters, setRuleQuarters,
  ruleGames, setRuleGames,
  guaranteedQuarters, setGuaranteedQuarters,
  refereeType, setRefereeType
}: MatchCreateGameFormatProps) {
  // UI 상태 로컬화
  const [showGameFormatType, setShowGameFormatType] = useState(false);
  const [showRules, setShowRules] = useState(false);
  const [showGuaranteed, setShowGuaranteed] = useState(false);
  const [showReferee, setShowReferee] = useState(false);

  return (
    <section className="bg-white p-5 rounded-2xl shadow-sm border border-slate-100 space-y-4 relative overflow-hidden">
        <h2 className="font-bold text-slate-900 flex items-center gap-2">
            <Info className="w-5 h-5 text-slate-400" />
            경기 진행 방식 (선택)
        </h2>

        <div className="space-y-6">
            
            {/* Game Type - Componentized */}
            <GameFormatItem
                title="경기 형태"
                isOpen={showGameFormatType}
                onOpen={() => setShowGameFormatType(true)}
                onClose={() => {
                    setShowGameFormatType(false);
                    setGameFormatType(PLAY_STYLE_DEFAULT);
                }}
            >
                <div className="flex flex-wrap gap-2">
                    {GAME_FORMAT_OPTIONS.map(t => (
                        <Chip
                            key={t.value}
                            label={t.label}
                            variant="orange"
                            isActive={gameFormatType === t.value}
                            showCheckIcon={false}
                            onClick={() => setGameFormatType(t.value)}
                        />
                    ))}
                </div>
            </GameFormatItem>

            {/* Rules - Layout Update */}
            <GameFormatItem
                title="쿼터 진행 방식"
                isOpen={showRules}
                onOpen={() => setShowRules(true)}
                onClose={() => {
                    setShowRules(false);
                    setRuleMinutes("");
                    setRuleQuarters("");
                    setRuleGames("");
                }}
            >
                 <div className="flex items-center gap-3">
                    <div className="flex items-center gap-2">
                        <Input
                            value={ruleMinutes}
                            onChange={(e) => setRuleMinutes(e.target.value)}
                            className="w-16 h-10 text-center bg-white border-slate-200 rounded-lg"
                            placeholder="0"
                            inputMode="numeric"
                        />
                        <span className="text-slate-500 text-sm">분</span>
                    </div>
                    <span className="text-slate-300">/</span>
                    <div className="flex items-center gap-2">
                        <Input
                            value={ruleQuarters}
                            onChange={(e) => setRuleQuarters(e.target.value)}
                            className="w-16 h-10 text-center bg-white border-slate-200 rounded-lg"
                            placeholder="0"
                            inputMode="numeric"
                        />
                        <span className="text-slate-500 text-sm">쿼터</span>
                    </div>
                    <span className="text-slate-300">/</span>
                    <div className="flex items-center gap-2">
                        <Input
                            value={ruleGames}
                            onChange={(e) => setRuleGames(e.target.value)}
                            className="w-16 h-10 text-center bg-white border-slate-200 rounded-lg"
                            placeholder="0"
                            inputMode="numeric"
                        />
                        <span className="text-slate-500 text-sm">경기</span>
                    </div>
                </div>
            </GameFormatItem>

            {/* Guaranteed Quarters - Input Suffix */}
            <GameFormatItem
                title="보장 쿼터"
                isOpen={showGuaranteed}
                onOpen={() => setShowGuaranteed(true)}
                onClose={() => {
                    setShowGuaranteed(false);
                    setGuaranteedQuarters("");
                }}
            >
                <div className="flex items-center gap-2">
                    <Input
                        value={guaranteedQuarters}
                        onChange={(e) => setGuaranteedQuarters(e.target.value)}
                        placeholder="0"
                        className="w-16 h-10 text-center bg-white border-slate-200 rounded-lg"
                        inputMode="numeric"
                    />
                    <span className="text-slate-500 text-sm whitespace-nowrap">쿼터</span>
                </div>
            </GameFormatItem>

            {/* Referee - Spacing Update */}
            <GameFormatItem
                title="심판 방식"
                isOpen={showReferee}
                onOpen={() => setShowReferee(true)}
                onClose={() => {
                    setShowReferee(false);
                    setRefereeType(REFEREE_TYPE_DEFAULT);
                }}
            >
                <div className="flex gap-2">
                    {REFEREE_OPTIONS.map(r => (
                        <Chip
                            key={r.value}
                            label={r.label}
                            variant="orange"
                            isActive={refereeType === r.value}
                            showCheckIcon={false}
                            onClick={() => setRefereeType(r.value)}
                        />
                    ))}
                </div>
            </GameFormatItem>

        </div>
    </section>
  );
}
