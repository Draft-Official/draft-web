'use client';

import React, { useState, useEffect } from 'react';
import { RotateCcw } from 'lucide-react';
import { Button } from '@/shared/ui/shadcn/button';
import { Separator } from '@/shared/ui/shadcn/separator';
import { Chip } from '@/shared/ui/shadcn/chip';
import { RegionFilterModal } from './region-filter-modal';
import { Header } from './components/header';
import { DateStrip } from './components/date-strip';
import { DetailedFilterModal } from './components/filter/detail-filter-modal';
import { StartTimeFilterModal } from './components/filter/start-time-filter-modal';
import { PriceFilter } from './components/filter/price-filter';

// Hook to detect scroll position and direction
const useScrollBehavior = () => {
  const [isHeaderHidden, setIsHeaderHidden] = useState(false);
  const [hasScrolled, setHasScrolled] = useState(false);

  useEffect(() => {
    let lastScrollY = window.scrollY;
    let ticking = false;

    const HIDE_THRESHOLD = 20; // Hide header when scrolled down past this point
    const SHADOW_THRESHOLD = 10; // Show shadow when scrolled past this point

    const updateScrollBehavior = () => {
      const scrollY = window.scrollY;
      
      // Update shadow based on scroll position
      setHasScrolled(scrollY > SHADOW_THRESHOLD);
      
      // Determine scroll direction
      const scrollingDown = scrollY > lastScrollY;
      
      // Update header visibility based on direction and thresholds
      if (scrollingDown && scrollY > HIDE_THRESHOLD && !isHeaderHidden) {
        setIsHeaderHidden(true);
      } else if (!scrollingDown && isHeaderHidden) {
        // Show header immediately when scrolling up
        setIsHeaderHidden(false);
      }

      lastScrollY = scrollY;
      ticking = false;
    };

    const onScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(updateScrollBehavior);
        ticking = true;
      }
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [isHeaderHidden]);

  return { isHeaderHidden, hasScrolled };
};

interface FilterBarProps {
  selectedDateISO: string | null;
  onDateSelect: (date: string | null) => void;
  selectedPositions: string[];
  onPositionsChange: (positions: string[]) => void;
  selectedLocations: string[];
  onLocationsChange: (locations: string[]) => void;
  startTimeRange?: [number, number] | null;
  onStartTimeRangeChange?: (range: [number, number] | null) => void;
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
  hideClosed?: boolean;
  onHideClosedChange?: (hide: boolean) => void;
  notificationSlot?: React.ReactNode;
}

