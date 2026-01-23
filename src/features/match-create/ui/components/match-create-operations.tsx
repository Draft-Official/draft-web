'use client';

import { useEffect } from 'react';
import { useFormContext } from 'react-hook-form';
import { Team, User } from '@/shared/types/database.types';
import { Input } from '@/shared/ui/base/input';
import { Label } from '@/shared/ui/base/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/shared/ui/base/select';
import { Switch } from '@/shared/ui/base/switch';
import { Textarea } from '@/shared/ui/base/textarea';
import { FileText, MessageCircle, Phone, UserPlus } from 'lucide-react';
import { toast } from 'sonner';

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
  user: User | null;
  teams: Team[];
  onDataChange: (data: OperationsData) => void;
  // initialData removed as we rely on form context now
}

export function MatchCreateOperations({
  user,
  teams,
  onDataChange,
}: MatchCreateOperationsProps) {
  const { register, watch, setValue, getValues } = useFormContext();
  
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

  // Check if user has existing info (계좌정보, 오픈채팅, 공지 중 하나라도 있으면 true)
  const hasExistingInfo = Boolean(
    user?.default_account_bank &&
    user?.default_account_number &&
    user?.default_account_holder
  ) || Boolean(
    user?.kakao_open_chat_url ||
    user?.default_host_notice
  );

  // Handle host selection change
  const handleHostChange = (value: 'me' | string) => {
    setValue('operations.selectedHost', value);

    if (value === 'me' && user) {
      // Reset to user defaults
      const bank = user.default_account_bank || '';
      const number = user.default_account_number || '';
      const holder = user.default_account_holder || '';
      const notice = user.default_host_notice || '';
      const contact = user.default_contact_type || 'PHONE';
      const contactVal = contact === 'PHONE'
        ? user.phone || ''
        : user.kakao_open_chat_url || '';

      setValue('bankName', bank);
      setValue('accountNumber', number);
      setValue('accountHolder', holder);
      setValue('description', notice);
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
        const bank = team.account_bank || '';
        const number = team.account_number || '';
        const holder = team.account_holder || '';
        const notice = team.host_notice || '';

        setValue('bankName', bank);
        setValue('accountNumber', number);
        setValue('accountHolder', holder);
        setValue('description', notice);

        // Contact info from user (always defaults to user's contact initially)
        if (user) {
          const contact = user.default_contact_type || 'PHONE';
          setValue('operations.contactType', contact);
          
          if (contact === 'PHONE') {
            setValue('phoneNumber', user.phone || '');
          } else {
            setValue('kakaoLink', user.kakao_open_chat_url || '');
          }
        }

        toast.success(`${team.name} 정보를 불러왔습니다.`);
      }
    }
  };

  // Sync data to parent via onDataChange
  useEffect(() => {
    onDataChange({
      selectedHost,
      accountInfo: {
        bank: bankName,
        number: accountNumber,
        holder: accountHolder,
      },
      contactInfo: {
        type: contactType,
        content: kakaoLink,
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
    kakaoLink,
    description,
    saveAsDefault,
    onDataChange,
  ]);

  return (
    <section className="bg-white p-5 rounded-2xl shadow-sm border border-slate-100 space-y-6 mb-8">
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
                팀을 생성하고 게스트를 편리하게 모집하세요.
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
              {...register('accountHolder')}
              placeholder="예금주"
              className="w-[90px] h-11 bg-white border-slate-200"
            />
            <Input
              {...register('bankName')}
              placeholder="은행명"
              className="w-[90px] h-11 bg-white border-slate-200"
            />
            <Input
              {...register('accountNumber')}
              placeholder="계좌번호 (- 없이)"
              className="flex-1 h-11 bg-white border-slate-200"
            />
          </div>
        </div>

        {/* Contact Info - Toggle style */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1">
              <Label className="text-sm font-bold text-slate-600">
                문의하기 (연락처)
              </Label>
              <span className="text-red-500 text-xs">*</span>
            </div>
            {/* Toggle: 전화번호 / 오픈채팅 */}
            <div className="flex items-center gap-2">
              <span className={`text-xs ${contactType === 'PHONE' ? 'text-orange-600 font-medium' : 'text-slate-400'}`}>
                <Phone className="w-3 h-3 inline mr-0.5" />
                전화
              </span>
              <Switch
                checked={contactType === 'KAKAO_OPEN_CHAT'}
                onCheckedChange={(checked) => {
                  setValue('operations.contactType', checked ? 'KAKAO_OPEN_CHAT' : 'PHONE');
                  // Value persistence: Do not reset content
                }}
                className="data-[state=checked]:bg-yellow-400 data-[state=unchecked]:bg-orange-400"
              />
              <span className={`text-xs ${contactType === 'KAKAO_OPEN_CHAT' ? 'text-yellow-600 font-medium' : 'text-slate-400'}`}>
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
                className="pl-9 h-11 bg-white border-slate-200 text-sm focus-visible:ring-1 focus-visible:ring-[#FF6600] focus-visible:border-[#FF6600]"
              />
            ) : (
              <Input
                {...register('kakaoLink')}
                placeholder="오픈채팅 링크"
                className="pl-9 h-11 bg-white border-slate-200 text-sm focus-visible:ring-1 focus-visible:ring-[#FF6600] focus-visible:border-[#FF6600]"
              />
            )}
          </div>
          <p className="text-xs text-slate-400">
            * 승인된 게스트에게만 공개됩니다.
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
            className="w-5 h-5 text-orange-500 border-gray-300 rounded focus:ring-orange-500"
          />
          <span className="text-sm text-slate-700">
            위 정보들을 내 기본정보로 저장하시겠습니까?
          </span>
        </label>
      </div>
    </section>
  );
}

