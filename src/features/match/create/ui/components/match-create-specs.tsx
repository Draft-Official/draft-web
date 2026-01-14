import { Label } from '@/components/ui/label';
import { Chip } from '@/components/ui/chip';
import { cn } from '@/shared/lib/utils';
import { Settings } from 'lucide-react';
import {
  MATCH_TYPE_OPTIONS,
  GENDER_OPTIONS
} from '@/features/match/create/config/constants';
import { AgeSelector } from './age-selector';
import { SkillSlider } from '@/components/ui/skill-slider';

interface MatchCreateSpecsProps {
  matchType: string;
  setMatchType: (v: string) => void;
  gender: string;
  setGender: (v: string) => void;
  level: number;
  setLevel: (v: number) => void;
  selectedAges: string[];
  handleAgeSelection: (age: string) => void;
  handleAgeRangeUpdate: (ages: string[]) => void;
  hasShoes: boolean;
  setHasShoes: (v: boolean) => void;
  hasJersey: boolean;
  setHasJersey: (v: boolean) => void;
}

export function MatchCreateSpecs({
  matchType, setMatchType,
  gender, setGender,
  level, setLevel,
  selectedAges, handleAgeSelection,
  handleAgeRangeUpdate,
  hasShoes, setHasShoes,
  hasJersey, setHasJersey
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

            {/* Preparation Items */}
            <div className="space-y-2">
                <Label className="text-sm font-bold text-slate-600">준비물</Label>
                <div className="flex gap-2">
                    <Chip
                        label="실내 농구화"
                        variant="slate"
                        isActive={hasShoes}
                        showCheckIcon={false}
                        onClick={() => setHasShoes(!hasShoes)}
                    />
                    <Chip
                        label="흰색/검은색 상의"
                        variant="slate"
                        isActive={hasJersey}
                        showCheckIcon={false}
                        onClick={() => setHasJersey(!hasJersey)}
                    />
                </div>
            </div>

            {/* Level Slider */}
            <div className="space-y-3">
                <Label className="text-sm font-bold text-slate-600">권장 실력</Label>
                <SkillSlider value={level} onChange={setLevel} />
            </div>

            {/* Age */}
            <div className="space-y-2">
                <Label className="text-sm font-bold text-slate-600">권장 나이</Label>
                <AgeSelector 
                    selectedAges={selectedAges}
                    onSelect={handleAgeSelection}
                    onRangeUpdate={handleAgeRangeUpdate}
                />
            </div>
        </div>
    </section>
  );
}
