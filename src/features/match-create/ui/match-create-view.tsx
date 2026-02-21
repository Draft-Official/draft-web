'use client';

import { FormProvider } from 'react-hook-form';
import { RefreshCw, Zap, X } from 'lucide-react';
import { Spinner } from '@/shared/ui/shadcn/spinner';

import { Button } from '@/shared/ui/shadcn/button';

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

    locationData,
    isExistingGym,
    handleLocationResolvedChange,
    handleInputFocus,

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
      <div className="min-h-screen bg-white app-content-container relative font-sans">
        <header className="sticky top-0 z-40 bg-white border-b border-slate-100 h-14 flex items-center justify-between px-4">
          <button
            type="button"
            onClick={onBack}
            className="p-2 text-slate-900 hover:bg-slate-50 rounded-full transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
          <h1 className="text-lg font-bold text-slate-900">
            {isEditMode ? '경기 수정' : '경기 개설'}
          </h1>
          {!isEditMode ? (
            <button
              type="button"
              onClick={() => setShowRecentMatchesDialog(true)}
              className="text-xs font-bold text-muted-foreground flex items-center gap-1 bg-brand-weak px-2.5 py-1.5 rounded-full hover:bg-brand-weak-pressed transition-colors"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              불러오기
            </button>
          ) : (
            <div className="w-10" />
          )}
        </header>

        {isLoadingEditData && (
          <div className="fixed inset-0 bg-white/80 z-50 flex items-center justify-center">
            <div className="flex flex-col items-center gap-3">
              <Spinner className="w-8 h-8 text-muted-foreground" />
              <p className="text-sm text-muted-foreground">경기 정보를 불러오는 중...</p>
            </div>
          </div>
        )}

        {isPending && !isEditMode && (
          <div className="fixed inset-0 bg-white/90 z-50 flex items-center justify-center">
            <div className="flex flex-col items-center gap-3">
              <Spinner className="w-8 h-8 text-primary" />
              <p className="text-sm font-bold text-slate-700">경기 생성 중...</p>
            </div>
          </div>
        )}

        {showTip && !isEditMode && (
          <div className="mx-5 mt-3 p-3 bg-brand-weak rounded-xl flex items-center gap-3 relative animate-in fade-in slide-in-from-top-2 duration-300">
            <Zap className="w-5 h-5 text-muted-foreground flex-shrink-0 fill-draft-500" />
            <p className="text-sm font-bold text-brand-contrast pr-6">
              딱 한 번만 작성하세요! 다음부턴 &apos;불러오기&apos;로 3초만에 개설가능!
            </p>
            <button
              onClick={handleDismissTip}
              className="absolute top-2 right-2 p-1 text-draft-400 hover:text-brand transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)}>
          <div id="section-basic-info">
            <MatchCreateBasicInfo
              selectedDate={selectedDate}
              setSelectedDate={setSelectedDate}
              calendarDates={calendarDates}
              locationData={locationData}
              onLocationResolvedChange={handleLocationResolvedChange}
              handleInputFocus={handleInputFocus}
              feeType={feeType}
              setFeeType={setFeeType}
              hasBeverage={hasBeverage}
              setHasBeverage={setHasBeverage}
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

          <div className="h-2 bg-slate-100" />

          <div id="section-recruitment">
            <MatchCreateRecruitment
              isPositionMode={isPositionMode} setIsPositionMode={setIsPositionMode}
              isFlexBigman={isFlexBigman} setIsFlexBigman={setIsFlexBigman}
              positions={positions} updatePosition={updatePosition}
              totalCount={totalCount} updateTotalCount={updateTotalCount}
            />
          </div>

          <div className="h-2 bg-slate-100" />

          <div id="section-match-specs">
            <MatchCreateSpecs
              matchFormat={matchFormat} setMatchFormat={setMatchFormat}
              gender={gender} setGender={setGender}
              levelMin={levelMin} levelMax={levelMax} onLevelChange={handleLevelChange}
              selectedAges={selectedAges} handleAgeSelection={handleAgeSelection}
              handleAgeRangeUpdate={handleAgeRangeUpdate}
            />
          </div>

          <div className="h-2 bg-slate-100" />

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

          <div className="h-2 bg-slate-100" />

          <div id="section-operations">
            <MatchCreateOperations user={currentUser} teams={myTeams} />
          </div>

          <div className="px-5 pt-6 pb-30">
            <Button
              type="submit"
              disabled={isPending || isLoadingEditData}
              className="w-full h-14 text-lg font-bold bg-primary hover:bg-primary/90 text-white rounded-xl shadow-lg shadow-draft-100 disabled:opacity-50"
            >
              {isEditMode ? (isPending ? '수정 중...' : '경기 수정하기') : '경기 생성하기'}
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
