'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { useFormContext } from 'react-hook-form';
import { Input } from '@/shared/ui/shadcn/input';
import { Label } from '@/shared/ui/shadcn/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/shared/ui/shadcn/select';
import { Textarea } from '@/shared/ui/shadcn/textarea';
import { Button } from '@/shared/ui/shadcn/button';
import { BankCombobox } from '@/shared/ui/composite/bank-combobox';
import { FileText, Phone, UserPlus, X } from 'lucide-react';
import { toast } from '@/shared/ui/shadcn/sonner';
import { getSupabaseBrowserClient } from '@/shared/api/supabase/client';
import { createAuthService } from '@/shared/api/auth-service';
import { createTeamService } from '@/entities/team';
import type { AccountInfo, OperationInfo } from '@/shared/types/jsonb.types';
import type { MatchCreateTeamOptionDTO, MatchCreateUserDTO } from '@/features/match-create/model/types';
import {
  sanitizeAccountHolderInput,
  sanitizeAccountNumberInput,
} from '@/shared/lib/validation/account';
import { formatPhoneNumber } from '@/shared/lib/phone-utils';
import { AccountRegisterModal, type AccountRegisterFormValue } from './account-register-modal';

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
  const { register, watch, setValue, getValues } = useFormContext();
  const [isAccountModalOpen, setIsAccountModalOpen] = useState(false);
  const [accountOverrides, setAccountOverrides] = useState<Record<string, AccountRegisterFormValue>>({});
  const [dismissedAccountCtaHosts, setDismissedAccountCtaHosts] = useState<Record<string, boolean>>({});
  const hostBackfillAppliedRef = useRef<string | null>(null);
  
  // Watch form values for UI updates and data sync
  // Note: We use register to bind inputs, but we watch them for the onDataChange effect
  const selectedHost = watch('operations.selectedHost') || '';
  const bankName = watch('bankName') || '';
  const accountNumber = watch('accountNumber') || '';
  const accountHolder = watch('accountHolder') || '';
  const description = watch('description') || '';
  const phoneNumber = watch('phoneNumber') || '';
  const saveAsDefault = watch('operations.saveAsDefault') || false;

  // Initial setup for defaults - run once when user/teams load if needed, or rely on manual selection
  // Refactored: No auto-selection of 'me'. User must select.

  // Check if user has existing info
  const userAccount = user ? getAccountInfo(user.accountInfo) : null;
  const userOps = user ? getOperationInfo(user.operationInfo) : null;
  const verifiedPhone = user?.phone ? formatPhoneNumber(user.phone) : '';

  const hasExistingInfo = Boolean(
    userAccount?.bank &&
    userAccount?.number &&
    userAccount?.holder
  ) || Boolean(
    userOps?.url ||
    userOps?.notice
  );

  const selectedTeam = useMemo(
    () => teams.find((team) => team.id === selectedHost) ?? null,
    [teams, selectedHost]
  );

  const resolveAccountByHost = useCallback((host: string): AccountRegisterFormValue => {
    const hostKey = host === 'me' ? 'me' : host;
    const overridden = accountOverrides[hostKey];
    if (overridden) return overridden;

    if (host === 'me') {
      const account = user ? getAccountInfo(user.accountInfo) : {};
      return {
        bank: account.bank || '',
        number: account.number || '',
        holder: account.holder || '',
      };
    }

    const team = teams.find((item) => item.id === host);
    const account = team ? getAccountInfo(team.accountInfo) : {};
    return {
      bank: account.bank || '',
      number: account.number || '',
      holder: account.holder || '',
    };
  }, [accountOverrides, teams, user]);

  const selectedHostStoredAccount = selectedHost
    ? resolveAccountByHost(selectedHost)
    : null;

  const hasSelectedHostStoredAccount = Boolean(
    selectedHostStoredAccount?.bank &&
    selectedHostStoredAccount?.number &&
    selectedHostStoredAccount?.holder
  );

  const hasFormAccount = Boolean(bankName && accountNumber && accountHolder);
  const shouldShowAccountRegisterCta = Boolean(
    selectedHost && !hasSelectedHostStoredAccount && !hasFormAccount
  );
  const shouldRenderAccountRegisterCta = Boolean(
    shouldShowAccountRegisterCta && selectedHost && !dismissedAccountCtaHosts[selectedHost]
  );

  const canEditSelectedTeamAccount = selectedHost === 'me'
    ? true
    : Boolean(selectedTeam && (selectedTeam.role === 'LEADER' || selectedTeam.role === 'MANAGER'));

  const accountModalTitle = selectedHost === 'me'
    ? '개인 입금 계좌 등록'
    : `${selectedTeam?.name || '팀'} 입금 계좌 등록`;

  const { mutateAsync: saveAccount, isPending: isSavingAccount } = useMutation({
    mutationFn: async (value: AccountRegisterFormValue) => {
      if (!selectedHost) {
        throw new Error('주최자를 먼저 선택해주세요.');
      }

      const supabase = getSupabaseBrowserClient();

      if (selectedHost === 'me') {
        if (!user?.id) throw new Error('로그인이 필요합니다.');
        const authService = createAuthService(supabase);
        await authService.updateOperationsDefaults(user.id, {
          accountInfo: value,
        });

        return { hostKey: 'me', hostLabel: '개인', value };
      }

      const team = teams.find((item) => item.id === selectedHost);
      if (!team) throw new Error('선택한 팀 정보를 찾을 수 없습니다.');
      if (team.role !== 'LEADER' && team.role !== 'MANAGER') {
        throw new Error('팀 입금 계좌는 팀장/매니저만 등록할 수 있습니다.');
      }

      const teamService = createTeamService(supabase);
      await teamService.updateTeamDefaults(team.id, {
        accountInfo: value,
      });

      return { hostKey: team.id, hostLabel: team.name, value };
    },
    onSuccess: ({ hostKey, hostLabel, value }) => {
      setAccountOverrides((prev) => ({ ...prev, [hostKey]: value }));
      setValue('bankName', value.bank, { shouldDirty: true });
      setValue('accountNumber', value.number, { shouldDirty: true });
      setValue('accountHolder', value.holder, { shouldDirty: true });
      setIsAccountModalOpen(false);
      toast.success(`${hostLabel} 입금 계좌가 저장되었습니다.`);
    },
    onError: (error: unknown) => {
      const message = error instanceof Error ? error.message : '입금 계좌 저장에 실패했습니다.';
      toast.error(message);
    },
  });

  // Handle host selection change
  const handleHostChange = (value: 'me' | string) => {
    setValue('operations.selectedHost', value);

    if (value === 'me' && user) {
      // Reset to user defaults
      const userAccount = resolveAccountByHost('me');
      const userOps = getOperationInfo(user.operationInfo);

      const bank = userAccount.bank || '';
      const number = userAccount.number || '';
      const holder = userAccount.holder || '';
      const notice = userOps.notice || '';

      setValue('bankName', bank);
      setValue('accountNumber', number);
      setValue('accountHolder', holder);
      setValue('description', notice);
      setValue('operations.contactType', 'PHONE', { shouldDirty: false });
      setValue('phoneNumber', verifiedPhone, { shouldDirty: false });

      if (hasExistingInfo) {
        toast.success('개인 기본값을 불러왔습니다.');
      }
    } else {
      // Find team and set team defaults
      const team = teams.find((t) => t.id === value);
      if (team) {
        const teamAccount = resolveAccountByHost(value);
        const teamOps = getOperationInfo(team.operationInfo);

        const bank = teamAccount.bank || '';
        const number = teamAccount.number || '';
        const holder = teamAccount.holder || '';
        const notice = teamOps.notice || '';

        setValue('bankName', bank);
        setValue('accountNumber', number);
        setValue('accountHolder', holder);
        setValue('description', notice);

        setValue('operations.contactType', 'PHONE', { shouldDirty: false });
        setValue('phoneNumber', verifiedPhone, { shouldDirty: false });

        toast.success(`${team.name} 정보를 불러왔습니다.`);
      }
    }
  };

  useEffect(() => {
    setValue('operations.contactType', 'PHONE', { shouldDirty: false });
  }, [setValue]);

  useEffect(() => {
    if (phoneNumber === verifiedPhone) return;

    setValue('phoneNumber', verifiedPhone, { shouldDirty: false });
  }, [verifiedPhone, phoneNumber, setValue]);

  // When host is set via prefill (not Select onChange), backfill only missing operation fields.
  useEffect(() => {
    if (!selectedHost) {
      hostBackfillAppliedRef.current = null;
      return;
    }
    if (hostBackfillAppliedRef.current === selectedHost) return;
    const currentBankName = getValues('bankName') || '';
    const currentAccountNumber = getValues('accountNumber') || '';
    const currentAccountHolder = getValues('accountHolder') || '';
    const currentDescription = getValues('description') || '';

    if (selectedHost === 'me') {
      if (!user) return;
      const account = resolveAccountByHost('me');
      const ops = getOperationInfo(user.operationInfo);

      if (!currentBankName && account.bank) {
        setValue('bankName', account.bank, { shouldDirty: false });
      }
      if (!currentAccountNumber && account.number) {
        setValue('accountNumber', account.number, { shouldDirty: false });
      }
      if (!currentAccountHolder && account.holder) {
        setValue('accountHolder', account.holder, { shouldDirty: false });
      }
      if (!currentDescription && ops.notice) {
        setValue('description', ops.notice, { shouldDirty: false });
      }
      hostBackfillAppliedRef.current = selectedHost;
      return;
    }

    const team = teams.find((item) => item.id === selectedHost);
    if (!team) return;

    const account = resolveAccountByHost(selectedHost);
    const ops = getOperationInfo(team.operationInfo);

    if (!currentBankName && account.bank) {
      setValue('bankName', account.bank, { shouldDirty: false });
    }
    if (!currentAccountNumber && account.number) {
      setValue('accountNumber', account.number, { shouldDirty: false });
    }
    if (!currentAccountHolder && account.holder) {
      setValue('accountHolder', account.holder, { shouldDirty: false });
    }
    if (!currentDescription && ops.notice) {
      setValue('description', ops.notice, { shouldDirty: false });
    }
    hostBackfillAppliedRef.current = selectedHost;
  }, [
    selectedHost,
    user,
    teams,
    getValues,
    setValue,
    resolveAccountByHost,
  ]);

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
        type: 'PHONE',
        content: verifiedPhone,
      },
      hostNotice: description,
      saveAsDefault,
    });
  }, [
    selectedHost,
    bankName,
    accountNumber,
    accountHolder,
    verifiedPhone,
    description,
    saveAsDefault,
    onDataChange,
  ]);

  return (
    <section className="bg-white px-5 py-6 space-y-6">
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
        <div className="flex items-center gap-2">
          <div className="flex-1">
            <Select
              value={selectedHost}
              onValueChange={handleHostChange}
            >
              <SelectTrigger className="h-12 bg-white border-border">
                <SelectValue placeholder="주최자를 선택해주세요" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="me">🙋‍♂️ 개인 주최</SelectItem>
                {teams.map((team) => (
                  <SelectItem key={team.id} value={team.id}>
                    🏀 {team.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
        {shouldRenderAccountRegisterCta && (
          <div className="relative mt-3 rounded-xl border border-amber-200 bg-amber-50 px-3 py-3">
            <Button
              type="button"
              size="icon-sm"
              variant="ghost"
              onClick={() => {
                if (!selectedHost) return;
                setDismissedAccountCtaHosts((prev) => ({ ...prev, [selectedHost]: true }));
              }}
              aria-label="계좌 등록 안내 닫기"
              className="absolute right-2 top-2 h-7 w-7 rounded-md text-amber-700 hover:bg-amber-100 hover:text-amber-900"
            >
              <X className="w-4 h-4" />
            </Button>
            <p className="text-xs text-amber-800">
              선택한 주최자의 저장된 입금 계좌가 없습니다.
            </p>
            <p className="mt-1 text-xs text-amber-800">
              계좌를 저장해두면 다음 경기 개설 시 자동으로 입력됩니다.
            </p>
            <div className="mt-2 flex items-center gap-2">
              <Button
                type="button"
                size="sm"
                variant="outline"
                className="h-8 border-amber-300 bg-white text-amber-900 hover:bg-amber-100"
                onClick={() => setIsAccountModalOpen(true)}
                disabled={!canEditSelectedTeamAccount || isSavingAccount}
              >
                입금 계좌 등록
              </Button>
              {!canEditSelectedTeamAccount && (
                <span className="text-xs text-amber-800">
                  팀 계좌는 팀장/매니저만 등록할 수 있어요.
                </span>
              )}
            </div>
          </div>
        )}

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

      {selectedHost && (
        <>
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
                    setValue('accountHolder', sanitizeAccountHolderInput(e.target.value));
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
                    setValue('accountNumber', sanitizeAccountNumberInput(e.target.value));
                  }}
                />
              </div>
              <p className="text-xs text-slate-400">
                예금주: 한글 2-10자 / 계좌번호: 숫자만 10-16자리
              </p>
            </div>

            {/* Contact Info - Toggle style */}
            <div className="space-y-2">
              <div className="flex items-center gap-1">
                <Label className="text-sm font-bold text-slate-600">
                  문의연락처
                </Label>
                <span className="text-red-500 text-xs">*</span>
              </div>

              <div className="relative">
                <Phone className="absolute left-3 top-3.5 h-4 w-4 text-slate-400" />
                <Input
                  value={verifiedPhone}
                  readOnly
                  placeholder="인증된 전화번호가 없습니다"
                  inputMode="tel"
                  className="pl-9 h-11 bg-slate-50 border-slate-200 text-sm text-slate-700"
                />
              </div>
              <p className="text-xs text-slate-400">
                * 인증된 내 전화번호가 자동 적용됩니다
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
        </>
      )}

      <AccountRegisterModal
        open={isAccountModalOpen}
        onOpenChange={setIsAccountModalOpen}
        title={accountModalTitle}
        initialValue={selectedHostStoredAccount ?? { bank: '', number: '', holder: '' }}
        isPending={isSavingAccount}
        onSubmit={async (value) => {
          await saveAccount(value);
        }}
      />
    </section>
  );
}
