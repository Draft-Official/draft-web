'use client';

import { useEffect } from 'react';
import { useFormContext } from 'react-hook-form';
import { Input } from '@/shared/ui/shadcn/input';
import { Label } from '@/shared/ui/shadcn/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/shared/ui/shadcn/select';
import { Switch } from '@/shared/ui/shadcn/switch';
import { Textarea } from '@/shared/ui/shadcn/textarea';
import { BankCombobox } from '@/shared/ui/composite/bank-combobox';
import { FileText, MessageCircle, Phone, UserPlus } from 'lucide-react';
import { toast } from 'sonner';
import type { AccountInfo, OperationInfo } from '@/shared/types/jsonb.types';
import type { MatchCreateTeamOptionDTO, MatchCreateUserDTO } from '@/features/match-create/model/types';

// Helper to safely cast JSONB to specific type
const getAccountInfo = (info: MatchCreateUserDTO['accountInfo'] | MatchCreateTeamOptionDTO['accountInfo']): Partial<AccountInfo> => info ?? {};
const getOperationInfo = (info: MatchCreateUserDTO['operationInfo'] | MatchCreateTeamOptionDTO['operationInfo']): Partial<OperationInfo> => info ?? {};

export interface OperationsData {
  selectedHost: 'me' | string; // 'me' or team_id
  accountInfo: {
    bank: string;
    number: string;
    holder: string;
  };
  contactInfo: {
    type: 'PHONE' | 'KAKAO_OPEN_CHAT';
    content: string;
  };
  hostNotice: string;
  saveAsDefault: boolean;
}

interface MatchCreateOperationsProps {
  user: MatchCreateUserDTO | null;
  teams: MatchCreateTeamOptionDTO[];
  onDataChange?: (data: OperationsData) => void;
  // initialData removed as we rely on form context now
}

