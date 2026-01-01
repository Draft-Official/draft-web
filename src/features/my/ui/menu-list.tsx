'use client';

import React from 'react';
import { ChevronRight, FileText, HelpCircle, MessageCircle, Settings, LogOut } from 'lucide-react';
import { cn } from '@/shared/lib/utils';

interface MenuItemProps {
  icon: React.ElementType;
  label: string;
  onClick?: () => void;
  isDestructive?: boolean;
}

function MenuItem({ icon: Icon, label, onClick, isDestructive }: MenuItemProps) {
  return (
    <button 
      onClick={onClick}
      className="w-full h-[56px] flex items-center justify-between px-5 bg-white active:bg-slate-50 transition-colors"
    >
      <div className="flex items-center gap-3">
        <Icon className={cn("w-5 h-5", isDestructive ? "text-red-500" : "text-[#4E5968]")} />
        <span className={cn("text-[16px] font-medium", isDestructive ? "text-red-500" : "text-[#333D4B]")}>
          {label}
        </span>
      </div>
      <ChevronRight className="w-5 h-5 text-[#D1D6DB]" />
    </button>
  );
}

export function MenuList() {
  return (
    <div className="flex flex-col py-2">
      <div className="h-[10px] bg-[#F2F4F6]" />
      <div className="flex flex-col">
        <MenuItem icon={FileText} label="공지사항" />
        <MenuItem icon={HelpCircle} label="자주 묻는 질문" />
        <MenuItem icon={MessageCircle} label="1:1 문의" />
      </div>
      
      <div className="h-[10px] bg-[#F2F4F6]" />
      <div className="flex flex-col">
        <MenuItem icon={Settings} label="설정" />
        <MenuItem icon={LogOut} label="로그아웃" isDestructive />
      </div>
    </div>
  );
}
