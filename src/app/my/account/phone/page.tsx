import { SubPageHeader } from '@/features/my';
import { PhoneVerificationForm } from '@/features/auth/ui/phone-verification-form';

export default function PhoneVerificationPage() {
  return (
    <>
      <SubPageHeader title="전화번호 인증" />
      <PhoneVerificationForm />
    </>
  );
}
