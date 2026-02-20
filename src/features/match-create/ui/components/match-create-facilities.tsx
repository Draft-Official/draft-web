import { useState, useRef } from 'react';

import { Input } from '@/shared/ui/shadcn/input';
import { Label } from '@/shared/ui/shadcn/label';
import { Button } from '@/shared/ui/shadcn/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogClose } from '@/shared/ui/shadcn/dialog';
import { Toggle } from '@/shared/ui/shadcn/toggle';
import { cn } from '@/shared/lib/utils';
import { COURT_SIZE_OPTIONS, CourtSizeValue } from '@/shared/config/match-constants';
import { X } from 'lucide-react';

interface MatchCreateFacilitiesProps {
  hasWater: boolean;
  setHasWater: (v: boolean) => void;
  hasAcHeat: boolean;
  setHasAcHeat: (v: boolean) => void;
  hasBall: boolean;
  setHasBall: (v: boolean) => void;
  parkingCost: string;
  setParkingCost: (v: string) => void;
  parkingDetail: string;
  setParkingDetail: (v: string) => void;
  hasShower: boolean;
  setHasShower: (v: boolean) => void;
  courtSize: CourtSizeValue | "";
  setCourtSize: (v: CourtSizeValue | "") => void;

  isExistingGym?: boolean;
}


