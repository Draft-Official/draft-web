import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/shared/lib/utils';
import { Info, Plus, Minus } from 'lucide-react';
import { GAME_FORMAT_OPTIONS, REFEREE_OPTIONS } from '@/features/match/create/config/constants';

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

  showGameFormatType: boolean;
  setShowGameFormatType: (v: boolean) => void;
  showRules: boolean;
  setShowRules: (v: boolean) => void;
  showGuaranteed: boolean;
  setShowGuaranteed: (v: boolean) => void;
  showReferee: boolean;
  setShowReferee: (v: boolean) => void;
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
            <div className="flex items-center gap-2">
                <button
                    type="button"
                    onClick={onClose}
                    className="w-5 h-5 rounded-full border border-slate-200 flex items-center justify-center hover:bg-slate-50 transition-colors flex-shrink-0 bg-white"
                >
                    <Minus className="w-3 h-3 text-slate-400" />
                </button>
                <Label className="text-sm font-bold text-slate-700">{title}</Label>
            </div>
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
  refereeType, setRefereeType,
  showGameFormatType, setShowGameFormatType,
  showRules, setShowRules,
  showGuaranteed, setShowGuaranteed,
  showReferee, setShowReferee
}: MatchCreateGameFormatProps) {
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
                    setGameFormatType("internal_2");
                }}
            >
                <div className="flex flex-wrap gap-2">
                    {GAME_FORMAT_OPTIONS.map(t => (
                        <Badge
                            key={t.value}
                            onClick={() => setGameFormatType(t.value)}
                            variant="outline"
                            className={cn(
                                "cursor-pointer px-3 py-2 text-sm font-medium border transition-all rounded-lg h-10 px-4",
                                gameFormatType === t.value
                                    ? "bg-slate-900 text-white border-slate-900"
                                    : "bg-white text-slate-500 border-slate-200 hover:bg-slate-50"
                            )}
                        >
                            {t.label}
                        </Badge>
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
                <div className="flex items-center gap-2 max-w-[120px]">
                    <Input
                        value={guaranteedQuarters}
                        onChange={(e) => setGuaranteedQuarters(e.target.value)}
                        placeholder="0"
                        className="h-10 bg-white border-slate-200 text-right pr-2 rounded-lg"
                        inputMode="numeric"
                    />
                    <span className="text-slate-500 text-sm whitespace-nowrap">쿼터</span>
                </div>
            </GameFormatItem>

            {/* Referee - Spacing Update */}
            <GameFormatItem
                title="심판 형식"
                isOpen={showReferee}
                onOpen={() => setShowReferee(true)}
                onClose={() => {
                    setShowReferee(false);
                    setRefereeType("self");
                }}
            >
                <div className="flex gap-2">
                    {REFEREE_OPTIONS.map(r => (
                        <Badge
                            key={r.value}
                            onClick={() => setRefereeType(r.value)}
                            variant="outline"
                            className={cn(
                                "cursor-pointer px-3 py-2 text-sm font-medium border transition-all rounded-lg h-10 px-4",
                                refereeType === r.value
                                    ? "bg-slate-900 text-white border-slate-900"
                                    : "bg-white text-slate-500 border-slate-200 hover:bg-slate-50"
                            )}
                        >
                            {r.label}
                        </Badge>
                    ))}
                </div>
            </GameFormatItem>

        </div>
    </section>
  );
}
