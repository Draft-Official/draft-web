'use client';

import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogClose } from '@/components/ui/dialog';
import { Chip } from '@/components/ui/chip';
import { cn } from '@/shared/lib/utils';
import { SHOWER_OPTIONS, COURT_SIZE_OPTIONS } from '@/features/match/create/config/constants';
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
  showerOption: string;
  setShowerOption: (v: string) => void;
  courtSize: string;
  setCourtSize: (v: string) => void;

  showParkingDialog: boolean;
  setShowParkingDialog: (v: boolean) => void;
  showShowerDialog: boolean;
  setShowShowerDialog: (v: boolean) => void;
  showCourtSizeDialog: boolean;
  setShowCourtSizeDialog: (v: boolean) => void;
}


export function MatchCreateFacilities({
  hasWater, setHasWater,
  hasAcHeat, setHasAcHeat,
  hasBall, setHasBall,
  parkingCost, setParkingCost,
  parkingDetail, setParkingDetail,
  showerOption, setShowerOption,
  courtSize, setCourtSize,
  showParkingDialog, setShowParkingDialog,
  showShowerDialog, setShowShowerDialog,
  showCourtSizeDialog, setShowCourtSizeDialog
}: MatchCreateFacilitiesProps) {

    // Helper to get labels
    const getShowerLabel = () => SHOWER_OPTIONS.find(o => o.value === showerOption)?.label;
    const getCourtSizeLabel = () => COURT_SIZE_OPTIONS.find(o => o.value === courtSize)?.label;

  return (
    <>
        <div className="space-y-4">
            <div className="flex items-center gap-2">
                <Label className="text-sm font-bold text-slate-600">시설 정보</Label>
                <span className="text-[11px] font-bold text-[#FF6600] bg-orange-50 px-2 py-0.5 rounded-full">작성시 문의가 80% 감소해요!</span>
            </div>
            <div className="flex flex-wrap gap-2">
                <Chip
                    variant="orange"
                    label="🏀 농구공"
                    isActive={hasBall}
                    checkIconPosition="right"
                    onClick={() => setHasBall(!hasBall)}
                />

                <Chip
                    variant="orange"
                    label="정수기"
                    isActive={hasWater}
                    checkIconPosition="right"
                    onClick={() => setHasWater(!hasWater)}
                />

                <Chip
                    variant="orange"
                    label="냉난방"
                    isActive={hasAcHeat}
                    checkIconPosition="right"
                    onClick={() => setHasAcHeat(!hasAcHeat)}
                />

                <Chip
                    variant="orange"
                    label="주차"
                    isActive={parkingCost !== ""}
                    checkIconPosition="right"
                    valueLabel={parkingCost === "0" ? "0원 (무료)" : (parkingCost ? `${Number(parkingCost).toLocaleString()}원/시간` : undefined)}
                    onClick={() => {
                        if (parkingCost !== "") {
                            setParkingCost("");
                            setParkingDetail("");
                        } else {
                            setShowParkingDialog(true);
                        }
                    }}
                />

                <Chip
                    variant="orange"
                    label="샤워실"
                    isActive={showerOption !== "unavailable"}
                    checkIconPosition="right"
                    valueLabel={getShowerLabel()}
                    onClick={() => {
                        if (showerOption !== "unavailable") {
                            setShowerOption("unavailable");
                        } else {
                            setShowShowerDialog(true);
                        }
                    }}
                />

                <Chip
                    variant="orange"
                    label="코트 크기"
                    isActive={courtSize !== ""}
                    checkIconPosition="right"
                    valueLabel={getCourtSizeLabel()}
                    onClick={() => {
                        if (courtSize !== "") {
                            setCourtSize("");
                        } else {
                            setShowCourtSizeDialog(true);
                        }
                    }}
                />
            </div>
        </div>

        {/* Dialog: Parking */}
      <Dialog open={showParkingDialog} onOpenChange={setShowParkingDialog}>
        <DialogContent className="sm:max-w-[425px]">
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
                  type="number"
                  value={parkingCost}
                  onChange={(e) => setParkingCost(e.target.value)}
                  placeholder="0"
                  className="h-12 bg-white border-slate-200 pr-12 text-right"
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm">원</span>
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

            <Button
              onClick={() => setShowParkingDialog(false)}
              className="w-full h-12 bg-[#FF6600] hover:bg-[#FF6600]/90 text-white font-bold rounded-xl"
            >
              확인
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Dialog: Shower */}
      <Dialog open={showShowerDialog} onOpenChange={setShowShowerDialog}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>샤워실 정보</DialogTitle>
          </DialogHeader>
          <DialogClose className="absolute right-6 top-6 opacity-70 hover:opacity-100 transition-opacity">
            <X className="h-5 w-5" />
            <span className="sr-only">Close</span>
          </DialogClose>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <div className="flex gap-2">
                {SHOWER_OPTIONS.map(opt => (
                  <button
                    type="button"
                    key={opt.value}
                    onClick={() => setShowerOption(opt.value)}
                    className={cn(
                      "flex-1 py-3 rounded-xl text-sm font-medium border transition-all",
                      showerOption === opt.value
                        ? "bg-[#FF6600] text-white border-[#FF6600]"
                        : "bg-white text-slate-600 border-slate-200 hover:bg-slate-50"
                    )}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>
            <Button
              onClick={() => setShowShowerDialog(false)}
              className="w-full h-12 bg-[#FF6600] hover:bg-[#FF6600]/90 text-white font-bold rounded-xl"
            >
              확인
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Dialog: Court Size */}
      <Dialog open={showCourtSizeDialog} onOpenChange={setShowCourtSizeDialog}>
        <DialogContent className="sm:max-w-[425px]">
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
                        ? "bg-orange-50 border-[#FF6600] ring-1 ring-[#FF6600]"
                        : "bg-white border-slate-200 hover:bg-slate-50"
                    )}
                  >
                    <div className="font-medium text-slate-900">{opt.label}</div>
                    <div className="text-xs text-slate-500 mt-0.5">{opt.description}</div>
                  </button>
                ))}
              </div>
            </div>
            <Button
              onClick={() => setShowCourtSizeDialog(false)}
              className="w-full h-12 bg-[#FF6600] hover:bg-[#FF6600]/90 text-white font-bold rounded-xl"
            >
              확인
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
