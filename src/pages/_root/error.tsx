'use client';

import { useEffect } from "react";

export default function RootError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center px-5">
      <div className="text-center">
        <h1 className="text-6xl font-black text-slate-200 mb-4">오류</h1>
        <h2 className="text-xl font-bold text-slate-900 mb-2">
          문제가 발생했습니다
        </h2>
        <p className="text-sm text-slate-500 mb-8">
          잠시 후 다시 시도해주세요.
        </p>
        <button
          onClick={() => reset()}
          className="inline-flex items-center justify-center h-12 px-6 bg-[#FF6600] hover:bg-[#FF6600]/90 text-white font-bold rounded-xl transition-colors"
        >
          다시 시도
        </button>
      </div>
    </div>
  );
}
