'use client';

import { Check } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { cn } from '@/shared/lib/utils';

interface MatchCreateFacilitiesProps {
  hasWater: boolean;
  setHasWater: (v: boolean) => void;
  hasAcHeat: boolean;
  setHasAcHeat: (v: boolean) => void;
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
  parkingCost, setParkingCost,
  parkingDetail, setParkingDetail,
  showerOption, setShowerOption,
  courtSize, setCourtSize,
  showParkingDialog, setShowParkingDialog,
  showShowerDialog, setShowShowerDialog,
  showCourtSizeDialog, setShowCourtSizeDialog
}: MatchCreateFacilitiesProps) {
  return (
    <>
        <div className="space-y-4 pt-4 border-t border-slate-100">
            <Label className="text-sm font-bold text-slate-600">시설 정보</Label>
            <div className="flex flex-wrap gap-2">
                {/* Simple Toggle: Water Purifier */}
                <button
                    type="button"
                    onClick={() => setHasWater(!hasWater)}
                    className={cn(
                        "px-4 py-2 rounded-full text-sm font-medium border transition-all flex items-center gap-1.5",
                        hasWater
                            ? "bg-[#FF6600] text-white border-[#FF6600]"
                            : "bg-white text-slate-600 border-slate-300 hover:border-slate-400"
                    )}
                >
                    {hasWater && <Check className="w-3.5 h-3.5" />}
                    정수기
                </button>

                {/* Simple Toggle: AC/Heating */}
                <button
                    type="button"
                    onClick={() => setHasAcHeat(!hasAcHeat)}
                    className={cn(
                        "px-4 py-2 rounded-full text-sm font-medium border transition-all flex items-center gap-1.5",
                        hasAcHeat
                            ? "bg-[#FF6600] text-white border-[#FF6600]"
                            : "bg-white text-slate-600 border-slate-300 hover:border-slate-400"
                    )}
                >
                    {hasAcHeat && <Check className="w-3.5 h-3.5" />}
                    냉난방
                </button>

                {/* Complex: Parking */}
                <button
                    type="button"
                    onClick={() => {
                        if (parkingCost !== "") {
                            setParkingCost("");
                            setParkingDetail("");
                        } else {
                            setShowParkingDialog(true);
                        }
                    }}
                    className={cn(
                        "px-4 py-2 rounded-full text-sm font-medium border transition-all flex items-center gap-1.5",
                        parkingCost !== ""
                            ? "bg-[#FF6600] text-white border-[#FF6600]"
                            : "bg-white text-slate-600 border-slate-300 hover:border-slate-400"
                    )}
                >
                    {parkingCost !== "" && <Check className="w-3.5 h-3.5" />}
                    주차
                    {parkingCost === "0" && ": 0원 (무료)"}
                    {parkingCost !== "" && parkingCost !== "0" && `: ${Number(parkingCost).toLocaleString()}원/시간`}
                </button>

                {/* Complex: Shower */}
                <button
                    type="button"
                    onClick={() => setShowShowerDialog(true)}
                    className={cn(
                        "px-4 py-2 rounded-full text-sm font-medium border transition-all flex items-center gap-1.5",
                        showerOption !== "unavailable"
                            ? "bg-[#FF6600] text-white border-[#FF6600]"
                            : "bg-white text-slate-600 border-slate-300 hover:border-slate-400"
                    )}
                >
                    {showerOption !== "unavailable" && <Check className="w-3.5 h-3.5" />}
                    샤워실
                    {showerOption === "free" && ": 무료"}
                    {showerOption === "paid" && ": 유료"}
                </button>

                {/* Complex: Court Size */}
                <button
                    type="button"
                    onClick={() => setShowCourtSizeDialog(true)}
                    className={cn(
                        "px-4 py-2 rounded-full text-sm font-medium border transition-all flex items-center gap-1.5",
                        courtSize !== ""
                            ? "bg-[#FF6600] text-white border-[#FF6600]"
                            : "bg-white text-slate-600 border-slate-300 hover:border-slate-400"
                    )}
                >
                    {courtSize !== "" && <Check className="w-3.5 h-3.5" />}
                    코트 크기
                    {courtSize === "regular" && ": 정규 사이즈"}
                    {courtSize === "short" && ": 세로 짧음"}
                    {courtSize === "narrow" && ": 가로 좁음"}
                </button>
            </div>
        </div>

        {/* Dialog: Parking */}
      <Dialog open={showParkingDialog} onOpenChange={setShowParkingDialog}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>주차 정보</DialogTitle>
          </DialogHeader>
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
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label className="text-sm font-medium text-slate-700">샤워실 이용</Label>
              <div className="flex gap-2">
                {[
                  { v: 'free', l: '무료' },
                  { v: 'paid', l: '유료' }
                ].map(opt => (
                  <button
                    type="button"
                    key={opt.v}
                    onClick={() => setShowerOption(opt.v)}
                    className={cn(
                      "flex-1 py-3 rounded-xl text-sm font-medium border transition-all",
                      showerOption === opt.v
                        ? "bg-[#FF6600] text-white border-[#FF6600]"
                        : "bg-white text-slate-600 border-slate-200 hover:bg-slate-50"
                    )}
                  >
                    {opt.l}
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
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label className="text-sm font-medium text-slate-700">코트 사이즈</Label>
              <div className="space-y-2">
                {[
                  { v: 'regular', l: '정규 사이즈', desc: '표준 코트입니다' },
                  { v: 'short', l: '세로가 좀 짧아요', desc: '정규보다 짧습니다' },
                  { v: 'narrow', l: '가로가 좀 좁아요', desc: '정규보다 좁습니다' }
                ].map(opt => (
                  <button
                    type="button"
                    key={opt.v}
                    onClick={() => setCourtSize(opt.v)}
                    className={cn(
                      "w-full p-4 rounded-xl text-left border transition-all",
                      courtSize === opt.v
                        ? "bg-orange-50 border-[#FF6600] ring-1 ring-[#FF6600]"
                        : "bg-white border-slate-200 hover:bg-slate-50"
                    )}
                  >
                    <div className="font-medium text-slate-900">{opt.l}</div>
                    <div className="text-xs text-slate-500 mt-0.5">{opt.desc}</div>
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
