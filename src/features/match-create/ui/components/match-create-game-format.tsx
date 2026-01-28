import { Input } from '@/shared/ui/base/input';
import { Label } from '@/shared/ui/base/label';
import { Chip } from '@/shared/ui/base/chip';
import { Info, Plus, Minus } from 'lucide-react';
import { PLAY_STYLE_OPTIONS as GAME_FORMAT_OPTIONS, REFEREE_TYPE_OPTIONS as REFEREE_OPTIONS, PLAY_STYLE_DEFAULT, REFEREE_TYPE_DEFAULT, PlayStyleValue, RefereeTypeValue } from '@/shared/config/constants';

interface MatchCreateGameFormatProps {
  gameFormatType: PlayStyleValue | undefined;
  setGameFormatType: (v: PlayStyleValue | undefined) => void;
  isGameFormatSelected: boolean;
  setIsGameFormatSelected: (v: boolean) => void;
  ruleMinutes: string;
  setRuleMinutes: (v: string) => void;
  ruleQuarters: string;
  setRuleQuarters: (v: string) => void;
  ruleGames: string;
  setRuleGames: (v: string) => void;
  isRulesSelected: boolean;
  setIsRulesSelected: (v: boolean) => void;
  refereeType: RefereeTypeValue | undefined;
  setRefereeType: (v: RefereeTypeValue | undefined) => void;
  isRefereeSelected: boolean;
  setIsRefereeSelected: (v: boolean) => void;
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
  isGameFormatSelected, setIsGameFormatSelected,
  ruleMinutes, setRuleMinutes,
  ruleQuarters, setRuleQuarters,
  ruleGames, setRuleGames,
  isRulesSelected, setIsRulesSelected,
  refereeType, setRefereeType,
  isRefereeSelected, setIsRefereeSelected
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
                isOpen={isGameFormatSelected}
                onOpen={() => {
                    setIsGameFormatSelected(true);
                    if (!gameFormatType) setGameFormatType(PLAY_STYLE_DEFAULT); // 기본값 설정
                }}
                onClose={() => {
                    setIsGameFormatSelected(false);
                    setGameFormatType(undefined);
                }}
            >
                <div className="flex flex-wrap gap-2">
                    {GAME_FORMAT_OPTIONS.map(t => (
                        <Chip
                            key={t.value}
                            label={t.label}
                            variant="navy"
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
                isOpen={isRulesSelected}
                onOpen={() => {
                    setIsRulesSelected(true);
                    // 기본값 설정 (이미 부모에서 설정됨)
                }}
                onClose={() => {
                    setIsRulesSelected(false);
                    // 값은 유지하되 선택 해제 (서버 전송 안함)
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

            {/* Referee - Spacing Update */}
            <GameFormatItem
                title="심판 방식"
                isOpen={isRefereeSelected}
                onOpen={() => {
                    setIsRefereeSelected(true);
                    if (!refereeType) setRefereeType(REFEREE_TYPE_DEFAULT); // 기본값 설정
                }}
                onClose={() => {
                    setIsRefereeSelected(false);
                    setRefereeType(undefined);
                }}
            >
                <div className="flex gap-2">
                    {REFEREE_OPTIONS.map(r => (
                        <Chip
                            key={r.value}
                            label={r.label}
                            variant="navy"
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
