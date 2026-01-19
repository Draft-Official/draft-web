'use client';

import { useState, useEffect } from 'react';
import { CreditCard, LogOut, Settings } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { ProfileCard } from '@/features/my/ui/ProfileCard';
import { ProfileSetupModal } from '@/features/my/ui/ProfileSetupModal';
import { ProfileData } from '@/features/my/model/types';
import { useAuth } from '@/features/auth/model/auth-context';
import { useRouter } from 'next/navigation';

export default function MyPage() {
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Load profile from localStorage on mount
  useEffect(() => {
    const savedProfile = localStorage.getItem('userProfile');
    const profileCompleted = localStorage.getItem('profileCompleted');
    const profileSkipped = localStorage.getItem('profileSkipped');

    if (savedProfile) {
      try {
        setProfile(JSON.parse(savedProfile));
      } catch (e) {
        console.error('Failed to parse profile:', e);
      }
    } else if (!profileCompleted && !profileSkipped) {
      // 최초 로그인: 프로필이 없고, 완료/스킵한 적 없으면 모달 자동 오픈
      setIsModalOpen(true);
    }
  }, []);

  const handleProfileComplete = (data: ProfileData) => {
    setProfile(data);
    localStorage.setItem('userProfile', JSON.stringify(data));
    localStorage.setItem('profileCompleted', 'true');
  };

  const handleEditClick = () => {
    setIsModalOpen(true);
  };

  const { signOut } = useAuth();
  const router = useRouter();

  const handleLogout = async () => {
    try {
      await signOut();
      // Clear local mock data if needed
      localStorage.removeItem('userProfile');
      localStorage.removeItem('profileCompleted'); 
      localStorage.removeItem('profileSkipped');
      router.push('/');
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  return (
    <div className="bg-background min-h-full p-4 space-y-6 pb-24">
      <ProfileCard
        profile={profile}
        userName="김농구"
        userInitials="김농"
        teamName={profile?.team}
        onEditClick={handleEditClick}
      />

      <div className="space-y-4">
        <h2 className="font-bold text-lg text-foreground">내 정보</h2>

        <Card className="p-0 overflow-hidden border-border">
          <div className="divide-y divide-border">
            <Button variant="ghost" className="w-full justify-start p-4 h-auto rounded-none font-normal">
              <CreditCard className="mr-3 h-5 w-5 text-muted-foreground" />
              결제 내역
            </Button>
            <Button variant="ghost" className="w-full justify-start p-4 h-auto rounded-none font-normal">
              <Settings className="mr-3 h-5 w-5 text-muted-foreground" />
              설정
            </Button>
          </div>
        </Card>

        <Button 
          variant="outline" 
          className="w-full justify-start p-4 h-auto text-destructive hover:text-destructive hover:bg-destructive/10"
          onClick={handleLogout}
        >
          <LogOut className="mr-3 h-5 w-5" />
          로그아웃
        </Button>
      </div>

      <ProfileSetupModal
        open={isModalOpen}
        onOpenChange={setIsModalOpen}
        onComplete={handleProfileComplete}
        initialData={profile || undefined}
        isEditing={!!profile}
      />
    </div>
  );
}
