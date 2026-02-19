'use client';

import { useFormContext } from 'react-hook-form';
import { Input } from '@/shared/ui/shadcn/input';
import { Label } from '@/shared/ui/shadcn/label';
import { Button } from '@/shared/ui/shadcn/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/shared/ui/shadcn/select';
import { Textarea } from '@/shared/ui/shadcn/textarea';
import { toast } from "sonner";
import { X, FileText, MessageCircle } from 'lucide-react';

interface MatchCreateTeamInfoProps {
  selectedTeam: string;
  setSelectedTeam: (v: string) => void;
  isDirectInput: boolean;
  setIsDirectInput: (v: boolean) => void;
  directTeamName: string;
  setDirectTeamName: (v: string) => void;
}

// Mock Data for Auto-fill
const MOCK_TEAMS: Record<string, {
    bankName: string;
    accountNumber: string;
    kakaoLink: string;
    description: string;
}> = {
    "team_slamdunk": {
        bankName: "카카오뱅크",
        accountNumber: "3333-01-2345678",
        kakaoLink: "https://open.kakao.com/o/slamdunk",
        description: "즐겁게 농구하실 분 환영합니다! 매너 게임 부탁드립니다."
    },
    "team_jordan": {
        bankName: "토스뱅크",
        accountNumber: "1000-00-100000",
        kakaoLink: "https://open.kakao.com/o/jordan23",
        description: "빡겜 지향합니다. 늦으시면 안됩니다."
    }
};

export function MatchCreateTeamInfo({
  selectedTeam, setSelectedTeam,
  isDirectInput, setIsDirectInput,
  directTeamName, setDirectTeamName
}: MatchCreateTeamInfoProps) {
  const { register, setValue } = useFormContext();

  return (
    <section className="bg-white p-5 rounded-2xl shadow-sm border border-slate-100 space-y-6 mb-8">
        <div className="flex items-center justify-between">
            <h2 className="font-bold text-slate-900 flex items-center gap-2">
                <FileText className="w-5 h-5 text-slate-400" />
                운영 정보
            </h2>
        </div>

        {/* Team Selection */}
        <div className="space-y-2">
            <Label className="text-sm font-bold text-slate-600">팀 선택</Label>
            {!isDirectInput ? (
                <Select
                    value={selectedTeam}
                    onValueChange={(value) => {
                        if (value === "direct_input") {
                            setIsDirectInput(true);
                            setSelectedTeam("");
                        } else {
                            setSelectedTeam(value);
                            
                            // Auto-fill logic
                            const teamData = MOCK_TEAMS[value];
                            if (teamData) {
                                setValue('bankName', teamData.bankName);
                                setValue('accountNumber', teamData.accountNumber);
                                setValue('kakaoLink', teamData.kakaoLink);
                                setValue('description', teamData.description);
                                toast.success("팀 정보를 불러왔습니다.");
                            }
                        }
                    }}
                >
                    <SelectTrigger className="h-12 bg-white border-slate-200">
                        <SelectValue placeholder="팀을 선택해주세요" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="team_slamdunk">🏀 팀 슬램덩크</SelectItem>
                        <SelectItem value="team_jordan">⛹️ Team Jordan</SelectItem>
                        <SelectItem value="direct_input">✏️ 직접 입력</SelectItem>
                    </SelectContent>
                </Select>
            ) : (
                <div className="flex gap-2">
                    <Input
                        value={directTeamName}
                        onChange={(e) => setDirectTeamName(e.target.value)}
                        placeholder="팀 이름을 입력해주세요"
                        className="h-12 bg-white border-slate-200"
                    />
                    <Button
                        type="button"
                        onClick={() => {
                            setIsDirectInput(false);
                            setDirectTeamName("");
                        }}
                        variant="outline"
                        className="h-12 px-3"
                    >
                        <X className="w-4 h-4" />
                    </Button>
                </div>
            )}
            <p className="text-xs text-slate-500 mt-1">
                💡 팀을 생성하면 다음부터 불러오기로 3초 만에 개설할 수 있어요!
            </p>
        </div>

        <div className="space-y-4">
                <div className="space-y-2">
                <Label className="text-sm font-bold text-slate-600">계좌 정보</Label>
                <div className="flex gap-2">
                    <Input
                        {...register('bankName')}
                        placeholder="은행명"
                        className="w-[100px] h-11 bg-white border-slate-200"
                    />
                    <Input
                        {...register('accountNumber')}
                        placeholder="계좌번호 (- 없이)"
                        className="flex-1 h-11 bg-white border-slate-200"
                    />
                </div>
            </div>

            <div className="space-y-2">
                <Label className="text-sm font-bold text-slate-600 flex justify-between">
                    문의하기 (연락처)
                </Label>
                <div className="relative">
                    <MessageCircle className="absolute left-3 top-3.5 h-4 w-4 text-slate-400" />
                    <Input
                        {...register('kakaoLink')}
                        placeholder="오픈채팅 또는 연락처 (프로필 기본값)"
                        className="pl-9 h-11 bg-white border-slate-200 text-sm"
                    />
                </div>
                <p className="text-xs text-slate-400 mt-1">
                    * 승인된 게스트에게만 공개됩니다.
                </p>
            </div>

            <div className="space-y-2">
                <Label className="text-sm font-bold text-slate-600">공지 내용</Label>
                <Textarea
                    {...register('description')}
                    placeholder="기타 규칙이나 알림이 있다면 자유롭게 적어주세요."
                    className="min-h-[120px] bg-white border-slate-200 resize-none text-base"
                />
            </div>
        </div>
    </section>
  );
}
