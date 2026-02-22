import { LucideIcon } from 'lucide-react';
import { cn } from '@/shared/lib/utils';

type InfoColor = 'orange' | 'blue' | 'red' | 'green' | 'purple';

interface MatchInfoCardProps {
  icon: LucideIcon;
  label: string;
  value: string;
  color: InfoColor;
}

const colorStyles: Record<InfoColor, { bg: string; iconBg: string; iconColor: string }> = {
  orange: { bg: 'bg-brand-weak', iconBg: 'bg-white', iconColor: 'text-primary' },
  blue:   { bg: 'bg-blue-50',   iconBg: 'bg-white', iconColor: 'text-blue-500' },
  red:    { bg: 'bg-red-50',    iconBg: 'bg-white', iconColor: 'text-red-500' },
  green:  { bg: 'bg-green-50',  iconBg: 'bg-white', iconColor: 'text-green-600' },
  purple: { bg: 'bg-purple-50', iconBg: 'bg-white', iconColor: 'text-purple-600' },
};

export function MatchInfoCard({ icon: Icon, label, value, color }: MatchInfoCardProps) {
  const styles = colorStyles[color];

  return (
    <div className={cn("flex items-center gap-3 p-3 rounded-xl", styles.bg)}>
      <div className={cn("w-10 h-10 rounded-full flex items-center justify-center shrink-0", styles.iconBg)}>
        <Icon className={cn("w-5 h-5", styles.iconColor)} />
      </div>
      <div>
        <div className="text-xs text-slate-500 mb-0.5">{label}</div>
        <div className="font-bold text-sm text-slate-900">{value}</div>
      </div>
    </div>
  );
}
