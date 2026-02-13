import Link from 'next/link';
import { ChevronRight } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { Card } from '@/shared/ui/base/card';

interface MenuItem {
  label: string;
  href: string;
  icon: LucideIcon;
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
        <div className="divide-y divide-border">
          {items.map(({ label, href, icon: Icon }) => (
            <Link
              key={href}
              href={href}
              className="flex items-center justify-between p-4 hover:bg-muted/50 transition-colors"
            >
              <div className="flex items-center gap-3">
                <Icon className="h-5 w-5 text-muted-foreground" />
                <span className="text-sm font-medium text-foreground">{label}</span>
              </div>
              <ChevronRight className="h-4 w-4 text-muted-foreground" />
            </Link>
          ))}
        </div>
      </Card>
    </div>
  );
}
