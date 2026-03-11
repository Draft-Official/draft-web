'use client';

import { Crown, Trophy, User, Users, type LucideIcon } from 'lucide-react';
import { cn } from '@/shared/lib/utils';
import { MATCH_TYPE_ICON_TOKENS, type MatchTypeIconToken } from '../../config/constants';
import type { MatchType } from '../../model/types';

const ICON_TOKEN_MAP: Record<MatchTypeIconToken, LucideIcon> = {
  user: User,
  crown: Crown,
  users: Users,
  trophy: Trophy,
};

interface MatchTypeIconProps {
  matchType: MatchType;
  className?: string;
}

export function MatchTypeIcon({ matchType, className }: MatchTypeIconProps) {
  const token = MATCH_TYPE_ICON_TOKENS[matchType];
  const Icon = ICON_TOKEN_MAP[token];

  return <Icon className={cn('h-3.5 w-3.5 shrink-0', className)} aria-hidden="true" />;
}
