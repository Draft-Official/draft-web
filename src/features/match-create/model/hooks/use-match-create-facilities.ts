import { useEffect, useState } from 'react';
import type { CourtSizeValue } from '@/shared/config/match-constants';
import type { GymFacilities } from '@/shared/types/jsonb.types';

interface UseMatchCreateFacilitiesParams {
  gymFacilities: GymFacilities | null;
  isExistingGym: boolean;
}

export function useMatchCreateFacilities({
  gymFacilities,
  isExistingGym,
}: UseMatchCreateFacilitiesParams) {
  const [parkingCost, setParkingCost] = useState<string>('');
  const [parkingDetail, setParkingDetail] = useState('');
  const [hasWater, setHasWater] = useState(false);
  const [hasAcHeat, setHasAcHeat] = useState(false);
  const [hasBall, setHasBall] = useState(false);
  const [hasBeverage, setHasBeverage] = useState(false);
  const [hasShower, setHasShower] = useState(false);
  const [courtSize, setCourtSize] = useState<CourtSizeValue | ''>('');

  useEffect(() => {
    if (gymFacilities) {
      setHasBall(gymFacilities.ball ?? false);
      setHasWater(gymFacilities.water_purifier ?? false);
      setHasAcHeat(gymFacilities.air_conditioner ?? false);
      setHasShower(gymFacilities.shower ?? false);

      if (gymFacilities.parking) {
        let parkingFee = gymFacilities.parking_fee ?? '0';
        if (parkingFee === '무료') {
          parkingFee = '0';
        }
        setParkingCost(parkingFee);
      } else {
        setParkingCost('');
      }
      setParkingDetail(gymFacilities.parking_location ?? '');

      if (gymFacilities.court_size_type) {
        setCourtSize(gymFacilities.court_size_type);
      } else {
        setCourtSize('');
      }
      return;
    }

    if (gymFacilities === null && !isExistingGym) {
      setHasBall(false);
      setHasWater(false);
      setHasAcHeat(false);
      setHasShower(false);
      setParkingCost('');
      setParkingDetail('');
      setCourtSize('');
    }
  }, [gymFacilities, isExistingGym]);

  return {
    parkingCost,
    setParkingCost,
    parkingDetail,
    setParkingDetail,
    hasWater,
    setHasWater,
    hasAcHeat,
    setHasAcHeat,
    hasBall,
    setHasBall,
    hasBeverage,
    setHasBeverage,
    hasShower,
    setHasShower,
    courtSize,
    setCourtSize,
  };
}
