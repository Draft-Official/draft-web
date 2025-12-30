import Link from 'next/link';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { MapPin } from 'lucide-react';

export interface MatchCardProps {
    id: string;
    dDay: string;
    date: string; // e.g., 1월 24일 (금) 19:00
    title: string;
    location: string; // e.g., 서울시 강남구 (주차가능)
    fee: string; // e.g., 10,000원
    badges: string[]; // e.g. ['G(마감)', 'F(1)', 'C(급구)']
    urgent?: boolean;
}

export function MatchCard({ id, dDay, date, title, location, fee, badges, urgent }: MatchCardProps) {
    // Extract time from raw date string if possible, or just use the string.
    // Assuming date string format "MM월 DD일 (Day) HH:mm"
    // We want to highlight the Time part "HH:mm" based on user request.
    // For simplicity, let's treat the incoming string as the full date.
    // To follow the specific request "Time: text-2xl font-black... Date: text-sm..."
    // We might need to parse the string or accept separate props.
    // Given current data structure in page.tsx: "1월 24일 (금) 19:00"
    // I will try to split it by the last space to separate Time from Date.
    const parts = date.split(' ');
    const timeStr = parts.pop() || '';
    const dateStr = parts.join(' ');

    return (
        <Link href={`/guest/${id}`} className="block mb-4">
            <article className="relative">
                 {/* Urgent Glow Background */}
                {urgent && (
                    <div className="absolute inset-0 rounded-2xl bg-orange-400/10 blur-xl pointer-events-none" />
                )}

                <Card className={`group relative border-0 bg-white shadow-sm hover:shadow-md transition-all duration-200 cursor-pointer rounded-2xl p-5 overflow-hidden ring-1 ring-inset ${urgent ? 'ring-orange-200' : 'ring-transparent'}`}>
                    
                    {/* Header: Date, Time, D-Day */}
                    <div className="flex justify-between items-start mb-1">
                        <div className="flex flex-col">
                            <div className="flex items-center gap-1.5 mb-0.5">
                                <span className="text-sm font-medium text-gray-500 tracking-tight">
                                    {dateStr}
                                </span>
                                <Badge className="bg-red-50 text-red-600 hover:bg-red-100 rounded-md px-1.5 py-0 text-[10px] font-bold border-0 shadow-none">
                                    {dDay}
                                </Badge>
                            </div>
                            <time className="text-2xl font-black text-gray-900 tracking-tighter leading-none">
                                {timeStr}
                            </time>
                        </div>
                        {/* Price Top Right (Option) - or keep in footer. User said "Top right or bottom". Let's put it Top Right for cleaner footer. */}
                        <span className="text-base font-bold text-gray-900 tracking-tight">
                            {fee}
                        </span>
                    </div>

                    {/* Body: Title & Location */}
                    <div className="mt-3 mb-5">
                        <h3 className="text-lg font-bold text-gray-900 truncate tracking-tight leading-snug group-hover:text-primary transition-colors">
                            {title}
                        </h3>
                        <div className="flex items-center gap-1 mt-1 text-gray-400 text-sm font-medium tracking-tight">
                            <MapPin className="w-3.5 h-3.5" />
                            <span className="truncate">{location}</span>
                        </div>
                    </div>

                    {/* Footer: Status Badges */}
                    <div className="flex items-center gap-2 flex-wrap">
                        {badges.map((badge, i) => {
                            // Determine style based on badge content
                            let badgeStyle = "bg-green-50 text-green-700 hover:bg-green-100"; // Default (Available)
                            
                            if (badge.includes("마감")) {
                                badgeStyle = "bg-gray-100 text-gray-400 hover:bg-gray-200";
                            } else if (badge.includes("급구") || urgent) {
                                badgeStyle = "bg-orange-50 text-orange-600 hover:bg-orange-100 animate-pulse";
                            }

                            return (
                                <Badge 
                                    key={i} 
                                    className={`rounded-full px-3 py-1 text-xs font-bold border-0 shadow-none transition-colors ${badgeStyle}`}
                                >
                                    {badge}
                                </Badge>
                            );
                        })}
                    </div>
                </Card>
            </article>
        </Link>
    );
}
