'use client';

import Link from 'next/link';
import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';

export function RecruitFAB() {
    return (
        <Link href="/match/create">
            <motion.div
                className="fixed bottom-[85px] right-4 z-50"
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
            >
                <Button
                    size="lg"
                    className="h-14 px-6 rounded-full bg-[#FF6600] hover:bg-[#FF6600]/90 text-white shadow-xl shadow-orange-500/30 border-0 flex items-center gap-2 group"
                >
                    <div className="relative">
                         <Plus className="h-6 w-6 stroke-[3px]" />
                         <span className="absolute inset-0 rounded-full animate-ping opacity-75 bg-white/30" />
                    </div>
                    <span className="text-lg font-bold tracking-tight">게스트 모집하기</span>
                </Button>
            </motion.div>
        </Link>
    );
}
