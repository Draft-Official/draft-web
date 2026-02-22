import { useEffect, useState } from 'react';
import { toast } from '@/shared/ui/shadcn/sonner';
import type { MatchCreatePrefillDTO } from '@/features/match-create/model/types';

interface UseMatchCreateEditPrefillLoaderParams {
  isEditMode: boolean;
  editPrefillData: MatchCreatePrefillDTO | null | undefined;
  fillFromRecentMatch: (match: MatchCreatePrefillDTO) => Promise<void>;
  setSelectedDate: (date: string | null) => void;
}

export function useMatchCreateEditPrefillLoader({
  isEditMode,
  editPrefillData,
  fillFromRecentMatch,
  setSelectedDate,
}: UseMatchCreateEditPrefillLoaderParams) {
  const [isApplyingEditData, setIsApplyingEditData] = useState(false);
  const [editDataLoaded, setEditDataLoaded] = useState(false);

  useEffect(() => {
    const loadEditData = async () => {
      if (!isEditMode || !editPrefillData || editDataLoaded) return;

      setIsApplyingEditData(true);
      try {
        await fillFromRecentMatch(editPrefillData);

        if (editPrefillData.startTimeISO) {
          const dateISO = editPrefillData.startTimeISO.split('T')[0];
          setSelectedDate(dateISO);
        }

        setEditDataLoaded(true);
      } catch (error) {
        console.error('Failed to load match data:', error);
        toast.error('경기 정보를 불러오는데 실패했습니다.');
      } finally {
        setIsApplyingEditData(false);
      }
    };

    loadEditData();
  }, [isEditMode, editPrefillData, editDataLoaded, fillFromRecentMatch, setSelectedDate]);

  return {
    isApplyingEditData,
  };
}
