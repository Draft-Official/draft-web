'use client';

import React from 'react';
import { User, Settings, CreditCard, LogOut } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';

export default function MyPage() {
    return (
        <div className="bg-background min-h-full p-4 space-y-6 pb-24">
            {/* Profile Header */}
            <div className="flex items-center gap-4">
                <Avatar className="h-20 w-20 border-2 border-white shadow-sm">
                    <AvatarImage src="https://github.com/shadcn.png" />
                    <AvatarFallback>MK</AvatarFallback>
                </Avatar>
                <div>
                    <h1 className="text-xl font-bold text-foreground">김농구</h1>
                    <div className="flex items-center gap-2 mt-1">
                        <Badge variant="secondary">레벨 A</Badge>
                        <span className="text-sm text-muted-foreground">매너온도 36.5℃</span>
                    </div>
                </div>
            </div>

            {/* Settings Menu */}
            <div className="space-y-4">
                <h2 className="font-bold text-lg text-foreground">내 정보</h2>

                <Card className="p-0 overflow-hidden border-border">
                    <div className="divide-y divide-border">
                        <Button variant="ghost" className="w-full justify-start p-4 h-auto rounded-lg font-normal hover:bg-slate-50">
                            <User className="mr-3 h-5 w-5 text-muted-foreground" />
                            프로필 수정
                        </Button>
                        <Button variant="ghost" className="w-full justify-start p-4 h-auto rounded-lg font-normal hover:bg-slate-50">
                            <CreditCard className="mr-3 h-5 w-5 text-muted-foreground" />
                            결제 내역
                        </Button>
                        <Button variant="ghost" className="w-full justify-start p-4 h-auto rounded-lg font-normal hover:bg-slate-50">
                            <Settings className="mr-3 h-5 w-5 text-muted-foreground" />
                            설정
                        </Button>
                    </div>
                </Card>

                <Button variant="outline" className="w-full justify-start p-4 h-auto text-destructive hover:text-destructive hover:bg-destructive/10 border-border">
                    <LogOut className="mr-3 h-5 w-5" />
                    로그아웃
                </Button>
            </div>
        </div>
    );
}