export function FilterBar({
  selectedDateISO,
  onDateSelect,
  selectedPositions,
  onPositionsChange,
  selectedLocations,
  onLocationsChange,
  startTimeRange = null,
  onStartTimeRangeChange,
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
  hideClosed = true,
  onHideClosedChange,
  notificationSlot,
}: FilterBarProps) {
  // -- Scroll Detection --
  const { isHeaderHidden, hasScrolled } = useScrollBehavior();
  
  // -- Date Generation --
  const calendarDates = React.useMemo(() => {
    // Dynamically import or require? No, extracting to shared utils is better.
    // I assumed getNext14Days is exported from '@/features/match/lib/utils'
    return require('@/features/match/lib/utils').getNext14Days();
  }, []);

  // -- Modal Open States --
  const [isLocationOpen, setIsLocationOpen] = useState(false);
  const [isStartTimeOpen, setIsStartTimeOpen] = useState(false);
  const [isDetailOpen, setIsDetailOpen] = useState(false);

  // --- Filter Logic Handlers ---

  // 1. Location (Handled by RegionFilterModal)
  const handleLocationApply = (locations: string[]) => {
    onLocationsChange(locations);
  };

  // 2. Start Time
  const handleStartTimeApply = (range: [number, number] | null) => {
    if (onStartTimeRangeChange) {
      onStartTimeRangeChange(range);
    }
  };

  // 4. Detailed Filter (now includes position, vacancy, and hideClosed)
  const handleDetailApply = (filters: {
    positions?: string[];
    minVacancy?: number | null;
    genders: string[];
    ages: string[];
    gameFormats: string[];
    hideClosed?: boolean;
  }) => {
    if (filters.positions !== undefined) onPositionsChange(filters.positions);
    if (filters.minVacancy !== undefined && onMinVacancyChange) onMinVacancyChange(filters.minVacancy);
    if (onGendersChange) onGendersChange(filters.genders);
    if (onAgesChange) onAgesChange(filters.ages);
    if (onGameFormatsChange) onGameFormatsChange(filters.gameFormats);
    if (filters.hideClosed !== undefined && onHideClosedChange) onHideClosedChange(filters.hideClosed);
  };

  // Label Helpers
  const getLocationLabel = () => {
    if (selectedLocations.length === 0) return "지역";
    const first = selectedLocations[0].split(' ')[1] || selectedLocations[0]; // Show district name only if possible
    return selectedLocations.length === 1 ? first : `${first} 외 ${selectedLocations.length - 1}`;
  };

  const getStartTimeLabel = () => {
    if (!startTimeRange) return "시작 시간";
    return `${startTimeRange[0]}시~${startTimeRange[1]}시`;
  };

  const getDetailLabel = () => {
    // Count active detailed filters (hideClosed는 기본값이므로 제외)
    let count = 0;
    if (selectedPositions.length > 0) count++;
    if (minVacancy !== null && minVacancy > 0) count++;
    if (selectedGenders.length > 0) count++;
    if (selectedAges.length > 0) count++;
    if (selectedGameFormats.length > 0) count++;
    // hideClosed는 기본 동작이므로 카운트에서 제외
    return count > 0 ? `상세 (${count})` : "상세";
  };

  return (
    <>
      {/* 1. Sticky Top Bar: Logo & Actions */}
      <Header
        isHidden={isHeaderHidden}
        hasScrolled={hasScrolled}
        notificationSlot={notificationSlot}
      />

      {/* 2. Scrollable Section: Date Strip & Filter Bar */}
      <div className="bg-white shadow-sm border-b border-slate-100 pt-2">
        {/* Date Strip */}
        <DateStrip
          dates={calendarDates}
          selectedDate={selectedDateISO}
          onSelect={onDateSelect}
          showAllOption={true}
        />

        <Separator className="bg-slate-200 mt-1.5" />

        {/* Integrated Filter Bar */}
        <div className="px-4 pt-1.5 pb-1.5 flex gap-2 overflow-x-auto no-scrollbar bg-white w-full items-center">

        {/* (A) Location Filter */}
        <Chip 
          label={getLocationLabel()}
          variant="orange"
          isActive={selectedLocations.length > 0}
          hasDropdown={true}
          showCheckIcon={false}
          onClick={() => setIsLocationOpen(true)}
          className="shrink-0"
        />
        <RegionFilterModal
          open={isLocationOpen}
          onOpenChange={setIsLocationOpen}
          onApply={handleLocationApply}
          selectedRegions={selectedLocations}
        />

        {/* (B) Start Time Filter */}
        {onStartTimeRangeChange && (
          <>
            <Chip
              label={getStartTimeLabel()}
              variant="orange"
              isActive={startTimeRange !== null}
              hasDropdown={true}
              showCheckIcon={false}
              onClick={() => setIsStartTimeOpen(true)}
              className="shrink-0"
            />
            <StartTimeFilterModal
              open={isStartTimeOpen}
              onOpenChange={setIsStartTimeOpen}
              startTimeRange={startTimeRange}
              onApply={handleStartTimeApply}
            />
          </>
        )}

        {/* (C) Price Filter */}
        {onPriceMaxChange && (
          <PriceFilter
            selectedPriceMax={selectedPriceMax}
            onPriceMaxChange={onPriceMaxChange}
          />
        )}

        {/* (D) Detailed Filter (Now includes Position, Vacancy & HideClosed) */}
        <Chip
          label={getDetailLabel()}
          variant="orange"
          isActive={
            selectedPositions.length > 0 ||
            (minVacancy !== null && minVacancy > 0) ||
            selectedGenders.length > 0 ||
            selectedAges.length > 0 ||
            selectedGameFormats.length > 0
          }
          hasDropdown={true}
          showCheckIcon={false}
          onClick={() => setIsDetailOpen(true)}
          className="shrink-0"
        />
        <DetailedFilterModal
            open={isDetailOpen}
            onOpenChange={setIsDetailOpen}
            selectedPositions={selectedPositions}
            onPositionsChange={onPositionsChange}
            minVacancy={minVacancy}
            onMinVacancyChange={onMinVacancyChange}
            selectedGenders={selectedGenders || []}
            selectedAges={selectedAges || []}
            selectedGameFormats={selectedGameFormats || []}
            hideClosed={hideClosed}
            onHideClosedChange={onHideClosedChange}
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
            if (onStartTimeRangeChange) onStartTimeRangeChange(null);
            if (onPriceMaxChange) onPriceMaxChange(null);
            if (onMinVacancyChange) onMinVacancyChange(null);
            if (onGendersChange) onGendersChange([]);
            if (onAgesChange) onAgesChange([]);
            if (onGameFormatsChange) onGameFormatsChange([]);
            if (onHideClosedChange) onHideClosedChange(true);
          }}
          className="h-8 px-2 text-xs text-slate-400 hover:text-slate-600 hover:bg-transparent shrink-0 ml-auto flex items-center gap-1"
        >
          초기화
          <RotateCcw className="w-3.5 h-3.5" />
        </Button>
      </div>
      </div>
    </>
  );
}
