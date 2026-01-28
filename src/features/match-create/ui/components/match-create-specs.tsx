import { Label } from '@/shared/ui/base/label';
import { Chip } from '@/shared/ui/base/chip';
import { Settings } from 'lucide-react';
import {
  MATCH_FORMAT_OPTIONS,
  GENDER_OPTIONS,
  GenderValue,
  MatchFormatValue
} from '@/shared/config/constants';
import { AgeSelector } from './age-selector';
import { SkillRangeSlider } from '@/shared/ui/base/skill-range-slider';

interface MatchCreateSpecsProps {
  matchFormat: MatchFormatValue;
  setMatchFormat: (v: MatchFormatValue) => void;
  gender: GenderValue;
  setGender: (v: GenderValue) => void;
  levelMin: number;
  levelMax: number;
  onLevelChange: (min: number, max: number) => void;
  selectedAges: string[];
  handleAgeSelection: (age: string) => void;
  handleAgeRangeUpdate: (ages: string[]) => void;
  hasShoes: boolean;
  setHasShoes: (v: boolean) => void;
  hasJersey: boolean;
  setHasJersey: (v: boolean) => void;
}

export function MatchCreateSpecs({
  matchFormat, setMatchFormat,
  gender, setGender,
  levelMin, levelMax, onLevelChange,
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
            {/* Match Format */}
            <div className="space-y-2">
                <Label className="text-sm font-bold text-slate-600">매치 타입</Label>
                <div className="flex gap-2">
                    {MATCH_FORMAT_OPTIONS.map((type) => (
                        <Chip
                            key={type.value}
                            label={type.label}
                            variant="navy"
                            isActive={matchFormat === type.value}
                            showCheckIcon={false}
                            onClick={() => setMatchFormat(type.value)}
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
                            variant="navy"
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
                        variant="navy"
                        isActive={hasShoes}
                        showCheckIcon={false}
                        onClick={() => setHasShoes(!hasShoes)}
                    />
                    <Chip
                        label="흰색/검은색 상의"
                        variant="navy"
                        isActive={hasJersey}
                        showCheckIcon={false}
                        onClick={() => setHasJersey(!hasJersey)}
                    />
                </div>
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

            {/* Level Range Slider */}
            <div className="space-y-3">
                <Label className="text-sm font-bold text-slate-600">권장 실력</Label>
                <SkillRangeSlider minValue={levelMin} maxValue={levelMax} onChange={onLevelChange} />
            </div>
        </div>
    </section>
  );
}
