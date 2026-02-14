'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { CheckCircle2, Info, Smartphone } from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
import { useAuth } from '@/shared/session';
import { useIsMobile } from '@/shared/lib/hooks/use-is-mobile';
import { Input } from '@/shared/ui/base/input';
import { Label } from '@/shared/ui/base/label';
import { Button } from '@/shared/ui/base/button';
import { normalizePhoneNumber, formatPhoneNumber, PHONE_REGEX } from '@/shared/lib/phone-utils';
import type {
  VerificationRequestResponse,
  VerificationCheckResponse,
} from '@/shared/types/phone-verification.types';

type Step = 'input' | 'waiting' | 'done';

const POLL_INTERVAL = 3000;

interface PhoneVerificationFormProps {
  onComplete?: () => void;
}

export function PhoneVerificationForm({ onComplete }: PhoneVerificationFormProps) {
  const { user, isLoading: isAuthLoading } = useAuth();
  const router = useRouter();

  const [step, setStep] = useState<Step>('input');
  const [phone, setPhone] = useState('');
  const [isRequesting, setIsRequesting] = useState(false);

  // 인증 대기 상태
  const [smsUri, setSmsUri] = useState('');
  const [recipient, setRecipient] = useState('');
  const [code, setCode] = useState('');
  const [expiresAt, setExpiresAt] = useState('');
  const [remainingSeconds, setRemainingSeconds] = useState(0);
  const pollingRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const isMobile = useIsMobile();

  // 타이머 & 폴링 정리
  const clearTimers = useCallback(() => {
    if (pollingRef.current) {
      clearInterval(pollingRef.current);
      pollingRef.current = null;
    }
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  useEffect(() => {
    return () => clearTimers();
  }, [clearTimers]);

  // 카운트다운 타이머
  const startTimer = useCallback((expiry: string) => {
    const updateRemaining = () => {
      const diff = Math.max(0, Math.floor((new Date(expiry).getTime() - Date.now()) / 1000));
      setRemainingSeconds(diff);
      if (diff <= 0) {
        clearTimers();
        toast.error('인증 시간이 만료되었습니다.');
      }
    };
    updateRemaining();
    timerRef.current = setInterval(updateRemaining, 1000);
  }, [clearTimers]);

  // 폴링 (한 번에 하나의 요청만, 중복 완료 방지)
  const isPollingRef = useRef(false);
  const isVerifiedRef = useRef(false);

  const startPolling = useCallback((verificationCode: string) => {
    isVerifiedRef.current = false;

    const poll = async () => {
      // 이미 인증 완료되었거나 요청 진행 중이면 스킵
      if (isVerifiedRef.current || isPollingRef.current) return;
      isPollingRef.current = true;

      try {
        const res = await fetch(`/api/phone-verification/check?code=${verificationCode}`);
        const data: VerificationCheckResponse = await res.json();
        if (data.verified && !isVerifiedRef.current) {
          isVerifiedRef.current = true;
          clearTimers();
          setStep('done');
          toast.success('전화번호 인증이 완료되었습니다.');
        }
      } catch {
        // 폴링 실패는 무시
      } finally {
        isPollingRef.current = false;
      }
    };
    pollingRef.current = setInterval(poll, POLL_INTERVAL);
  }, [clearTimers]);

  // Step 1: 인증 요청
  const handleRequest = async () => {
    if (isAuthLoading) {
      toast.error('인증 상태를 확인 중입니다. 잠시 후 다시 시도해주세요.');
      return;
    }

    const normalized = normalizePhoneNumber(phone);
    if (!PHONE_REGEX.test(normalized)) {
      toast.error('올바른 전화번호를 입력해주세요.');
      return;
    }

    if (!user) {
      toast.error('로그인이 필요합니다.');
      return;
    }

    setIsRequesting(true);
    try {
      const res = await fetch('/api/phone-verification/request', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phoneNumber: normalized }),
      });

      if (!res.ok) {
        const err = await res.json();
        toast.error(err.error || '인증 요청에 실패했습니다.');
        return;
      }

      const data: VerificationRequestResponse = await res.json();
      setSmsUri(data.smsUri);
      setRecipient(data.recipient);
      setCode(data.code);
      setExpiresAt(data.expiresAt);

      setStep('waiting');
      startTimer(data.expiresAt);
      startPolling(data.code);
    } catch {
      toast.error('인증 요청에 실패했습니다.');
    } finally {
      setIsRequesting(false);
    }
  };

  // 재요청
  const handleRetry = () => {
    clearTimers();
    setStep('input');
    setCode('');
    setSmsUri('');
    setRecipient('');
    setExpiresAt('');
  };

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  // Step 1: 번호 입력
  if (step === 'input') {
    return (
      <div className="space-y-6 p-4">
        <div className="flex items-start gap-2 p-3 bg-slate-50 rounded-lg">
          <Info className="h-4 w-4 text-slate-500 mt-0.5 shrink-0" />
          <p className="text-sm text-slate-600">
            본인 확인을 위해 전화번호 인증이 필요합니다.
          </p>
        </div>

        <div className="space-y-2">
          <Label htmlFor="phone">전화번호</Label>
          <Input
            id="phone"
            type="tel"
            inputMode="tel"
            placeholder="01012345678"
            value={phone}
            onChange={(e) => setPhone(e.target.value.replace(/[^0-9]/g, ''))}
            maxLength={11}
          />
        </div>

        <Button
          className="w-full"
          onClick={handleRequest}
          disabled={isAuthLoading || isRequesting || phone.length < 10}
        >
          {isRequesting ? '요청 중...' : '인증 요청'}
        </Button>
      </div>
    );
  }

  // Step 2: 인증 대기
  if (step === 'waiting') {
    const isExpired = remainingSeconds <= 0;

    return (
      <div className="space-y-6 p-4">
        {/* 인증번호 표시 */}
        <div className="text-center space-y-2">
          <p className="text-sm text-slate-500">인증번호</p>
          <p className="text-4xl font-bold tracking-[0.3em] text-foreground">
            {code}
          </p>
          <p className={`text-sm ${isExpired ? 'text-red-500' : 'text-slate-500'}`}>
            {isExpired ? '시간이 만료되었습니다' : `남은 시간 ${formatTime(remainingSeconds)}`}
          </p>
        </div>

        {/* 안내 */}
        <div className="flex items-start gap-2 p-3 bg-orange-50 rounded-lg">
          <Smartphone className="h-4 w-4 text-primary mt-0.5 shrink-0" />
          <p className="text-sm text-slate-700">
            아래 버튼을 눌러 인증번호가 담긴 문자를 보내주세요. 문자 발송 후 자동으로 인증됩니다.
          </p>
        </div>

        {/* 모바일: SMS 링크 버튼 */}
        {isMobile && (
          <Button className="w-full" asChild disabled={isExpired}>
            <a href={smsUri}>문자 보내기</a>
          </Button>
        )}

        {/* 데스크탑: QR 코드 */}
        {!isMobile && (
          <div className="flex flex-col items-center gap-3">
            <p className="text-sm text-slate-500">
              휴대폰으로 QR을 스캔하세요
            </p>
            <div className="p-4 bg-white border rounded-lg">
              <QRCodeSVG value={smsUri} size={160} />
            </div>
            {recipient && (
              <p className="text-xs text-slate-500">
                수신 주소: {recipient}
              </p>
            )}
          </div>
        )}

        {/* 만료 시 재요청 */}
        {isExpired && (
          <Button variant="outline" className="w-full" onClick={handleRetry}>
            다시 요청하기
          </Button>
        )}
      </div>
    );
  }

  // Step 3: 인증 완료
  return (
    <div className="space-y-6 p-4">
      <div className="flex flex-col items-center gap-4 py-8">
        <CheckCircle2 className="h-16 w-16 text-green-500" />
        <div className="text-center space-y-1">
          <p className="text-lg font-bold">인증이 완료되었습니다</p>
          <p className="text-sm text-slate-500">
            {formatPhoneNumber(normalizePhoneNumber(phone))}
          </p>
        </div>
      </div>

      <Button className="w-full" onClick={() => onComplete ? onComplete() : router.back()}>
        완료
      </Button>
    </div>
  );
}
