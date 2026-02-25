import Link from 'next/link';

export function MyPageFooter() {
  return (
    <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground py-2">
      <Link href="/my/terms" className="hover:underline">
        서비스 이용약관
      </Link>
      <span>·</span>
      <Link href="/my/privacy" className="hover:underline">
        개인정보 처리 방침
      </Link>
    </div>
  );
}
