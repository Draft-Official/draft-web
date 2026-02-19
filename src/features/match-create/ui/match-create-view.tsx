'use client';

import { FormProvider } from 'react-hook-form';
import { RefreshCw, Zap, X, Loader2 } from 'lucide-react';

import { Button } from '@/shared/ui/base/button';

import { MatchCreateBasicInfo } from './components/match-create-basic-info';
import { MatchCreateFacilities } from './components/match-create-facilities';
import { MatchCreateRecruitment } from './components/match-create-recruitment';
import { MatchCreateSpecs } from './components/match-create-specs';
import { MatchCreateGameFormat } from './components/match-create-game-format';
import { MatchCreateOperations } from './components/match-create-operations';
import { RecentMatchesDialog } from './components/recent-matches-dialog';
import { useMatchCreateViewModel } from '@/features/match-create/model/use-match-create-view-model';

export function MatchCreateView() {
  const {
    methods,
    isEditMode,
    isLoadingEditData,
    showTip,
    handleDismissTip,
    onBack,

    selectedDate,
    setSelectedDate,
    calendarDates,

    location,
    locationData,
    locationSearchResults,
    showLocationDropdown,
    isExistingGym,
    handleLocationSearch,
    handleLocationSelect,
    handleClearLocation,
    openKakaoMap,
    handleInputFocus,
    locationDivRef,

    feeType,
    setFeeType,
    hasBeverage,
    setHasBeverage,

    hasWater,
    setHasWater,
    hasAcHeat,
    setHasAcHeat,
    hasBall,
    setHasBall,
    parkingCost,
    setParkingCost,
    parkingDetail,
    setParkingDetail,
    hasShower,
    setHasShower,
    courtSize,
    setCourtSize,

    isPositionMode,
    setIsPositionMode,
    isFlexBigman,
    setIsFlexBigman,
    positions,
    updatePosition,
    totalCount,
    updateTotalCount,

    matchFormat,
    setMatchFormat,
    gender,
    setGender,
    levelMin,
    levelMax,
    handleLevelChange,
    selectedAges,
    handleAgeSelection,
    handleAgeRangeUpdate,

    gameFormatType,
    setGameFormatType,
    isGameFormatSelected,
    setIsGameFormatSelected,
    ruleMinutes,
    setRuleMinutes,
    ruleQuarters,
    setRuleQuarters,
    ruleGames,
    setRuleGames,
    isRulesSelected,
    setIsRulesSelected,
    refereeType,
    setRefereeType,
    isRefereeSelected,
    setIsRefereeSelected,

    currentUser,
    myTeams,

    isPending,
    onSubmit,

    showRecentMatchesDialog,
    setShowRecentMatchesDialog,
    recentMatches,
    isLoadingRecentMatches,
    handleSelectRecentMatch,
  } = useMatchCreateViewModel();

  const { handleSubmit } = methods;

  return (
    <FormProvider {...methods}>
      <div className="min-h-screen bg-slate-100 app-content-container relative font-sans">
        <header className="bg-white px-4 h-14 flex items-center justify-between border-b border-slate-100 sticky top-0 z-30">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={onBack}
              className="-ml-2 p-2 text-slate-900 hover:bg-slate-50 rounded-full transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
            <h1 className="font-bold text-lg text-slate-900">
              {isEditMode ? '경기 수정' : '경기 개설'}
            </h1>
          </div>

          {!isEditMode && (
            <div className="flex gap-2 relative">
              <button
                type="button"
                onClick={() => setShowRecentMatchesDialog(true)}
                className="text-xs font-bold text-primary flex items-center gap-1 bg-[var(--color-bg-brand-weak)] px-2.5 py-1.5 rounded-full hover:bg-[var(--color-bg-brand-weak-pressed)] transition-colors"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                최근 경기 불러오기
              </button>
            </div>
          )}
        </header>

        {isLoadingEditData && (
          <div className="fixed inset-0 bg-white/80 z-50 flex items-center justify-center">
            <div className="flex flex-col items-center gap-3">
              <Loader2 className="w-8 h-8 text-primary animate-spin" />
              <p className="text-sm text-slate-600">경기 정보를 불러오는 중...</p>
            </div>
          </div>
        )}

        {showTip && !isEditMode && (
          <div className="mx-3 mt-3 p-3 bg-[var(--color-bg-brand-weak)] rounded-xl flex items-center gap-3 relative animate-in fade-in slide-in-from-top-2 duration-300">
            <Zap className="w-5 h-5 text-primary flex-shrink-0 fill-orange-500" />
            <p className="text-sm font-bold text-[var(--color-fg-brand-contrast)] pr-6">
              딱 한 번만 작성하세요! 다음부턴 '불러오기'로 3초만에 개설가능!
            </p>
            <button
              onClick={handleDismissTip}
              className="absolute top-2 right-2 p-1 text-orange-400 hover:text-[var(--color-fg-brand)] transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-2 px-3 pt-3">
          <div id="section-basic-info">
            <MatchCreateBasicInfo
              selectedDate={selectedDate}
              setSelectedDate={setSelectedDate}
              calendarDates={calendarDates}
              location={location}
              handleLocationSearch={handleLocationSearch}
              handleInputFocus={handleInputFocus}
              showLocationDropdown={showLocationDropdown}
              locationSearchResults={locationSearchResults}
              handleLocationSelect={handleLocationSelect}
              locationData={locationData}
              openKakaoMap={openKakaoMap}
              locationInputRef={locationDivRef}
              feeType={feeType}
              setFeeType={setFeeType}
              hasBeverage={hasBeverage}
              setHasBeverage={setHasBeverage}
              isExistingGym={isExistingGym}
              onClearLocation={handleClearLocation}
            >
              <MatchCreateFacilities
                hasWater={hasWater} setHasWater={setHasWater}
                hasAcHeat={hasAcHeat} setHasAcHeat={setHasAcHeat}
                hasBall={hasBall} setHasBall={setHasBall}
                parkingCost={parkingCost} setParkingCost={setParkingCost}
                parkingDetail={parkingDetail} setParkingDetail={setParkingDetail}
                hasShower={hasShower} setHasShower={setHasShower}
                courtSize={courtSize} setCourtSize={setCourtSize}
                isExistingGym={isExistingGym}
              />
            </MatchCreateBasicInfo>
          </div>

          <div id="section-recruitment">
            <MatchCreateRecruitment
              isPositionMode={isPositionMode} setIsPositionMode={setIsPositionMode}
              isFlexBigman={isFlexBigman} setIsFlexBigman={setIsFlexBigman}
              positions={positions} updatePosition={updatePosition}
              totalCount={totalCount} updateTotalCount={updateTotalCount}
            />
          </div>

          <div id="section-match-specs">
            <MatchCreateSpecs
              matchFormat={matchFormat} setMatchFormat={setMatchFormat}
              gender={gender} setGender={setGender}
              levelMin={levelMin} levelMax={levelMax} onLevelChange={handleLevelChange}
              selectedAges={selectedAges} handleAgeSelection={handleAgeSelection}
              handleAgeRangeUpdate={handleAgeRangeUpdate}
            />
          </div>

          <MatchCreateGameFormat
            gameFormatType={gameFormatType} setGameFormatType={setGameFormatType}
            isGameFormatSelected={isGameFormatSelected} setIsGameFormatSelected={setIsGameFormatSelected}
            ruleMinutes={ruleMinutes} setRuleMinutes={setRuleMinutes}
            ruleQuarters={ruleQuarters} setRuleQuarters={setRuleQuarters}
            ruleGames={ruleGames} setRuleGames={setRuleGames}
            isRulesSelected={isRulesSelected} setIsRulesSelected={setIsRulesSelected}
            refereeType={refereeType} setRefereeType={setRefereeType}
            isRefereeSelected={isRefereeSelected} setIsRefereeSelected={setIsRefereeSelected}
          />

          <div id="section-operations">
            <MatchCreateOperations user={currentUser} teams={myTeams} />
          </div>

          <div className="bg-white px-5 pt-6 pb-[120px] ">
            <Button
              type="submit"
              disabled={isPending || isLoadingEditData}
              className="w-full h-14 text-lg font-bold bg-primary hover:bg-primary/90 text-white rounded-xl shadow-lg shadow-orange-100 disabled:opacity-50"
            >
              {isPending
                ? (isEditMode ? '수정 중...' : '생성 중...')
                : (isEditMode ? '경기 수정하기' : '경기 생성하기')
              }
            </Button>
          </div>
        </form>

        <RecentMatchesDialog
          open={showRecentMatchesDialog}
          onOpenChange={setShowRecentMatchesDialog}
          matches={recentMatches || []}
          isLoading={isLoadingRecentMatches}
          onSelect={handleSelectRecentMatch}
        />
      </div>
    </FormProvider>
  );
}
