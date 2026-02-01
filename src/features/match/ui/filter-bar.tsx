'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Search, RotateCcw } from 'lucide-react';
import { Button } from '@/shared/ui/base/button';
import { Chip } from '@/shared/ui/base/chip';
import { cn } from '@/shared/lib/utils';
import { RegionFilterModal } from './region-filter-modal';
import { DateStrip } from './components/date-strip';
import { PositionFilterModal } from './components/filter/position-filter-modal';
import { VacancyFilterModal } from './components/filter/vacancy-filter-modal';
import { DetailedFilterModal } from './components/filter/detail-filter-modal';

// Hook to detect scroll with hysteresis to prevent flickering
const useScrollDirection = () => {
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const SCROLL_DOWN_THRESHOLD = 60; // Hide header when scrolling down past this
    const SCROLL_UP_THRESHOLD = 20;   // Show header when scrolling up below this

    const updateScrollDirection = () => {
      const scrollY = window.scrollY;

      if (!isScrolled && scrollY > SCROLL_DOWN_THRESHOLD) {
        // Scrolled down past threshold - hide header
        setIsScrolled(true);
      } else if (isScrolled && scrollY < SCROLL_UP_THRESHOLD) {
        // Scrolled up below threshold - show header
        setIsScrolled(false);
      }
    };

    window.addEventListener("scroll", updateScrollDirection, { passive: true });
    return () => window.removeEventListener("scroll", updateScrollDirection);
  }, [isScrolled]);

  return isScrolled;
};

interface FilterBarProps {
  selectedDateISO: string | null;
  onDateSelect: (date: string | null) => void;
  selectedPositions: string[];
  onPositionsChange: (positions: string[]) => void;
  selectedLocations: string[];
  onLocationsChange: (locations: string[]) => void;
  selectedPriceMax?: number | null;
  onPriceMaxChange?: (price: number | null) => void;
  minVacancy?: number | null;
  onMinVacancyChange?: (vacancy: number | null) => void;
  // Detailed Filter Props
  selectedGenders?: string[];
  onGendersChange?: (genders: string[]) => void;
  selectedAges?: string[];
  onAgesChange?: (ages: string[]) => void;
  selectedGameFormats?: string[];
  onGameFormatsChange?: (formats: string[]) => void;
  notificationSlot?: React.ReactNode;
}

