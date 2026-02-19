import { cn } from '@/shared/lib/utils';

interface RecruitmentStatusCardProps {
  positionCode: string; // 'g', 'f', 'c', 'all' etc.
  label: string;
  status: 'open' | 'closed';
  current?: number;
  max: number;
  onClick: () => void;
  bgVariant?: 'default' | 'orange'; // default used for Guard in legacy code, but we will prefer orange
}

export function RecruitmentStatusCard({
  positionCode,
  label,
  status,
  current = 0,
  max,
  onClick,
  bgVariant = 'orange' // Defaulting to orange style for consistency
}: RecruitmentStatusCardProps) {
  const isOpen = status === 'open';

  // Styles
  const containerClass = isOpen
    ? "bg-brand-weak/30 border-brand-stroke-weak"
    : "bg-slate-50 border-slate-200";
    
  // Override for 'default' variant if needed (e.g. strict legacy match), 
  // but sticking to standard orange for Open states is better UI consistency.
  // If isOpen is true, use orange tinted. If closed, use slate.

  const badgeClass = isOpen
    ? "bg-primary"
    : "bg-slate-300";

  const textClass = isOpen ? "text-slate-900" : "text-slate-400";
  const countClass = isOpen ? "text-slate-600" : "text-slate-400";

  const buttonClass = isOpen
    ? "bg-primary text-white hover:bg-primary/90 active:scale-95 cursor-pointer"
    : "bg-slate-200 text-slate-400 cursor-not-allowed";

  // Position Display Code (e.g., 'G', 'F')
  const codeDisplay = positionCode === 'all' ? 'ALL' : positionCode.toUpperCase();
  // Adjust font size for 'ALL'
  const codeTextSize = positionCode === 'all' ? 'text-sm' : 'text-base';

  return (
    <div className={cn(
      "rounded-xl border-2 transition-colors",
      containerClass
    )}>
      <div className="flex items-center justify-between p-3">
        <div className="flex items-center gap-3">
          <div className={cn(
            "w-12 h-12 rounded-full flex items-center justify-center text-white font-bold shrink-0",
            codeTextSize,
            badgeClass
          )}>
            {codeDisplay}
          </div>
          <div>
            <div className={cn("font-bold text-base mb-1", textClass)}>
              {label}
            </div>
            <div className={cn("text-sm", countClass)}>
              {current}/{max} 명
            </div>
          </div>
        </div>
        <button
          onClick={(e) => {
            e.stopPropagation();
            if (isOpen) onClick();
          }}
          disabled={!isOpen}
          className={cn(
            "px-4 py-2 rounded-lg text-sm font-bold transition-all",
            buttonClass
          )}
        >
          {isOpen ? '신청가능' : '마감'}
        </button>
      </div>
    </div>
  );
}
