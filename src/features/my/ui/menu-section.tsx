import Link from 'next/link';
import { ChevronRight } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { Card } from '@/shared/ui/shadcn/card';

export interface MenuItem {
  label: string;
  icon: LucideIcon;
  href?: string;
  onClick?: () => void;
  variant?: 'default' | 'destructive';
}

interface MenuSectionProps {
  title: string;
  items: readonly MenuItem[];
}

export function MenuSection({ title, items }: MenuSectionProps) {
  return (
    <div className="space-y-3">
      <h2 className="font-bold text-lg text-foreground">{title}</h2>
      <Card className="p-0 overflow-hidden border-border">
        <div>
          {items.map(({ label, href, onClick, icon: Icon, variant = 'default' }, index) => {
            const isDestructive = variant === 'destructive';
            const textClass = isDestructive ? 'text-destructive' : 'text-foreground';
            const iconClass = isDestructive ? 'text-destructive' : 'text-muted-foreground';
            const key = href ?? label;

            const inner = (
              <div className="flex items-center gap-3">
                <Icon className={`h-5 w-5 ${iconClass}`} />
                <span className={`text-sm font-medium ${textClass}`}>{label}</span>
              </div>
            );

            return (
              <div key={key}>
                {index > 0 && <div className="mx-4 border-t border-border" />}
                {href ? (
                  <Link
                    href={href}
                    className="flex items-center justify-between p-4 hover:bg-muted/50 transition-colors"
                  >
                    {inner}
                    <ChevronRight className="h-4 w-4 text-muted-foreground" />
                  </Link>
                ) : (
                  <button
                    type="button"
                    onClick={onClick}
                    className="w-full flex items-center justify-between p-4 hover:bg-muted/50 transition-colors text-left"
                  >
                    {inner}
                    <ChevronRight className={`h-4 w-4 ${iconClass}`} />
                  </button>
                )}
              </div>
            );
          })}
        </div>
      </Card>
    </div>
  );
}
