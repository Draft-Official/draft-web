import Link from "next/link";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center px-5">
      <div className="text-center">
        <h1 className="text-6xl font-black text-slate-200 mb-4">404</h1>
        <h2 className="text-xl font-bold text-slate-900 mb-2">
          페이지를 찾을 수 없습니다
        </h2>
        <p className="text-sm text-slate-500 mb-8">
          요청하신 페이지가 존재하지 않거나 이동되었습니다.
        </p>
        <Link
          href="/"
          className="inline-flex items-center justify-center h-12 px-6 bg-[#FF6600] hover:bg-[#FF6600]/90 text-white font-bold rounded-xl transition-colors"
        >
          홈으로 돌아가기
        </Link>
      </div>
    </div>
  );
}
