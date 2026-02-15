'use client';

import { Settings } from 'lucide-react';

export default function TeamManagePage() {
  return (
    <div className="min-h-screen bg-slate-50">
      <div className="h-14 bg-white flex items-center px-5 border-b border-slate-100">
        <h1 className="text-lg font-bold text-slate-900">팀 관리</h1>
      </div>

      <div className="p-5 flex flex-col items-center justify-center min-h-[calc(100vh-3.5rem-60px)]">
        <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center mb-4">
          <Settings className="w-10 h-10 text-slate-300" />
        </div>
        <h2 className="text-xl font-bold text-slate-900 mb-2">팀 관리 준비 중</h2>
        <p className="text-sm text-slate-500 text-center mb-6">
          팀 설정 관리 기능은 곧 추가될 예정입니다.
        </p>
      </div>
    </div>
  );
}