export function MatchCreateFacilities({
  hasWater, setHasWater,
  hasAcHeat, setHasAcHeat,
  hasBall, setHasBall,
  parkingCost, setParkingCost,
  parkingDetail, setParkingDetail,
  hasShower, setHasShower,
  courtSize, setCourtSize,
  isExistingGym = false
}: MatchCreateFacilitiesProps) {
  // UI 상태 로컬화
  const [showParkingDialog, setShowParkingDialog] = useState(false);
  const [showCourtSizeDialog, setShowCourtSizeDialog] = useState(false);

  // Persistence Refs
  const lastParkingCost = useRef<string>("");
  const lastParkingDetail = useRef<string>("");
  const lastCourtSize = useRef<CourtSizeValue | "">("");

  // Helper to get labels
  const getCourtSizeLabel = () => COURT_SIZE_OPTIONS.find(o => o.value === courtSize)?.label;

  return (
    <>
        <div className="space-y-4">
            <div className="flex items-center gap-2">
                <Label className="text-sm font-bold text-slate-600">시설 정보</Label>
                {isExistingGym ? (
                    <span className="text-[11px] font-medium text-slate-500 bg-slate-100 px-2 py-0.5 rounded-full">
                        정보가 다르다면 수정해 주세요
                    </span>
                ) : (
                    <span className="text-[11px] font-bold text-primary bg-brand-weak px-2 py-0.5 rounded-full">
                        작성시 문의가 80% 감소해요!
                    </span>
                )}
            </div>
            <div className="flex flex-wrap gap-2">
                <Toggle
                    variant="outline"
                    pressed={hasBall}
                    onPressedChange={() => setHasBall(!hasBall)}
                    className="h-9 rounded-lg px-4 text-sm font-medium"
                >
                    🏀 농구공
                </Toggle>

                <Toggle
                    variant="outline"
                    pressed={hasWater}
                    onPressedChange={() => setHasWater(!hasWater)}
                    className="h-9 rounded-lg px-4 text-sm font-medium"
                >
                    정수기
                </Toggle>

                <Toggle
                    variant="outline"
                    pressed={hasAcHeat}
                    onPressedChange={() => setHasAcHeat(!hasAcHeat)}
                    className="h-9 rounded-lg px-4 text-sm font-medium"
                >
                    냉난방
                </Toggle>

                <Toggle
                    variant="outline"
                    pressed={hasShower}
                    onPressedChange={() => setHasShower(!hasShower)}
                    className="h-9 rounded-lg px-4 text-sm font-medium"
                >
                    샤워실
                </Toggle>

                <Toggle
                    variant="outline"
                    pressed={parkingCost !== ""}
                    onClick={() => {
                        if (parkingCost === "" && lastParkingCost.current !== "") {
                            setParkingCost(lastParkingCost.current);
                            setParkingDetail(lastParkingDetail.current);
                        }
                        setShowParkingDialog(true);
                    }}
                    className="h-9 rounded-lg px-4 text-sm font-medium"
                >
                    주차{parkingCost !== "" ? (parkingCost === "0" ? " (무료)" : ` ${Number(parkingCost).toLocaleString()}원/시간`) : ""}
                </Toggle>

                <Toggle
                    variant="outline"
                    pressed={courtSize !== ""}
                    onClick={() => {
                        if (courtSize === "" && lastCourtSize.current !== "") {
                            setCourtSize(lastCourtSize.current);
                        }
                        setShowCourtSizeDialog(true);
                    }}
                    className="h-9 rounded-lg px-4 text-sm font-medium"
                >
                    코트 크기{courtSize !== "" ? ` (${getCourtSizeLabel()})` : ""}
                </Toggle>
            </div>
        </div>

        {/* Dialog: Parking */}
      <Dialog open={showParkingDialog} onOpenChange={setShowParkingDialog}>
        <DialogContent className="w-[90%] max-w-[480px] rounded-2xl">
          <DialogHeader>
            <DialogTitle>주차 정보</DialogTitle>
          </DialogHeader>
          <DialogClose className="absolute right-6 top-6 opacity-70 hover:opacity-100 transition-opacity">
            <X className="h-5 w-5" />
            <span className="sr-only">Close</span>
          </DialogClose>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label className="text-sm font-medium text-slate-700">시간당 주차 요금</Label>
              <div className="relative">
                <Input
                  type="text"
                  inputMode="numeric"
                  value={parkingCost}
                  onChange={(e) => {
                    const value = e.target.value.replace(/[^0-9]/g, ''); // 숫자만 허용
                    setParkingCost(value);
                  }}
                  onKeyDown={(e) => {
                    if (e.key === '-' || e.key === 'e' || e.key === 'E') {
                      e.preventDefault();
                    }
                  }}
                  placeholder="0"
                  className="h-12 bg-white border-slate-200 pr-12 text-right"
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm">
                  {parkingCost === '0' ? '무료' : '원'}
                </span>
              </div>
              <p className="text-xs text-slate-500">💡 0원을 입력하면 무료로 표시됩니다.</p>
            </div>

            <div className="space-y-2">
                <Label className="text-sm font-medium text-slate-700">주차 상세 위치 (선택)</Label>
                <Input
                    value={parkingDetail}
                    onChange={(e) => setParkingDetail(e.target.value)}
                    placeholder="예: 지하 2층, 정문 주차장 등"
                    className="h-12 bg-white border-slate-200"
                />
            </div>

            <div className="flex gap-2">
                <Button
                    onClick={() => setShowParkingDialog(false)}
                    className="flex-[2] h-12 bg-primary hover:bg-primary/90 text-white font-bold rounded-xl"
                >
                    확인
                </Button>
                <Button
                    variant="outline"
                    onClick={() => {
                        // Remove/Clear Logic
                        lastParkingCost.current = parkingCost; // Save before clear
                        lastParkingDetail.current = parkingDetail;
                        setParkingCost("");
                        setParkingDetail("");
                        setShowParkingDialog(false);
                    }}
                    className="flex-1 h-12 border-slate-200 text-slate-600 font-bold rounded-xl hover:bg-slate-50"
                >
                    삭제
                </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Dialog: Court Size */}
      <Dialog open={showCourtSizeDialog} onOpenChange={setShowCourtSizeDialog}>
        <DialogContent className="w-[90%] max-w-[480px] rounded-2xl">
          <DialogHeader>
            <DialogTitle>코트 크기</DialogTitle>
          </DialogHeader>
          <DialogClose className="absolute right-6 top-6 opacity-70 hover:opacity-100 transition-opacity">
            <X className="h-5 w-5" />
            <span className="sr-only">Close</span>
          </DialogClose>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <div className="space-y-2">
                {COURT_SIZE_OPTIONS.map(opt => (
                  <button
                    type="button"
                    key={opt.value}
                    onClick={() => setCourtSize(opt.value)}
                    className={cn(
                      "w-full p-4 rounded-xl text-left border transition-all",
                      courtSize === opt.value
                        ? "bg-brand-weak border-primary ring-1 ring-primary"
                        : "bg-white border-slate-200 hover:bg-slate-50"
                    )}
                  >
                    <div className="font-medium text-slate-900">{opt.label}</div>
                    <div className="text-xs text-slate-500 mt-0.5">{opt.description}</div>
                  </button>
                ))}
              </div>
            </div>
             <div className="flex gap-2">
                <Button
                    onClick={() => setShowCourtSizeDialog(false)}
                    className="flex-[2] h-12 bg-primary hover:bg-primary/90 text-white font-bold rounded-xl"
                >
                    확인
                </Button>
                <Button
                    variant="outline"
                    onClick={() => {
                         // Remove/Clear Logic
                        lastCourtSize.current = courtSize;
                        setCourtSize("");
                        setShowCourtSizeDialog(false);
                    }}
                    className="flex-1 h-12 border-slate-200 text-slate-600 font-bold rounded-xl hover:bg-slate-50"
                >
                    삭제
                </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