export function FilterBar({
  selectedDateISO,
  onDateSelect,
  selectedPositions,
  onPositionsChange,
  selectedLocations,
  onLocationsChange,
  selectedPriceMax = null,
  onPriceMaxChange,
  minVacancy = null,
  onMinVacancyChange,
  selectedGenders = [],
  onGendersChange,
  selectedAges = [],
  onAgesChange,
  selectedGameFormats = [],
  onGameFormatsChange,
  notificationSlot,
}: FilterBarProps) {
  // -- Scroll Detection --
  const isScrolled = useScrollDirection();
  
  // -- Date Generation --
  const calendarDates = React.useMemo(() => {
    // Dynamically import or require? No, extracting to shared utils is better.
    // I assumed getNext14Days is exported from '@/features/match/lib/utils'
    return require('@/features/match/lib/utils').getNext14Days();
  }, []);

  // -- Modal Open States --
  const [isLocationOpen, setIsLocationOpen] = useState(false);
  const [isPositionOpen, setIsPositionOpen] = useState(false);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [isVacancyOpen, setIsVacancyOpen] = useState(false);

  // --- Filter Logic Handlers ---

  // 1. Location (Handled by RegionFilterModal)
  const handleLocationApply = (locations: string[]) => {
    onLocationsChange(locations);
  };

  // 2. Position
  const handlePositionApply = (positions: string[]) => {
    onPositionsChange(positions);
  };

  // 3. Vacancy
  const handleVacancyApply = (vacancy: number | null) => {
    if (onMinVacancyChange) {
        onMinVacancyChange(vacancy);
    }
  };

  // 4. Detailed Filter
  const handleDetailApply = (filters: {
    priceMax: number | null;
    genders: string[];
    ages: string[];
    gameFormats: string[];
  }) => {
    if (onPriceMaxChange) onPriceMaxChange(filters.priceMax);
    if (onGendersChange) onGendersChange(filters.genders);
    if (onAgesChange) onAgesChange(filters.ages);
    if (onGameFormatsChange) onGameFormatsChange(filters.gameFormats);
  };

  // Label Helpers
  const getLocationLabel = () => {
    if (selectedLocations.length === 0) return "지역";
    const first = selectedLocations[0].split(' ')[1] || selectedLocations[0]; // Show district name only if possible
    return selectedLocations.length === 1 ? first : `${first} 외 ${selectedLocations.length - 1}`;
  };

  const getPositionLabel = () => {
    if (selectedPositions.length === 0) return "포지션";
    return selectedPositions.length === 1 
      ? selectedPositions[0] 
      : `${selectedPositions[0]} 외 ${selectedPositions.length - 1}`;
  };

  const getVacancyLabel = () => {
      if (!minVacancy || minVacancy === 0) return "남은 인원";
      return `${minVacancy}명 이상`;
  };

  const getDetailLabel = () => {
    // Count active detailed filters
    let count = 0;
    if (selectedPriceMax !== null) count++;
    if (selectedGenders.length > 0) count++;
    if (selectedAges.length > 0) count++;
    if (selectedGameFormats.length > 0) count++;
    return count > 0 ? `상세 (${count})` : "상세";
  };

  return (
    // --- Sticky Header Area ---
    <div className="bg-white sticky top-0 z-20 shadow-sm border-b border-slate-100">
      {/* 1. Top Bar: Logo & Actions - Hidden on scroll */}
      <div className={cn(
        "flex items-center justify-between px-4 h-14 w-full bg-white z-20 transition-all duration-300 overflow-hidden",
        isScrolled ? "h-0 opacity-0" : "h-14 opacity-100"
      )}>
        <h1 className="text-xl font-extrabold text-slate-900 tracking-tight">
          게스트 모집
        </h1>
        <div className="flex items-center gap-3">
          <Link
            href="/matches/create"
            className="md:hidden px-3 py-1.5 bg-[#FF6600] text-white text-xs font-bold rounded-full shadow-sm hover:bg-[#FF6600]/90 active:scale-95 transition-all mr-1"
          >
            경기 개설하기
          </Link>
          <Search className="w-6 h-6 text-slate-900" />
          {notificationSlot}
        </div>
      </div>

      {/* 2. Date Strip */}
      <DateStrip 
        dates={calendarDates}
        selectedDate={selectedDateISO} 
        onSelect={onDateSelect}
        showAllOption={true}
      />

      {/* 3. Integrated Filter Bar */}
      <div className="px-4 pb-3 flex gap-2 overflow-x-auto no-scrollbar bg-white w-full items-center">

        {/* (A) Location Filter */}
        <Chip 
          label={getLocationLabel()}
          variant="orange"
          isActive={selectedLocations.length > 0}
          hasDropdown={true}
          onClick={() => setIsLocationOpen(true)}
          className="shrink-0"
        />
        <RegionFilterModal 
          open={isLocationOpen} 
          onOpenChange={setIsLocationOpen}
          onApply={handleLocationApply}
          selectedRegions={selectedLocations}
        />

        {/* (B) Position Filter */}
        <Chip
          label={getPositionLabel()}
          variant="orange"
          isActive={selectedPositions.length > 0}
          hasDropdown={true}
          onClick={() => setIsPositionOpen(true)}
          className="shrink-0"
        />
        <PositionFilterModal
          open={isPositionOpen}
          onOpenChange={setIsPositionOpen}
          selectedPositions={selectedPositions}
          onApply={handlePositionApply}
        />

        {/* (C) Vacancy Count Filter */}
        {onMinVacancyChange && (
            <>
                <Chip
                    label={getVacancyLabel()}
                    variant="orange"
                    isActive={minVacancy !== null && minVacancy > 0}
                    hasDropdown={true}
                    onClick={() => setIsVacancyOpen(true)}
                    className="shrink-0"
                />
                <VacancyFilterModal
                    open={isVacancyOpen}
                    onOpenChange={setIsVacancyOpen}
                    minVacancy={minVacancy}
                    onApply={handleVacancyApply}
                />
            </>
        )}

        {/* (D) Detailed Filter (Includes Price) */}
        <Chip
          label={getDetailLabel()}
          variant="orange"
          isActive={selectedPriceMax !== null || selectedGenders.length > 0 || selectedAges.length > 0 || selectedGameFormats.length > 0}
          hasDropdown={true}
          onClick={() => setIsDetailOpen(true)}
          className="shrink-0"
        />
        <DetailedFilterModal
            open={isDetailOpen}
            onOpenChange={setIsDetailOpen}
            selectedPriceMax={selectedPriceMax || null}
            selectedGenders={selectedGenders || []}
            selectedAges={selectedAges || []}
            selectedGameFormats={selectedGameFormats || []}
            onApply={handleDetailApply}
        />

        {/* (E) Reset Button */}
        <div className="flex-1" />
        <Button
          variant="ghost"
          size="sm"
          onClick={() => {
            onDateSelect(null);
            onPositionsChange([]);
            onLocationsChange([]);
            if (onPriceMaxChange) onPriceMaxChange(null);
            if (onMinVacancyChange) onMinVacancyChange(null);
            if (onGendersChange) onGendersChange([]);
            if (onAgesChange) onAgesChange([]);
            if (onGameFormatsChange) onGameFormatsChange([]);
          }}
          className="h-8 px-2 text-xs text-slate-400 hover:text-slate-600 hover:bg-transparent shrink-0 ml-auto flex items-center gap-1"
        >
          초기화
          <RotateCcw className="w-3.5 h-3.5" />
        </Button>
      </div>
    </div>
  );
}
