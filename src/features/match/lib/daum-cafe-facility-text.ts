import { COURT_SIZE_LABELS } from '@/shared/config/match-constants';

interface BuildDaumCafeFacilityTextInput {
  facilities?: Record<string, unknown> | null;
  providesBeverage?: boolean | null;
}

function readTrimmedString(value: unknown): string | null {
  if (typeof value !== 'string') return null;
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : null;
}

function isFreeParkingFee(fee: string | null): boolean {
  if (!fee) return true;
  const normalized = fee.replace(/\s+/gu, '');
  return normalized === '무료' || normalized === '0' || normalized === '0원' || normalized === '무료주차';
}

function toFacilitiesRecord(facilities: Record<string, unknown> | null | undefined): Record<string, unknown> {
  if (!facilities || typeof facilities !== 'object') return {};
  return facilities;
}

export function buildDaumCafeParkingText(facilities: Record<string, unknown> | null | undefined): string | null {
  const safeFacilities = toFacilitiesRecord(facilities);
  const parking = safeFacilities.parking;
  const parkingFee = readTrimmedString(safeFacilities.parking_fee);
  const parkingLocation = readTrimmedString(safeFacilities.parking_location);

  let parkingSummary: string | null = null;

  if (typeof parking === 'boolean') {
    if (parking) {
      parkingSummary = isFreeParkingFee(parkingFee)
        ? '무료'
        : `유료 (${parkingFee})`;
    } else {
      parkingSummary = '불가';
    }
  } else if (parking === 'free') {
    parkingSummary = '무료';
  } else if (parking === 'paid') {
    parkingSummary = parkingFee ? `유료 (${parkingFee})` : '유료';
  } else if (parking === 'impossible') {
    parkingSummary = '불가';
  }

  if (!parkingSummary && !parkingLocation) return null;
  if (!parkingSummary && parkingLocation) return `주차 위치: ${parkingLocation}`;
  if (!parkingLocation) return `주차: ${parkingSummary}`;
  return `주차: ${parkingSummary} / 주차 위치: ${parkingLocation}`;
}

export function buildDaumCafeFacilityText({
  facilities,
  providesBeverage,
}: BuildDaumCafeFacilityTextInput): string {
  const safeFacilities = toFacilitiesRecord(facilities);
  const notes: string[] = [];

  if (safeFacilities.court_size_type && typeof safeFacilities.court_size_type === 'string') {
    const size = COURT_SIZE_LABELS[safeFacilities.court_size_type as keyof typeof COURT_SIZE_LABELS];
    if (size) notes.push(size.label);
  }

  const parkingText = buildDaumCafeParkingText(safeFacilities);
  if (parkingText) notes.push(parkingText);

  if (safeFacilities.shower === true) notes.push('온수샤워 가능');
  if (safeFacilities.air_conditioner === true) notes.push('냉난방 가능');
  if (safeFacilities.water_purifier === true) notes.push('정수기 이용 가능');
  if (safeFacilities.ball === true) notes.push('공 제공');
  if (providesBeverage) notes.push('물/음료 제공');

  return notes.length > 0 ? notes.join(', ') : '시설 정보 없음';
}