export function MatchCreateOperations({
  user,
  teams,
  onDataChange,
}: MatchCreateOperationsProps) {
  const { register, watch, setValue } = useFormContext();
  
  // Watch form values for UI updates and data sync
  // Note: We use register to bind inputs, but we watch them for the onDataChange effect
  const selectedHost = watch('operations.selectedHost') || '';
  const bankName = watch('bankName') || '';
  const accountNumber = watch('accountNumber') || '';
  const accountHolder = watch('accountHolder') || '';
  const description = watch('description') || '';
  const contactType = watch('operations.contactType') || 'PHONE';
  const kakaoLink = watch('kakaoLink') || '';
  const phoneNumber = watch('phoneNumber') || '';
  const saveAsDefault = watch('operations.saveAsDefault') || false;

  // Initial setup for defaults - run once when user/teams load if needed, or rely on manual selection
  // Refactored: No auto-selection of 'me'. User must select.

  // Check if user has existing info
  const userAccount = user ? getAccountInfo(user.accountInfo) : null;
  const userOps = user ? getOperationInfo(user.operationInfo) : null;

  const hasExistingInfo = Boolean(
    userAccount?.bank &&
    userAccount?.number &&
    userAccount?.holder
  ) || Boolean(
    userOps?.url ||
    userOps?.notice
  );

  // Handle host selection change
  const handleHostChange = (value: 'me' | string) => {
    setValue('operations.selectedHost', value);

    if (value === 'me' && user) {
      // Reset to user defaults
      const userAccount = getAccountInfo(user.accountInfo);
      const userOps = getOperationInfo(user.operationInfo);

      const bank = userAccount.bank || '';
      const number = userAccount.number || '';
      const holder = userAccount.holder || '';
      const notice = userOps.notice || '';
      const contact = userOps.type || 'PHONE';
      const contactVal = contact === 'PHONE'
        ? user.phone || ''
        : userOps.url || '';

      setValue('bankName', bank);
      setValue('accountNumber', number);
      setValue('accountHolder', holder);
      setValue('description', notice);
      // Contact type logic
      setValue('operations.contactType', contact);
      
      if (contact === 'PHONE') {
        setValue('phoneNumber', contactVal);
      } else {
        setValue('kakaoLink', contactVal);
      }

      if (hasExistingInfo) {
        toast.success('개인 기본값을 불러왔습니다.');
      }
    } else {
      // Find team and set team defaults
      const team = teams.find((t) => t.id === value);
      if (team) {
        const teamAccount = getAccountInfo(team.accountInfo);
        const teamOps = getOperationInfo(team.operationInfo);

        const bank = teamAccount.bank || '';
        const number = teamAccount.number || '';
        const holder = teamAccount.holder || '';
        const notice = teamOps.notice || '';

        setValue('bankName', bank);
        setValue('accountNumber', number);
        setValue('accountHolder', holder);
        setValue('description', notice);

        // Contact info from user (always defaults to user's contact initially)
        if (user) {
          const userOps = getOperationInfo(user.operationInfo);
          const contact = userOps.type || 'PHONE';
          setValue('operations.contactType', contact);
          
          if (contact === 'PHONE') {
            setValue('phoneNumber', user.phone || '');
          } else {
            setValue('kakaoLink', userOps.url || '');
          }
        }

        toast.success(`${team.name} 정보를 불러왔습니다.`);
      }
    }
  };

  // Sync data to parent via onDataChange
  useEffect(() => {
    if (!onDataChange) return;

    onDataChange({
      selectedHost,
      accountInfo: {
        bank: bankName,
        number: accountNumber,
        holder: accountHolder,
      },
      contactInfo: {
        type: contactType,
        content: contactType === 'PHONE' ? phoneNumber : kakaoLink,
      },
      hostNotice: description,
      saveAsDefault,
    });
  }, [
    selectedHost,
    bankName,
    accountNumber,
    accountHolder,
    contactType,
    phoneNumber,
    kakaoLink,
    description,
    saveAsDefault,
    onDataChange,
  ]);

  return (
    <section className="bg-white px-5 py-6 space-y-6 rounded-xl border border-slate-200">
      <div className="flex items-center justify-between">
        <h2 className="font-bold text-slate-900 flex items-center gap-2">
          <FileText className="w-5 h-5 text-slate-400" />
          운영 정보
        </h2>
        {hasExistingInfo && (
          <span className="text-xs text-green-600 bg-green-50 px-2 py-1 rounded-full">
            ✓ 저장된 정보 있음
          </span>
        )}
      </div>

      {/* First-time user notice */}
      {!hasExistingInfo && (
        <div className="bg-blue-50 border border-blue-100 rounded-xl p-4">
          <div className="flex items-start gap-3">
            <UserPlus className="w-5 h-5 text-blue-500 mt-0.5 flex-shrink-0" />
            <div>
              <p className="text-sm font-medium text-blue-800">처음이시네요! 👋</p>
              <p className="text-xs text-blue-600 mt-1">
                팀을 만들면 계좌·연락처가 자동 입력되고, 게스트 신청도 한눈에 관리할 수 있어요.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Host Selection */}
      <div className="space-y-2">
        <div className="flex items-center gap-1">
          <Label className="text-sm font-bold text-slate-600">주최 정보</Label>
          <span className="text-red-500 text-xs">*</span>
        </div>
        <Select 
          value={selectedHost} 
          onValueChange={handleHostChange}
        >
          <SelectTrigger className="h-12 bg-white border-slate-200">
            <SelectValue placeholder="주최자를 선택해주세요" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="me">🙋‍♂️ 내 프로필 (개인)</SelectItem>
            {teams.map((team) => (
              <SelectItem key={team.id} value={team.id}>
                🏀 {team.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <p className="text-xs text-slate-500 mt-1">
          💡 팀을 선택하면 팀의 기본 계좌·공지가 자동으로 채워집니다.
        </p>

        {/* Team Name for Individual Host */}
        {selectedHost === 'me' && (
          <div className="mt-3 space-y-2">
            <div className="flex items-center gap-1">
              <Label className="text-sm font-bold text-slate-600">팀 이름</Label>
              <span className="text-red-500 text-xs">*</span>
            </div>
            <Input
              {...register('manualTeamName')}
              placeholder="예: 강남픽업, 수요농구회"
              className="h-11 bg-white border-slate-200"
            />
            <p className="text-xs text-slate-500">
              💡 팀을 만들면 매치 정보가 자동 저장되고, 신청자 관리도 한 곳에서 할 수 있어요
            </p>
          </div>
        )}
      </div>

      <div className="space-y-4">
        {/* Account Info - Reordered: 예금주 → 은행명 → 계좌번호 */}
        <div className="space-y-2">
          <div className="flex items-center gap-1">
            <Label className="text-sm font-bold text-slate-600">계좌 정보</Label>
            <span className="text-red-500 text-xs">*</span>
          </div>
          <div className="flex gap-2">
            <Input
              value={accountHolder}
              placeholder="예금주"
              className="w-[90px] h-11 bg-white border-slate-200"
              onChange={(e) => {
                // 한글 자음/모음/완성형 허용 (2-10자)
                const value = e.target.value.replace(/[^ㄱ-ㅎㅏ-ㅣ가-힣]/g, '').slice(0, 10);
                setValue('accountHolder', value);
              }}
            />
            <BankCombobox
              value={bankName}
              onValueChange={(value) => setValue('bankName', value)}
              className="w-[100px] h-11 bg-white border-slate-200"
            />
            <Input
              value={accountNumber}
              placeholder="계좌번호 (숫자만)"
              className="flex-1 h-11 bg-white border-slate-200"
              inputMode="numeric"
              onChange={(e) => {
                // 숫자만 허용 (10-16자리)
                const value = e.target.value.replace(/[^0-9]/g, '').slice(0, 16);
                setValue('accountNumber', value);
              }}
            />
          </div>
          <p className="text-xs text-slate-400">
            예금주: 한글 2-10자 / 계좌번호: 숫자만 10-16자리
          </p>
        </div>

        {/* Contact Info - Toggle style */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1">
              <Label className="text-sm font-bold text-slate-600">
                문의연락처
              </Label>
              <span className="text-red-500 text-xs">*</span>
            </div>
            {/* Toggle: 전화번호 / 오픈채팅 */}
            <div className="flex items-center gap-2">
              <span className={`text-xs font-bold ${contactType === 'PHONE' ? 'text-primary' : 'text-slate-400'}`}>
                <Phone className="w-3 h-3 inline mr-0.5" />
                전화
              </span>
              <Switch
                checked={contactType === 'KAKAO_OPEN_CHAT'}
                onCheckedChange={(checked) => {
                  setValue('operations.contactType', checked ? 'KAKAO_OPEN_CHAT' : 'PHONE');
                  // Value persistence: Do not reset content
                }}
                className="data-[state=checked]:bg-primary data-[state=unchecked]:bg-slate-200"
              />
              <span className={`text-xs font-bold ${contactType === 'KAKAO_OPEN_CHAT' ? 'text-primary' : 'text-slate-400'}`}>
                <MessageCircle className="w-3 h-3 inline mr-0.5" />
                오픈채팅
              </span>
            </div>
          </div>

          <div className="relative">
            {contactType === 'PHONE' ? (
              <Phone className="absolute left-3 top-3.5 h-4 w-4 text-slate-400" />
            ) : (
              <MessageCircle className="absolute left-3 top-3.5 h-4 w-4 text-slate-400" />
            )}
            {contactType === 'PHONE' ? (
              <Input
                {...register('phoneNumber')}
                placeholder="010-1234-5678"
                inputMode="tel"
                className="pl-9 h-11 bg-white border-slate-200 text-sm focus-visible:ring-1 focus-visible:ring-primary focus-visible:border-primary"
                onChange={(e) => {
                  // 전화번호 자동 포맷팅 (숫자만 추출 후 하이픈 추가)
                  const digits = e.target.value.replace(/[^0-9]/g, '').slice(0, 11);
                  let formatted = digits;
                  if (digits.length > 3 && digits.length <= 7) {
                    formatted = `${digits.slice(0, 3)}-${digits.slice(3)}`;
                  } else if (digits.length > 7) {
                    formatted = `${digits.slice(0, 3)}-${digits.slice(3, 7)}-${digits.slice(7)}`;
                  }
                  setValue('phoneNumber', formatted);
                }}
              />
            ) : (
              <Input
                {...register('kakaoLink')}
                placeholder="오픈채팅 링크"
                className="pl-9 h-11 bg-white border-slate-200 text-sm focus-visible:ring-1 focus-visible:ring-primary focus-visible:border-primary"
              />
            )}
          </div>
          <p className="text-xs text-slate-400">
            {contactType === 'PHONE' ? '* 010-XXXX-XXXX 형식으로 입력해주세요' : '* 승인된 게스트에게만 공개됩니다'}
          </p>
        </div>

        {/* Host Notice */}
        <div className="space-y-2">
          <Label className="text-sm font-bold text-slate-600">
            공지 내용 <span className="text-slate-400 font-normal">(선택)</span>
          </Label>
          <Textarea
            {...register('description')}
            placeholder="기타 규칙이나 알림이 있다면 자유롭게 적어주세요."
            className="min-h-[100px] bg-white border-slate-200 resize-none text-base"
          />
        </div>
      </div>

      {/* Single Save Checkbox at Bottom */}
      <div className="pt-4 border-t border-slate-100">
        <label className="flex items-center gap-3 cursor-pointer p-3 bg-slate-50 rounded-xl hover:bg-slate-100 transition-colors">
          <input
            type="checkbox"
            {...register('operations.saveAsDefault')}
            className="w-5 h-5 text-draft-500 border-gray-300 rounded focus:ring-draft-500"
          />
          <span className="text-sm text-slate-700">
            위 정보들을 내 기본정보로 저장하시겠습니까?
          </span>
        </label>
      </div>
    </section>
  );
}
