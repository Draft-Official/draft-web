'use client';

import React from 'react';

import { ProfileCard } from '@/features/my/ui/profile-card';
import { MenuList } from '@/features/my/ui/menu-list';

export default function MyPage() {
  return (
    <div className="bg-white min-h-screen">
      <div className="h-[52px] bg-white flex items-center px-5 border-b border-[#F2F4F6]">
        <h1 className="text-[20px] font-bold text-[#191F28]">마이페이지</h1>
      </div>
      
      <ProfileCard />
      <MenuList />
      

    </div>
  );
}
