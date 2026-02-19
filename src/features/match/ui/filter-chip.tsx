'use client';

import React from 'react';
import { Chip } from '@/shared/ui/composite/chip';

interface FilterChipProps {
  label: string;
  isActive?: boolean;
  hasDropdown?: boolean;
  onClick?: () => void;
  className?: string;
}

/**
 * FilterChip - Wrapper around the shared Chip component
 * Used for filtering in match list views
 *
 * This component now uses the shared Chip component with soft styling
 */
export function FilterChip({
  label,
  isActive = false,
  hasDropdown = false,
  onClick,
  className
}: FilterChipProps) {
  return (
    <Chip
      label={label}
      variant="orange"
      size="lg"
      isActive={isActive}
      showCheckIcon={false}
      hasDropdown={hasDropdown}
      onClick={onClick}
      className={className}
    />
  );
}
